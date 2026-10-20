"""Dependency-free release hygiene checks. Never print matched secret values.

Scans tracked + nonignored candidate files; --history also scans reachable blobs.
This is a bounded signature/content review aid, not an exhaustive secret detector.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    "google-api-key": re.compile(r"AIza[0-9A-Za-z_-]{35}"),
    "github-token": re.compile(r"(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})"),
    "openai-token": re.compile(r"sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}"),
    "aws-access-key": re.compile(r"(?:AKIA|ASIA)[A-Z0-9]{16}"),
    "private-key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "credential-url": re.compile(r"https?://[^\s/@:]+:[^\s/@]+@"),
    "assigned-credential": re.compile(r"(?i)\b(?:AI_API_KEY|SECRET_KEY|ACCESS_TOKEN|CLIENT_SECRET|PASSWORD)[ \t]*[:=][ \t]*[\"']?([^\s\"'#,;}]+)"),
}
PERSONAL_PATH = re.compile(r"(?:[A-Za-z]:[\\/]+Users[\\/]+[^\\/\s]+|/(?:Users|home)/[^/\s]+)")
PLACEHOLDERS = {"", "your_key_from_google_ai_studio", "test-only", "fake-test-only", "fake-secret-not-for-logs", "null", "none"}


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT)


def secret_findings(text):
    result = []
    for category, pattern in PATTERNS.items():
        for match in pattern.finditer(text):
            if category == "assigned-credential" and match.group(1).lower() in PLACEHOLDERS:
                continue
            result.append((category, text.count("\n", 0, match.start()) + 1))
    return result


def candidates():
    return sorted(set(git("ls-files", "-z", "--cached", "--others", "--exclude-standard").decode().rstrip("\0").split("\0")) - {""})


def prohibited_path(name):
    path = Path(name)
    return (
        (path.name.startswith(".env") and path.name != ".env.example")
        or bool(re.search(r"\.(?:db|sqlite|sqlite3)(?:-|$)", path.name))
        or path.suffix.lower() in {".pem", ".p12", ".pfx", ".log", ".tmp", ".tsbuildinfo"}
        or path.name in {"id_rsa", "id_ed25519", ".npmrc", ".pypirc"}
        or any(part in {"node_modules", ".venv", ".pytest_cache", "__pycache__", "dist", "test-results", "playwright-report"} for part in path.parts)
    )


def history_scan():
    objects = [line.split()[0] for line in git("rev-list", "--objects", "--all").splitlines()]
    data = subprocess.check_output(["git", "cat-file", "--batch"], input=b"\n".join(objects) + b"\n", cwd=ROOT)
    cursor, count, findings = 0, 0, []
    for _ in objects:
        end = data.index(b"\n", cursor)
        sha, kind, size = data[cursor:end].split()
        cursor = end + 1
        blob = data[cursor:cursor + int(size)]
        cursor += int(size) + 1
        if kind == b"blob":
            count += 1
            findings.extend((sha.decode(), category, line) for category, line in secret_findings(blob.decode("utf-8", errors="replace")))
    return count, findings


def self_test():
    assert secret_findings("AI_API_KEY=" + "\nAI_PROVIDER=deterministic") == []
    assert secret_findings("AI_API_KEY=fake-test-only") == []
    for value in ["AIza" + "A" * 35, "ghp_" + "A" * 36, "sk-" + "A" * 40, "AI_API_KEY=" + "unexpected-credential"]:
        assert secret_findings(value)
    assert prohibited_path("backend/data/demo.db-wal")
    assert prohibited_path(".env.local")
    assert not prohibited_path(".env.example")
    assert not prohibited_path("backend/data/sample_mentions.json")
    print("Release-check self-test passed")


def run(history):
    files, errors, links, images = candidates(), [], 0, 0
    for name in files:
        path = ROOT / name
        if prohibited_path(name):
            errors.append(f"prohibited-file: {name}")
        if not path.is_file():
            errors.append(f"missing-file: {name}")
            continue
        raw = path.read_bytes()
        if path.suffix.lower() != ".png":
            try:
                raw.decode("utf-8")
            except UnicodeDecodeError:
                errors.append(f"invalid-utf8: {name}")
        text = raw.decode("utf-8", errors="replace")
        for category, line in secret_findings(text):
            errors.append(f"credential-signature: {name}:{line} ({category}; value withheld)")
        if raw.startswith(b"SQLite format 3\0"):
            errors.append(f"sqlite-content: {name}")
        if PERSONAL_PATH.search(text):
            errors.append(f"personal-filesystem-path: {name}")
        if path.suffix.lower() == ".png":
            images += 1
            if not raw.startswith(b"\x89PNG\r\n\x1a\n"):
                errors.append(f"invalid-png: {name}")
        if path.suffix.lower() == ".md":
            # Check ordinary local Markdown targets, not remote URLs or anchors.
            for target in re.findall(r"!?\[[^\]]*\]\(([^)]+)\)", text):
                target = target.strip().strip("<>")
                if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
                    continue
                links += 1
                dest = path.parent / unquote(target.split("#")[0])
                if not dest.exists():
                    errors.append(f"broken-local-link: {name} -> {target}")
    examples = json.loads((ROOT / "backend/data/sample_mentions.json").read_text(encoding="utf-8"))
    if len(examples) != 5 or any(row.get("is_sample") is not True or row.get("source_url") is not None for row in examples):
        errors.append("fictional-sample-contract: expected five explicitly fictional records with no authentic source URLs")
    manifest = json.loads((ROOT / "frontend/package.json").read_text(encoding="utf-8"))
    lock = json.loads((ROOT / "frontend/package-lock.json").read_text(encoding="utf-8"))
    for key in ("dependencies", "devDependencies"):
        if manifest[key] != lock["packages"][""][key]:
            errors.append(f"lockfile-manifest-mismatch: {key}")
    ignored_examples = [
        ".env", ".env.local", "backend/data/release-check.db", "backend/data/release-check.db-wal",
        "backend/data/release-check.db-shm", "frontend/tsconfig.app.tsbuildinfo",
        "frontend/playwright-report/index.html", "frontend/test-results/trace.zip",
    ]
    ignored = subprocess.check_output(
        ["git", "check-ignore", "--no-index", "--stdin"], cwd=ROOT,
        input=("\n".join(ignored_examples) + "\n").encode(),
    ).decode().splitlines()
    if set(ignored) != set(ignored_examples):
        errors.append("ignore-contract: expected private/generated paths to be ignored")
    print(f"Candidate files checked: {len(files)}; local Markdown links: {links}; PNG signatures: {images}")
    if history:
        count, hits = history_scan()
        print(f"Reachable Git history blobs scanned: {count}")
        errors.extend(f"history-credential-signature: blob {sha}:{line} ({category}; value withheld)" for sha, category, line in hits)
    for error in errors:
        print(error)
    print(f"Release-check findings: {len(errors)}")
    return bool(errors)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--history", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        raise SystemExit(run(args.history))

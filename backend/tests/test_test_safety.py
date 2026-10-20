import os
import socket
import subprocess
import sys
from pathlib import Path

import httpx
import pytest

from app.services.llm import analyze_mention


def test_guard_probe():
    assert os.environ["AI_PROVIDER"] == "deterministic"
    assert os.environ["AI_API_KEY"] == ""
    assert os.environ["PYTHON_DOTENV_DISABLED"] == "1"
    assert analyze_mention("Aurora", "Aurora headphones are fantastic").method == "deterministic"
    with pytest.raises(AssertionError, match="forbidden"):
        httpx.get("https://generativelanguage.googleapis.com/v1beta/models")
    with socket.socket() as sock:
        with pytest.raises(AssertionError, match="forbidden"):
            sock.connect(("127.0.0.1", 9))


def test_ordinary_pytest_is_offline_with_inherited_gemini():
    env = dict(os.environ, AI_PROVIDER="gemini", AI_API_KEY="fake-test-only",
               PYTHON_DOTENV_DISABLED="0")
    completed = subprocess.run(
        [sys.executable, "-m", "pytest", "tests/test_test_safety.py", "-k", "guard_probe", "-q"],
        cwd=Path(__file__).resolve().parents[1], env=env,
        capture_output=True, text=True, timeout=30,
    )
    assert completed.returncode == 0, completed.stdout + completed.stderr
    assert "1 passed" in completed.stdout

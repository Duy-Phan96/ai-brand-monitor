"""Offline policy installed before test-module imports, including collection."""
import os
import socket
import threading
from unittest.mock import patch

import httpx
import pytest

# Ignore local dotenv and hostile inherited process settings before app imports.
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["AI_PROVIDER"] = "deterministic"
os.environ["AI_API_KEY"] = ""
os.environ.pop("AI_TIMEOUT_SECONDS", None)


@pytest.fixture(autouse=True)
def isolated_database(tmp_path, monkeypatch):
    """No test may fall back to the developer's database, even on collection changes."""
    monkeypatch.setenv("BRAND_MONITOR_DB_PATH", str(tmp_path / "isolated.db"))


def _deny_network(*args, **kwargs):
    raise AssertionError("External network access is forbidden in automated tests")


_guards = []
_internal = threading.local()
_original_connect = socket.socket.connect
_original_socketpair = socket.socketpair


def _guard_connect(sock, address):
    if getattr(_internal, "socketpair", False):
        return _original_connect(sock, address)
    return _deny_network()


def _local_socketpair(*args, **kwargs):
    # Windows asyncio uses a loopback socketpair for internal wakeups.
    _internal.socketpair = True
    try:
        return _original_socketpair(*args, **kwargs)
    finally:
        _internal.socketpair = False



def pytest_sessionstart(session):
    for target in ("socket.socket.connect_ex",
                   "httpx.HTTPTransport.handle_request",
                   "httpx.AsyncHTTPTransport.handle_async_request"):
        guard = patch(target, _deny_network)
        guard.start()
        _guards.append(guard)
    for target, replacement in (("socket.socket.connect", _guard_connect),
                                ("socket.socketpair", _local_socketpair)):
        guard = patch(target, replacement)
        guard.start()
        _guards.append(guard)


def pytest_sessionfinish(session, exitstatus):
    for guard in reversed(_guards):
        guard.stop()

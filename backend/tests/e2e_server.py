"""Test-only server: temporary database, no dotenv/credentials, no outbound HTTP."""
import os
from pathlib import Path
import socket
import sys
from tempfile import TemporaryDirectory
from unittest.mock import patch

os.environ.update(AI_PROVIDER="deterministic", AI_API_KEY="", PYTHON_DOTENV_DISABLED="1")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import httpx
import uvicorn
from app.main import app
from app.core.database import connect, initialize_database


def denied(*args, **kwargs):
    raise AssertionError("External network is forbidden in E2E backend")


original_connect = socket.socket.connect

def loopback_only(sock, address):
    if isinstance(address, tuple) and address[0] in ("127.0.0.1", "::1"):
        return original_connect(sock, address)
    return denied()


@app.post("/__test/reset")
def reset():
    initialize_database()
    with connect() as connection:
        connection.execute("DELETE FROM mentions")
    return {"reset": True}


if __name__ == "__main__":
    with TemporaryDirectory(prefix="brand-monitor-e2e-") as directory:
        os.environ["BRAND_MONITOR_DB_PATH"] = str(Path(directory) / "isolated.db")
        with patch("httpx.HTTPTransport.handle_request", denied), \
             patch("httpx.AsyncHTTPTransport.handle_async_request", denied), \
             patch("socket.socket.connect", loopback_only), \
             patch("socket.socket.connect_ex", denied):
            uvicorn.run(app, host="127.0.0.1", port=8011)

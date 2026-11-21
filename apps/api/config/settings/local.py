"""Local development settings. Loads apps/api/.env (gitignored)."""

from pathlib import Path

from ._env import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

from .base import *  # noqa: E402, F403

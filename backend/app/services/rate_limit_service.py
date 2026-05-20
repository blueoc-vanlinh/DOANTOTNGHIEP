import time
from collections import defaultdict, deque

from fastapi import HTTPException


_attempts: dict[str, deque[float]] = defaultdict(deque)


def check_rate_limit(key: str, limit: int = 5, window_seconds: int = 60):
    now = time.time()
    attempts = _attempts[key]

    while attempts and now - attempts[0] > window_seconds:
        attempts.popleft()

    if len(attempts) >= limit:
        raise HTTPException(status_code=429, detail="Too many login attempts")

    attempts.append(now)

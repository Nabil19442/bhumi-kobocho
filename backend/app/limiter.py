"""
In-Memory Thread-Safe Rate Limiter for Bhumi Kobocho API.

Note:
- Designed for single-process hackathon deployments.
- State is held in-process; limits are enforced per-process instance.
- Thread-safe via threading.Lock.
"""

import time
import threading
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status


class InMemoryRateLimiter:
    def __init__(self):
        self._lock = threading.Lock()
        # Storage: endpoint_key -> { client_ip: [timestamp1, timestamp2, ...] }
        self._requests: Dict[str, Dict[str, List[float]]] = {}

    def get_client_ip(self, request: Request) -> str:
        """
        Safely determine client IP without blindly trusting spoofable forward headers.
        Uses client.host directly.
        """
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def check_rate_limit(
        self,
        request: Request,
        key: str,
        max_requests: int,
        window_seconds: int = 60,
    ) -> None:
        """
        Sliding window rate limit check.
        Raises HTTPException(429) if exceeded.
        """
        client_ip = self.get_client_ip(request)
        now = time.time()
        window_start = now - window_seconds

        with self._lock:
            if key not in self._requests:
                self._requests[key] = {}
            
            client_history = self._requests[key].setdefault(client_ip, [])
            
            # Prune timestamps outside window
            valid_timestamps = [t for t in client_history if t > window_start]
            
            if len(valid_timestamps) >= max_requests:
                earliest = valid_timestamps[0]
                retry_after = max(1, int(window_seconds - (now - earliest)))
                self._requests[key][client_ip] = valid_timestamps
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded for {key}. Limit: {max_requests} requests per {window_seconds}s.",
                    headers={"Retry-After": str(retry_after)},
                )
            
            valid_timestamps.append(now)
            self._requests[key][client_ip] = valid_timestamps

    def reset(self) -> None:
        """Clear all stored state (primarily for test isolation)."""
        with self._lock:
            self._requests.clear()


# Global limiter instance for application
limiter = InMemoryRateLimiter()

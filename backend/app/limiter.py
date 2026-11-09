"""
In-Memory Thread-Safe Rate Limiter for Bhumi Kobocho API.

Note:
- Designed for single-process hackathon deployments.
- State is held in-process; limits are enforced per-process instance.
- Thread-safe via threading.Lock.
- Safely resolves client IP behind reverse proxies (e.g. Render) using
  FORWARDED_ALLOW_IPS configuration, ignoring spoofed headers from untrusted peers.
"""

import os
import time
import threading
import ipaddress
from typing import Dict, List, Tuple, Optional
from fastapi import Request, HTTPException, status


class InMemoryRateLimiter:
    def __init__(self, forwarded_allow_ips: Optional[str] = None):
        self._lock = threading.Lock()
        # Storage: endpoint_key -> { client_ip: [timestamp1, timestamp2, ...] }
        self._requests: Dict[str, Dict[str, List[float]]] = {}
        self.forwarded_allow_ips = forwarded_allow_ips

    def is_proxy_trusted(self, peer_ip: str) -> bool:
        """
        Checks whether peer_ip is in the configured FORWARDED_ALLOW_IPS list.
        Supports '*', comma-separated IP addresses, and CIDR ranges.
        Defaults to '127.0.0.1' if unset.
        """
        allowed = self.forwarded_allow_ips
        if allowed is None:
            allowed = os.getenv("FORWARDED_ALLOW_IPS", "127.0.0.1")

        allowed = allowed.strip()
        if allowed == "*":
            return True

        try:
            peer_addr = ipaddress.ip_address(peer_ip)
        except ValueError:
            return False

        for target in allowed.split(","):
            target = target.strip()
            if not target:
                continue
            try:
                if "/" in target:
                    if peer_addr in ipaddress.ip_network(target, strict=False):
                        return True
                else:
                    if peer_addr == ipaddress.ip_address(target):
                        return True
            except ValueError:
                continue

        return False

    def get_client_ip(self, request: Request) -> str:
        """
        Safely determine client IP without blindly trusting spoofable forward headers.
        Only trusts X-Forwarded-For when request.client.host originates from a trusted proxy.
        """
        peer_ip = "127.0.0.1"
        if request.client and request.client.host:
            peer_ip = request.client.host

        if self.is_proxy_trusted(peer_ip):
            forwarded = request.headers.get("x-forwarded-for")
            if forwarded:
                client_candidate = forwarded.split(",")[0].strip()
                try:
                    ipaddress.ip_address(client_candidate)
                    return client_candidate
                except ValueError:
                    return peer_ip

        return peer_ip

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

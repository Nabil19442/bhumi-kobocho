"""
Tests for rate limiter proxy header awareness and IP spoofing prevention.
Verifies:
1. Two different forwarded IPs get separate rate limiting buckets behind trusted proxies.
2. Spoofed X-Forwarded-For headers from untrusted peers are ignored.
3. FORWARDED_ALLOW_IPS configuration (wildcard, CIDR, single IP).
"""

import pytest
from starlette.requests import Request
from fastapi import HTTPException
from backend.app.limiter import InMemoryRateLimiter


def make_mock_request(client_ip: str = "127.0.0.1", headers: dict = None) -> Request:
    header_list = []
    if headers:
        for k, v in headers.items():
            header_list.append((k.lower().encode("latin-1"), v.encode("latin-1")))
    
    scope = {
        "type": "http",
        "client": (client_ip, 12345),
        "headers": header_list,
        "method": "GET",
        "path": "/api/test",
    }
    return Request(scope)


def test_trusted_proxy_separate_buckets_for_different_forwarded_ips():
    # 127.0.0.1 is trusted proxy by default
    limiter = InMemoryRateLimiter(forwarded_allow_ips="127.0.0.1")

    req_client_a = make_mock_request("127.0.0.1", {"x-forwarded-for": "203.0.113.10"})
    req_client_b = make_mock_request("127.0.0.1", {"x-forwarded-for": "203.0.113.20"})

    # Client A consumes 2 requests (limit is 2)
    limiter.check_rate_limit(req_client_a, "test_key", max_requests=2, window_seconds=60)
    limiter.check_rate_limit(req_client_a, "test_key", max_requests=2, window_seconds=60)

    # Client A 3rd request fails
    with pytest.raises(HTTPException) as exc_info:
        limiter.check_rate_limit(req_client_a, "test_key", max_requests=2, window_seconds=60)
    assert exc_info.value.status_code == 429

    # Client B should still have its full bucket available
    limiter.check_rate_limit(req_client_b, "test_key", max_requests=2, window_seconds=60)
    limiter.check_rate_limit(req_client_b, "test_key", max_requests=2, window_seconds=60)

    # Client B 3rd request fails
    with pytest.raises(HTTPException) as exc_info_b:
        limiter.check_rate_limit(req_client_b, "test_key", max_requests=2, window_seconds=60)
    assert exc_info_b.value.status_code == 429


def test_untrusted_peer_spoofed_headers_ignored():
    # Only 10.0.0.1 is trusted proxy
    limiter = InMemoryRateLimiter(forwarded_allow_ips="10.0.0.1")

    # Untrusted attacker at 198.51.100.5 tries to spoof X-Forwarded-For to bypass limits
    spoofed_req_1 = make_mock_request("198.51.100.5", {"x-forwarded-for": "1.1.1.1"})
    spoofed_req_2 = make_mock_request("198.51.100.5", {"x-forwarded-for": "2.2.2.2"})

    # Both requests must be keyed to 198.51.100.5 because the peer is not trusted
    limiter.check_rate_limit(spoofed_req_1, "attack_key", max_requests=2, window_seconds=60)
    limiter.check_rate_limit(spoofed_req_2, "attack_key", max_requests=2, window_seconds=60)

    # 3rd request from attacker with a new spoofed header must be blocked by rate limit
    spoofed_req_3 = make_mock_request("198.51.100.5", {"x-forwarded-for": "3.3.3.3"})
    with pytest.raises(HTTPException) as exc:
        limiter.check_rate_limit(spoofed_req_3, "attack_key", max_requests=2, window_seconds=60)
    assert exc.value.status_code == 429


def test_cidr_and_wildcard_trusted_proxies():
    # Test CIDR block
    cidr_limiter = InMemoryRateLimiter(forwarded_allow_ips="192.168.1.0/24")
    assert cidr_limiter.is_proxy_trusted("192.168.1.50") is True
    assert cidr_limiter.is_proxy_trusted("192.168.2.50") is False

    # Test Wildcard
    wildcard_limiter = InMemoryRateLimiter(forwarded_allow_ips="*")
    assert wildcard_limiter.is_proxy_trusted("198.51.100.1") is True
    assert wildcard_limiter.is_proxy_trusted("203.0.113.1") is True

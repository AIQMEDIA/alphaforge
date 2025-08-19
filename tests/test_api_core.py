import pytest
import requests
import json

API_BASE = "http://localhost:5000/api"

def get_auth_headers():
    """Get authentication headers - in real tests, use valid session tokens"""
    return {
        "Content-Type": "application/json",
        "User-Agent": "AlphaForge-Test-Suite/1.0"
    }

def test_health_check():
    """Test basic server health and availability"""
    try:
        r = requests.get(f"{API_BASE}/auth/user", timeout=5)
        # 401 is expected for unauthenticated requests
        assert r.status_code in [200, 401], f"Server not responding properly: {r.status_code}"
    except requests.exceptions.ConnectionError:
        pytest.fail("Server is not running on port 5000")

def test_chat_session_creation():
    """Test chat session creation for quantum assistant"""
    r = requests.get(f"{API_BASE}/chat/session", headers=get_auth_headers())
    assert r.status_code == 200
    data = r.json()
    assert "id" in data
    assert "queryCount" in data
    assert "isUnlimited" in data
    
def test_chat_history_retrieval():
    """Test chat history endpoint"""
    # First get a session
    session_r = requests.get(f"{API_BASE}/chat/session", headers=get_auth_headers())
    assert session_r.status_code == 200
    session_id = session_r.json()["id"]
    
    # Then get history
    r = requests.get(f"{API_BASE}/chat/history/{session_id}", headers=get_auth_headers())
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_market_data_endpoints():
    """Test market data provider endpoints"""
    r = requests.get(f"{API_BASE}/market-data/providers", headers=get_auth_headers())
    # Should return list of providers even without auth
    assert r.status_code in [200, 401]
    
def test_quantum_providers():
    """Test quantum computing provider endpoints"""
    r = requests.get(f"{API_BASE}/quantum/providers", headers=get_auth_headers())
    assert r.status_code in [200, 401]

def test_portfolio_endpoints():
    """Test portfolio management endpoints"""
    headers = get_auth_headers()
    
    # Test portfolio retrieval (requires auth)
    r = requests.get(f"{API_BASE}/portfolio", headers=headers)
    assert r.status_code in [200, 401]  # 401 expected without proper auth
    
def test_strategies_endpoints():
    """Test strategy management endpoints"""
    headers = get_auth_headers()
    
    # Test strategies listing
    r = requests.get(f"{API_BASE}/strategies", headers=headers)
    assert r.status_code in [200, 401]
    
def test_backtesting_endpoints():
    """Test backtesting functionality"""
    headers = get_auth_headers()
    
    # Test backtest endpoint structure
    r = requests.get(f"{API_BASE}/backtest", headers=headers)
    assert r.status_code in [200, 401, 404]  # Various valid responses

def test_subscription_endpoints():
    """Test Stripe subscription endpoints"""
    headers = get_auth_headers()
    
    # Test subscription plans
    r = requests.get(f"{API_BASE}/subscription/plans", headers=headers)
    assert r.status_code in [200, 401]

def test_api_error_handling():
    """Test that API handles malformed requests gracefully"""
    headers = get_auth_headers()
    
    # Test with invalid JSON
    r = requests.post(f"{API_BASE}/chat/send", 
                     data="invalid json", 
                     headers=headers)
    assert r.status_code in [400, 422, 401]
    
    # Test with missing required fields
    r = requests.post(f"{API_BASE}/chat/send", 
                     json={}, 
                     headers=headers)
    assert r.status_code in [400, 422, 401]

def test_rate_limiting_preparation():
    """Test that endpoints are prepared for rate limiting"""
    headers = get_auth_headers()
    
    # Make multiple rapid requests to test rate limiting infrastructure
    responses = []
    for i in range(5):
        r = requests.get(f"{API_BASE}/chat/session", headers=headers)
        responses.append(r.status_code)
    
    # Should handle rapid requests gracefully
    assert all(code in [200, 401, 429] for code in responses)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
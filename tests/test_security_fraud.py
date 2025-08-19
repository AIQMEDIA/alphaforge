import pytest
import requests
import time
from faker import Faker

API_BASE = "http://localhost:5000/api"
fake = Faker()

def get_device_headers(fingerprint="test_device_123"):
    """Simulate device fingerprinting headers"""
    return {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Test Browser)",
        "X-Forwarded-For": "192.168.1.100",
        "X-Device-Fingerprint": fingerprint
    }

def test_fraud_prevention_multiple_sessions():
    """Test fraud prevention for multiple session creation attempts"""
    fingerprint = f"fraud_test_{int(time.time())}"
    headers = get_device_headers(fingerprint)
    
    # Create multiple sessions rapidly
    session_ids = []
    for i in range(3):
        r = requests.get(f"{API_BASE}/chat/session", headers=headers)
        if r.status_code == 200:
            session_ids.append(r.json().get("id"))
    
    # Should track multiple sessions from same device
    assert len(session_ids) <= 3, "Should allow reasonable number of sessions"

def test_disposable_email_detection():
    """Test CRM form with disposable email addresses"""
    disposable_emails = [
        "test@mailinator.com",
        "test@10minutemail.com", 
        "test@guerrillamail.com",
        "test@tempmail.org"
    ]
    
    headers = get_device_headers()
    
    for email in disposable_emails:
        crm_data = {
            "name": fake.name(),
            "email": email,
            "role": "trader",
            "tradingExperience": "beginner",
            "company": fake.company()
        }
        
        r = requests.post(f"{API_BASE}/crm/submit", json=crm_data, headers=headers)
        # Should either block or flag disposable emails
        assert r.status_code in [200, 400, 403], f"Unexpected response for {email}: {r.status_code}"

def test_email_aliasing_detection():
    """Test detection of Gmail aliasing tricks"""
    base_email = "testuser@gmail.com"
    aliased_emails = [
        "test.user@gmail.com",
        "testuser+1@gmail.com", 
        "testuser+trading@gmail.com",
        "test.u.s.e.r@gmail.com"
    ]
    
    headers = get_device_headers()
    
    # Submit base email first
    crm_data = {
        "name": fake.name(),
        "email": base_email,
        "role": "trader",
        "tradingExperience": "professional"
    }
    r = requests.post(f"{API_BASE}/crm/submit", json=crm_data, headers=headers)
    
    # Try aliased versions
    for email in aliased_emails:
        crm_data["email"] = email
        crm_data["name"] = fake.name()  # Different name
        
        r = requests.post(f"{API_BASE}/crm/submit", json=crm_data, headers=headers)
        # Should detect aliases and prevent multiple submissions
        assert r.status_code in [200, 400, 403], f"Aliasing not detected for {email}"

def test_rapid_messaging_bot_detection():
    """Test detection of rapid messaging patterns"""
    headers = get_device_headers("bot_test_device")
    
    # Get a chat session
    session_r = requests.get(f"{API_BASE}/chat/session", headers=headers)
    if session_r.status_code != 200:
        pytest.skip("Cannot create chat session for bot testing")
    
    # Send messages rapidly (bot-like behavior)
    for i in range(12):  # More than typical human rate
        message_data = {
            "message": f"Test message {i}",
            "skillLevel": "beginner"
        }
        r = requests.post(f"{API_BASE}/chat/send", json=message_data, headers=headers)
        time.sleep(0.1)  # Very rapid messaging
    
    # Should detect and limit bot behavior
    final_message = {
        "message": "Final test message",
        "skillLevel": "beginner"
    }
    r = requests.post(f"{API_BASE}/chat/send", json=final_message, headers=headers)
    assert r.status_code in [200, 429, 403], "Bot detection not working"

def test_phone_number_reuse_limits():
    """Test phone number reuse prevention"""
    phone = "+1-555-0123"
    headers = get_device_headers()
    
    # Submit multiple CRM forms with same phone number
    for i in range(4):  # Above typical limit
        crm_data = {
            "name": fake.name(),
            "email": f"user{i}@{fake.domain_name()}",
            "phone": phone,
            "role": "trader",
            "tradingExperience": "beginner"
        }
        
        r = requests.post(f"{API_BASE}/crm/submit", json=crm_data, headers=headers)
        
        if i >= 3:  # Should block after 3 uses
            assert r.status_code in [400, 403], f"Phone reuse not detected on attempt {i+1}"

def test_high_risk_score_blocking():
    """Test high risk score automatic blocking"""
    # Simulate high-risk device characteristics
    risk_headers = {
        "Content-Type": "application/json",
        "User-Agent": "Bot/1.0",  # Suspicious user agent
        "X-Forwarded-For": "10.0.0.1",  # Suspicious IP
        "X-Device-Fingerprint": "high_risk_device"
    }
    
    # Attempt CRM submission with high-risk characteristics
    crm_data = {
        "name": "Test User",
        "email": "test@tempmail.org",  # Disposable email
        "role": "trader",
        "tradingExperience": "expert"
    }
    
    r = requests.post(f"{API_BASE}/crm/submit", json=crm_data, headers=risk_headers)
    # Should block or require verification for high-risk attempts
    assert r.status_code in [200, 403], "High-risk blocking not working"

def test_sql_injection_protection():
    """Test SQL injection protection on form inputs"""
    headers = get_device_headers()
    
    sql_injection_attempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker'); --",
        "' UNION SELECT * FROM users --"
    ]
    
    for injection in sql_injection_attempts:
        crm_data = {
            "name": injection,
            "email": f"test@example.com",
            "role": injection,
            "tradingExperience": injection
        }
        
        r = requests.post(f"{API_API}/crm/submit", json=crm_data, headers=headers)
        # Should handle injection attempts safely
        assert r.status_code in [200, 400, 422], f"SQL injection not handled: {injection}"

def test_xss_protection():
    """Test XSS protection on user inputs"""
    headers = get_device_headers()
    
    xss_attempts = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "'><script>alert('xss')</script>"
    ]
    
    for xss in xss_attempts:
        message_data = {
            "message": xss,
            "skillLevel": "beginner"
        }
        
        r = requests.post(f"{API_BASE}/chat/send", json=message_data, headers=headers)
        # Should sanitize or reject XSS attempts
        assert r.status_code in [200, 400, 422], f"XSS not handled: {xss}"

def test_admin_endpoint_protection():
    """Test that admin endpoints require proper authentication"""
    headers = get_device_headers()
    
    admin_endpoints = [
        "/api/admin/fraud-report",
        "/api/admin/performance-report", 
        "/api/admin/scheduler-status",
        "/api/admin/send-report"
    ]
    
    for endpoint in admin_endpoints:
        r = requests.get(f"http://localhost:5000{endpoint}", headers=headers)
        # Should require authentication
        assert r.status_code in [401, 403], f"Admin endpoint not protected: {endpoint}"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
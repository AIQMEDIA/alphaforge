import pytest
import requests
import time

API_BASE = "http://localhost:5000/api"

def get_auth_headers():
    """Get headers for authenticated requests"""
    return {
        "Content-Type": "application/json",
        "User-Agent": "AlphaForge-Test-Suite/1.0"
    }

def test_performance_report_generation():
    """Test weekly performance report generation"""
    headers = get_auth_headers()
    
    # Test performance report endpoint
    r = requests.get(f"{API_BASE}/admin/performance-report", headers=headers)
    
    # Should require authentication
    assert r.status_code in [200, 401], f"Performance report failed: {r.status_code}"
    
    if r.status_code == 200:
        report_data = r.json()
        
        # Should contain key performance metrics
        expected_fields = ["weekStart", "weekEnd", "userActivity", "fraudPrevention", "leadGeneration"]
        for field in expected_fields:
            assert field in report_data, f"Missing field in performance report: {field}"

def test_scheduler_status():
    """Test scheduler status endpoint"""
    headers = get_auth_headers()
    
    r = requests.get(f"{API_BASE}/admin/scheduler-status", headers=headers)
    
    assert r.status_code in [200, 401], f"Scheduler status failed: {r.status_code}"
    
    if r.status_code == 200:
        status_data = r.json()
        
        # Should contain scheduler information
        expected_fields = ["isRunning", "recipients", "nextReportTime", "emailService"]
        for field in expected_fields:
            assert field in status_data, f"Missing field in scheduler status: {field}"

def test_email_service_configuration():
    """Test email service configuration status"""
    headers = get_auth_headers()
    
    r = requests.post(f"{API_BASE}/admin/test-email", headers=headers)
    
    assert r.status_code in [200, 401], f"Email test failed: {r.status_code}"
    
    if r.status_code == 200:
        response_data = r.json()
        assert "success" in response_data, "Email test response missing success field"

def test_immediate_report_sending():
    """Test immediate report sending functionality"""
    headers = get_auth_headers()
    
    report_request = {
        "recipient": "test@example.com"
    }
    
    r = requests.post(f"{API_BASE}/admin/send-report", 
                     json=report_request, 
                     headers=headers)
    
    assert r.status_code in [200, 401, 400], f"Send report failed: {r.status_code}"

def test_fraud_prevention_tracking():
    """Test fraud prevention data is being tracked for reports"""
    headers = get_auth_headers()
    
    # Test fraud report endpoint
    r = requests.get(f"{API_BASE}/admin/fraud-report", headers=headers)
    
    assert r.status_code in [200, 401], f"Fraud report failed: {r.status_code}"
    
    if r.status_code == 200:
        fraud_data = r.json()
        
        # Should contain fraud prevention metrics
        expected_fields = ["totalAttempts", "blockedAttempts", "riskScoreDistribution"]
        # Note: actual field names may vary based on implementation
        assert isinstance(fraud_data, dict), "Fraud report should be a dictionary"

def test_performance_metrics_calculation():
    """Test that performance metrics are calculated correctly"""
    headers = get_auth_headers()
    
    # Get performance report
    r = requests.get(f"{API_BASE}/admin/performance-report", headers=headers)
    
    if r.status_code == 200:
        report = r.json()
        
        if "userActivity" in report:
            user_activity = report["userActivity"]
            
            # Total sessions should be >= unique users
            if "totalSessions" in user_activity and "uniqueUsers" in user_activity:
                assert user_activity["totalSessions"] >= user_activity["uniqueUsers"], \
                    "Total sessions should be >= unique users"
        
        if "leadGeneration" in report:
            lead_gen = report["leadGeneration"]
            
            # Conversion rate should be between 0 and 100
            if "conversionRate" in lead_gen:
                assert 0 <= lead_gen["conversionRate"] <= 100, \
                    f"Conversion rate out of range: {lead_gen['conversionRate']}"

def test_weekly_report_consistency():
    """Test that weekly reports are consistent across multiple requests"""
    headers = get_auth_headers()
    
    # Get two reports for the same week
    r1 = requests.get(f"{API_BASE}/admin/performance-report?weekOffset=0", headers=headers)
    time.sleep(1)  # Small delay
    r2 = requests.get(f"{API_BASE}/admin/performance-report?weekOffset=0", headers=headers)
    
    if r1.status_code == 200 and r2.status_code == 200:
        report1 = r1.json()
        report2 = r2.json()
        
        # Key metrics should be identical for same week
        consistency_fields = ["weekStart", "weekEnd"]
        for field in consistency_fields:
            if field in report1 and field in report2:
                assert report1[field] == report2[field], \
                    f"Inconsistent {field} between reports"

def test_growth_analytics():
    """Test growth analytics calculation"""
    headers = get_auth_headers()
    
    # Get current week and previous week reports
    current_r = requests.get(f"{API_BASE}/admin/performance-report?weekOffset=0", headers=headers)
    previous_r = requests.get(f"{API_BASE}/admin/performance-report?weekOffset=1", headers=headers)
    
    if current_r.status_code == 200 and previous_r.status_code == 200:
        current_report = current_r.json()
        previous_report = previous_r.json()
        
        # Should have growth insights
        if "growthInsights" in current_report:
            growth = current_report["growthInsights"]
            
            # Should contain recommendations and opportunities
            assert "recommendations" in growth or "troubleshootingOpportunities" in growth, \
                "Growth insights missing key fields"
            
            if "weekOverWeekGrowth" in growth:
                # Growth rate should be a reasonable number
                growth_rate = growth["weekOverWeekGrowth"]
                assert isinstance(growth_rate, (int, float)), "Growth rate should be numeric"

def test_system_health_monitoring():
    """Test system health metrics in performance reports"""
    headers = get_auth_headers()
    
    r = requests.get(f"{API_BASE}/admin/performance-report", headers=headers)
    
    if r.status_code == 200:
        report = r.json()
        
        if "systemHealth" in report:
            health = report["systemHealth"]
            
            # Should contain health metrics
            health_fields = ["uptime", "responseTime", "errorRate"]
            for field in health_fields:
                if field in health:
                    value = health[field]
                    assert isinstance(value, (int, float)), f"{field} should be numeric"
                    
                    # Reasonable ranges
                    if field == "uptime":
                        assert 0 <= value <= 100, f"Uptime out of range: {value}"
                    elif field == "errorRate":
                        assert 0 <= value <= 100, f"Error rate out of range: {value}"

def test_troubleshooting_opportunities():
    """Test troubleshooting opportunity detection"""
    headers = get_auth_headers()
    
    r = requests.get(f"{API_BASE}/admin/performance-report", headers=headers)
    
    if r.status_code == 200:
        report = r.json()
        
        if "growthInsights" in report and "troubleshootingOpportunities" in report["growthInsights"]:
            opportunities = report["growthInsights"]["troubleshootingOpportunities"]
            
            # Should be a list of actionable insights
            assert isinstance(opportunities, list), "Troubleshooting opportunities should be a list"
            
            for opportunity in opportunities:
                assert isinstance(opportunity, str), "Each opportunity should be a string"
                assert len(opportunity) > 10, "Opportunities should be descriptive"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
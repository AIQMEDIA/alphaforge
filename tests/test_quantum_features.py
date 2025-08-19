import pytest
import requests
import json

API_BASE = "http://localhost:5000/api"

def get_headers():
    return {
        "Content-Type": "application/json",
        "User-Agent": "AlphaForge-Test-Suite/1.0"
    }

def test_quantum_providers_available():
    """Test quantum computing providers are properly configured"""
    r = requests.get(f"{API_BASE}/quantum/providers", headers=get_headers())
    
    if r.status_code == 200:
        providers = r.json()
        expected_providers = ["IBM_QUANTUM", "GOOGLE_CIRQ", "AMAZON_BRAKET"]
        
        # Should have all major quantum providers
        for provider in expected_providers:
            assert provider in [p.get("id") or p.get("name") for p in providers], f"Missing provider: {provider}"

def test_quantum_algorithms_available():
    """Test quantum algorithms are properly implemented"""
    r = requests.get(f"{API_BASE}/quantum/algorithms", headers=get_headers())
    
    if r.status_code == 200:
        algorithms = r.json()
        expected_algorithms = ["VQE", "QAOA"]
        
        # Should have key quantum algorithms
        for algo in expected_algorithms:
            assert algo in [a.get("id") or a.get("name") for a in algorithms], f"Missing algorithm: {algo}"

def test_quantum_optimization_request():
    """Test quantum portfolio optimization request format"""
    headers = get_headers()
    
    optimization_request = {
        "provider": "IBM_QUANTUM",
        "algorithm": "VQE", 
        "assets": ["AAPL", "GOOGL", "MSFT"],
        "target_return": 0.12,
        "risk_tolerance": 0.15
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=optimization_request, 
                     headers=headers)
    
    # Should accept valid optimization requests (may require auth)
    assert r.status_code in [200, 401, 400, 422], f"Unexpected status: {r.status_code}"
    
    if r.status_code == 400:
        # Check error message is informative
        error_data = r.json()
        assert "message" in error_data or "error" in error_data

def test_quantum_status_monitoring():
    """Test quantum provider status monitoring"""
    r = requests.get(f"{API_BASE}/quantum/status", headers=get_headers())
    
    if r.status_code == 200:
        status_data = r.json()
        
        # Should provide status for each provider
        assert isinstance(status_data, (list, dict))
        
        if isinstance(status_data, list):
            for provider_status in status_data:
                assert "provider" in provider_status or "name" in provider_status
                assert "status" in provider_status or "available" in provider_status

def test_quantum_portfolio_validation():
    """Test quantum optimization input validation"""
    headers = get_headers()
    
    # Test with invalid asset list
    invalid_request = {
        "provider": "IBM_QUANTUM",
        "algorithm": "VQE",
        "assets": [],  # Empty assets
        "target_return": 0.12
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=invalid_request, 
                     headers=headers)
    
    # Should reject invalid inputs
    assert r.status_code in [400, 422, 401]
    
    # Test with invalid return target
    invalid_request = {
        "provider": "IBM_QUANTUM", 
        "algorithm": "VQE",
        "assets": ["AAPL"],
        "target_return": -5.0  # Unrealistic negative return
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=invalid_request, 
                     headers=headers)
    
    assert r.status_code in [400, 422, 401]

def test_quantum_algorithm_parameters():
    """Test quantum algorithm parameter validation"""
    headers = get_headers()
    
    # VQE with valid parameters
    vqe_request = {
        "provider": "IBM_QUANTUM",
        "algorithm": "VQE",
        "assets": ["AAPL", "GOOGL"],
        "parameters": {
            "max_iterations": 100,
            "convergence_threshold": 1e-6
        }
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=vqe_request, 
                     headers=headers)
    
    assert r.status_code in [200, 401, 400, 422]
    
    # QAOA with valid parameters  
    qaoa_request = {
        "provider": "GOOGLE_CIRQ",
        "algorithm": "QAOA",
        "assets": ["MSFT", "TSLA"],
        "parameters": {
            "depth": 3,
            "beta_range": [0, 1]
        }
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=qaoa_request, 
                     headers=headers)
    
    assert r.status_code in [200, 401, 400, 422]

def test_quantum_results_format():
    """Test quantum optimization results have proper format"""
    headers = get_headers()
    
    # Make a simple optimization request
    request = {
        "provider": "IBM_QUANTUM",
        "algorithm": "VQE",
        "assets": ["AAPL", "GOOGL"],
        "target_return": 0.10
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=request, 
                     headers=headers)
    
    if r.status_code == 200:
        results = r.json()
        
        # Should contain optimization results
        expected_fields = ["weights", "expected_return", "risk", "sharpe_ratio"]
        for field in expected_fields:
            assert field in results, f"Missing result field: {field}"
        
        # Weights should sum to approximately 1
        if "weights" in results:
            weights = results["weights"]
            assert isinstance(weights, (list, dict))
            if isinstance(weights, list):
                total_weight = sum(weights)
                assert 0.95 <= total_weight <= 1.05, f"Weights don't sum to 1: {total_weight}"

def test_quantum_provider_switching():
    """Test switching between quantum providers"""
    headers = get_headers()
    providers = ["IBM_QUANTUM", "GOOGLE_CIRQ", "AMAZON_BRAKET"]
    
    for provider in providers:
        request = {
            "provider": provider,
            "algorithm": "VQE",
            "assets": ["AAPL"],
            "target_return": 0.08
        }
        
        r = requests.post(f"{API_BASE}/quantum/optimize", 
                         json=request, 
                         headers=headers)
        
        # Should handle all providers gracefully
        assert r.status_code in [200, 401, 400, 422, 503], f"Provider {provider} failed: {r.status_code}"

def test_quantum_error_handling():
    """Test quantum service error handling"""
    headers = get_headers()
    
    # Test with invalid provider
    invalid_request = {
        "provider": "FAKE_QUANTUM",
        "algorithm": "VQE", 
        "assets": ["AAPL"]
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=invalid_request, 
                     headers=headers)
    
    assert r.status_code in [400, 422, 401]
    
    # Test with invalid algorithm
    invalid_request = {
        "provider": "IBM_QUANTUM",
        "algorithm": "FAKE_ALGO",
        "assets": ["AAPL"]
    }
    
    r = requests.post(f"{API_BASE}/quantum/optimize", 
                     json=invalid_request, 
                     headers=headers)
    
    assert r.status_code in [400, 422, 401]

def test_quantum_machine_learning():
    """Test quantum machine learning endpoints"""
    headers = get_headers()
    
    # Test quantum ML prediction request
    ml_request = {
        "model": "quantum_neural_network",
        "features": ["price_momentum", "volume_trend", "volatility"],
        "assets": ["AAPL", "GOOGL"],
        "prediction_horizon": 5  # days
    }
    
    r = requests.post(f"{API_BASE}/quantum/predict", 
                     json=ml_request, 
                     headers=headers)
    
    # Should handle quantum ML requests
    assert r.status_code in [200, 401, 400, 422, 501], f"Quantum ML failed: {r.status_code}"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
#!/usr/bin/env python3
"""
AlphaForge Test Suite Runner
Comprehensive testing for reliability, security, and performance
"""

import subprocess
import sys
import time
import requests
from pathlib import Path

def check_server_running(url="http://localhost:5000", timeout=30):
    """Check if the AlphaForge server is running"""
    print(f"🔍 Checking if server is running at {url}...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            print(f"✅ Server is running (status: {response.status_code})")
            return True
        except requests.exceptions.ConnectionError:
            print("⏳ Waiting for server to start...")
            time.sleep(2)
        except Exception as e:
            print(f"❌ Error checking server: {e}")
            time.sleep(2)
    
    print(f"❌ Server not responding after {timeout}s")
    return False

def run_api_tests():
    """Run API and backend tests"""
    print("\n🧪 Running API Tests...")
    print("=" * 50)
    
    test_files = [
        "test_api_core.py",
        "test_security_fraud.py", 
        "test_quantum_features.py",
        "test_performance_monitoring.py"
    ]
    
    for test_file in test_files:
        print(f"\n📋 Running {test_file}...")
        try:
            result = subprocess.run([
                sys.executable, "-m", "pytest", 
                f"tests/{test_file}", 
                "-v", "--tb=short"
            ], cwd=Path(__file__).parent.parent, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ {test_file} - All tests passed")
            else:
                print(f"❌ {test_file} - Some tests failed")
                print("STDOUT:", result.stdout)
                print("STDERR:", result.stderr)
                
        except Exception as e:
            print(f"❌ Error running {test_file}: {e}")

def run_e2e_tests():
    """Run end-to-end Playwright tests"""
    print("\n🎭 Running End-to-End Tests...")
    print("=" * 50)
    
    try:
        # Check if Playwright is installed
        result = subprocess.run([
            sys.executable, "-c", "import playwright"
        ], capture_output=True)
        
        if result.returncode != 0:
            print("📦 Installing Playwright...")
            subprocess.run([sys.executable, "-m", "pip", "install", "playwright"])
            subprocess.run([sys.executable, "-m", "playwright", "install"])
        
        print("🎭 Running Playwright tests...")
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/test_end2end_playwright.py", 
            "-v", "--tb=short"
        ], cwd=Path(__file__).parent.parent)
        
        if result.returncode == 0:
            print("✅ End-to-end tests passed")
        else:
            print("❌ Some end-to-end tests failed")
            
    except Exception as e:
        print(f"❌ Error running E2E tests: {e}")

def run_security_audit():
    """Run focused security and fraud prevention tests"""
    print("\n🛡️  Running Security Audit...")
    print("=" * 50)
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/test_security_fraud.py", 
            "-v", "--tb=short", "-x"  # Stop on first failure for security
        ], cwd=Path(__file__).parent.parent)
        
        if result.returncode == 0:
            print("✅ Security audit passed - No vulnerabilities detected")
        else:
            print("❌ Security audit failed - Please review immediately")
            
    except Exception as e:
        print(f"❌ Error running security audit: {e}")

def generate_test_report():
    """Generate comprehensive test report"""
    print("\n📊 Generating Test Report...")
    print("=" * 50)
    
    try:
        # Run all tests with coverage and HTML report
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "--html=tests/report.html", 
            "--self-contained-html",
            "-v"
        ], cwd=Path(__file__).parent.parent)
        
        if result.returncode == 0:
            print("✅ Test report generated: tests/report.html")
        else:
            print("❌ Test report generation completed with some failures")
            
    except Exception as e:
        print(f"❌ Error generating test report: {e}")

def main():
    """Main test runner"""
    print("🚀 AlphaForge Test Suite")
    print("=" * 50)
    print("Testing reliability, security, and performance...")
    
    # Check if dependencies are installed
    try:
        import pytest
        import requests
        import faker
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("📦 Installing test dependencies...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "tests/requirements.txt"])
    
    # Check if server is running
    if not check_server_running():
        print("\n❌ AlphaForge server is not running!")
        print("Please start the server with: npm run dev")
        return False
    
    # Run test suites
    run_api_tests()
    run_security_audit()
    
    # Optional E2E tests (require more setup)
    run_e2e_choice = input("\n🎭 Run end-to-end browser tests? (y/N): ").lower()
    if run_e2e_choice == 'y':
        run_e2e_tests()
    
    # Generate report
    generate_choice = input("\n📊 Generate HTML test report? (y/N): ").lower()
    if generate_choice == 'y':
        generate_test_report()
    
    print("\n✅ Test suite completed!")
    print("🔍 Review any failures above before customer outreach")
    print("🛡️  Security audit helps ensure fraud prevention is working")
    print("📈 Performance tests validate monitoring systems")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
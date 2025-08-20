#!/usr/bin/env python3
"""
Alpha-forge.io Domain Monitoring Script
Monitors domain status and functionality every 5 minutes
"""

import time
import requests
import datetime
from urllib.parse import urlparse

def check_domain_status(domain):
    """Check if domain is accessible and measure response time"""
    urls_to_test = [
        f"https://{domain}",
        f"http://{domain}"
    ]
    
    results = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "domain": domain,
        "status": "Unknown",
        "response_time": None,
        "http_code": None,
        "accessible": False,
        "ssl_working": False
    }
    
    for url in urls_to_test:
        try:
            print(f"Testing {url}...")
            start_time = time.time()
            response = requests.get(url, timeout=10, allow_redirects=True)
            response_time = time.time() - start_time
            
            results["http_code"] = response.status_code
            results["response_time"] = round(response_time, 2)
            results["accessible"] = True
            
            if url.startswith("https://"):
                results["ssl_working"] = True
                
            if response.status_code == 200:
                # Check if it's actually serving AlphaForge content
                if "AlphaForge" in response.text or "Quantum Trading" in response.text:
                    results["status"] = "Fully Operational"
                    print(f"✅ {domain} is FULLY OPERATIONAL!")
                    print(f"   Response time: {response_time:.2f}s")
                    print(f"   HTTP Status: {response.status_code}")
                    return results
                else:
                    results["status"] = "Responding but wrong content"
                    print(f"⚠️  {domain} responding but serving wrong content")
            else:
                results["status"] = f"HTTP {response.status_code}"
                print(f"⚠️  {domain} HTTP {response.status_code}")
                
        except requests.exceptions.ConnectTimeout:
            print(f"⏰ {url} - Connection timeout")
            results["status"] = "Connection timeout"
        except requests.exceptions.ConnectionError:
            print(f"🔴 {url} - Connection failed (DNS not propagated)")
            results["status"] = "DNS not propagated"
        except requests.exceptions.SSLError:
            print(f"🔒 {url} - SSL certificate error")
            results["status"] = "SSL certificate error"
        except Exception as e:
            print(f"❌ {url} - Error: {str(e)}")
            results["status"] = f"Error: {str(e)}"
    
    if not results["accessible"]:
        print(f"🔴 {domain} is NOT YET ACCESSIBLE")
        print("   This is normal during DNS propagation (can take 2-48 hours)")
    
    return results

def monitor_domain_continuously(domain, check_interval=300):
    """Monitor domain every check_interval seconds (default 5 minutes)"""
    print(f"🔍 Starting continuous monitoring of {domain}")
    print(f"📊 Checking every {check_interval//60} minutes")
    print("=" * 60)
    
    start_time = datetime.datetime.now()
    check_count = 0
    
    while True:
        check_count += 1
        elapsed = datetime.datetime.now() - start_time
        
        print(f"\n📋 Check #{check_count} ({elapsed.total_seconds()//3600:.0f}h {(elapsed.total_seconds()%3600)//60:.0f}m elapsed)")
        
        result = check_domain_status(domain)
        
        # Log results
        print(f"Status: {result['status']}")
        if result['response_time']:
            print(f"Response Time: {result['response_time']}s")
        if result['http_code']:
            print(f"HTTP Code: {result['http_code']}")
        print(f"SSL Working: {'Yes' if result['ssl_working'] else 'No'}")
        
        # Break if domain is fully operational
        if result['status'] == "Fully Operational":
            print("\n🎉 DOMAIN IS FULLY OPERATIONAL!")
            print(f"✅ {domain} is now serving AlphaForge correctly")
            print(f"🕐 Total time to operational: {elapsed}")
            
            # Test key functionality
            print("\n🧪 Testing key functionality...")
            test_functionality(f"https://{domain}")
            break
            
        print(f"⏳ Next check in {check_interval//60} minutes...")
        print("-" * 40)
        
        time.sleep(check_interval)

def test_functionality(base_url):
    """Test key functionality once domain is operational"""
    endpoints_to_test = [
        "/",
        "/dashboard",
        "/strategies", 
        "/paper-trading",
        "/quantum-assistant",
        "/api/health"
    ]
    
    print("Testing key pages and functionality:")
    
    for endpoint in endpoints_to_test:
        try:
            url = base_url + endpoint
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ {endpoint} - Working")
            elif response.status_code in [401, 403]:
                print(f"🔒 {endpoint} - Auth required (normal)")
            else:
                print(f"⚠️  {endpoint} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {endpoint} - Error: {str(e)}")
    
    # Test specific AlphaForge features
    print("\n🔍 Checking for AlphaForge-specific content:")
    try:
        response = requests.get(base_url, timeout=10)
        content = response.text.lower()
        
        features_to_check = [
            ("quantum trading", "🔬 Quantum Trading branding"),
            ("arize ai", "🤖 Arize AI partnership"),
            ("ai assistant", "💬 AI Assistant integration"),
            ("alphaforge", "🏢 AlphaForge branding"),
            ("ticker", "📈 Ticker symbol support"),
        ]
        
        for feature, description in features_to_check:
            if feature in content:
                print(f"✅ {description} - Found")
            else:
                print(f"⚠️  {description} - Not found")
                
    except Exception as e:
        print(f"❌ Content check failed: {str(e)}")

def main():
    domain = "alpha-forge.io"
    
    print("🚀 AlphaForge Domain Monitoring System")
    print("=" * 50)
    print(f"Target Domain: {domain}")
    print(f"Started: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nExpected Timeline:")
    print("• Typical: 2-6 hours for DNS propagation")
    print("• Maximum: Up to 48 hours")
    print("• Platform is customer-ready using replit.app domain meanwhile")
    
    # Initial check
    print(f"\n🔍 Initial domain status check...")
    result = check_domain_status(domain)
    
    if result['status'] == "Fully Operational":
        print(f"\n🎉 {domain} is already operational!")
        test_functionality(f"https://{domain}")
    else:
        print(f"\n⏳ Domain not ready yet - starting continuous monitoring...")
        monitor_domain_continuously(domain, check_interval=300)  # 5 minutes

if __name__ == "__main__":
    main()
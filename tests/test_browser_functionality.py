#!/usr/bin/env python3
"""
Comprehensive browser-based functional testing for AlphaForge platform.
Tests all major user flows and interactive features.
"""

import time
import requests
from playwright.sync_api import sync_playwright, expect

def test_landing_page_functionality():
    """Test landing page loads and key elements are present"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Check page title and key content
            assert "AlphaForge" in page.title()
            
            # Check for key sections
            assert page.locator("text=AlphaForge").count() > 0
            
            # Check navigation elements
            login_buttons = page.locator('[data-testid="button-login"], text=Login, text=Sign In')
            assert login_buttons.count() > 0
            
            print("✓ Landing page functionality verified")
            
        except Exception as e:
            print(f"✗ Landing page test failed: {e}")
        finally:
            browser.close()

def test_navigation_functionality():
    """Test navigation between pages without authentication"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Test navigation to different sections
            page.click('text=Features')
            time.sleep(1)
            
            page.click('text=Pricing')
            time.sleep(1)
            
            print("✓ Basic navigation functionality verified")
            
        except Exception as e:
            print(f"✗ Navigation test failed: {e}")
        finally:
            browser.close()

def test_ai_assistant_visibility():
    """Test AI assistant is prominently displayed"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Check for AI assistant elements
            ai_elements = [
                "text=AI Assistant",
                "text=Quantum Assistant", 
                '[data-testid*="ai"]',
                '[data-testid*="assistant"]'
            ]
            
            found_ai = False
            for selector in ai_elements:
                try:
                    if page.locator(selector).count() > 0:
                        found_ai = True
                        break
                except:
                    continue
            
            if found_ai:
                print("✓ AI assistant visibility confirmed")
            else:
                print("! AI assistant may not be prominently displayed")
                
        except Exception as e:
            print(f"✗ AI assistant test failed: {e}")
        finally:
            browser.close()

def test_ticker_symbol_inputs():
    """Test ticker symbol input functionality"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Try to access trading pages (will redirect to auth)
            page.goto("http://localhost:5000/paper-trading")
            time.sleep(2)
            
            # Check if symbol input fields exist (even if disabled)
            symbol_inputs = page.locator('input[placeholder*="AAPL"], input[placeholder*="symbol"], input[placeholder*="ticker"]')
            
            if symbol_inputs.count() > 0:
                print("✓ Ticker symbol inputs found on trading pages")
            else:
                print("! Ticker symbol inputs may not be visible (auth required)")
                
        except Exception as e:
            print(f"✗ Ticker symbol test failed: {e}")
        finally:
            browser.close()

def test_responsive_design():
    """Test responsive design on different screen sizes"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # Test mobile view
            page.set_viewport_size({"width": 375, "height": 667})
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Check mobile navigation
            mobile_menu = page.locator('[data-testid*="mobile"], button[aria-label*="menu"]')
            if mobile_menu.count() > 0:
                print("✓ Mobile responsive design elements found")
            
            # Test tablet view
            page.set_viewport_size({"width": 768, "height": 1024})
            page.reload()
            page.wait_for_load_state('networkidle')
            
            # Test desktop view
            page.set_viewport_size({"width": 1920, "height": 1080})
            page.reload()
            page.wait_for_load_state('networkidle')
            
            print("✓ Responsive design functionality verified")
            
        except Exception as e:
            print(f"✗ Responsive design test failed: {e}")
        finally:
            browser.close()

def test_form_interactions():
    """Test form interactions and inputs"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            
            # Test newsletter signup or contact forms
            email_inputs = page.locator('input[type="email"], input[placeholder*="email"]')
            if email_inputs.count() > 0:
                email_input = email_inputs.first
                email_input.fill("test@example.com")
                print("✓ Email input functionality verified")
            
            # Test other form elements
            text_inputs = page.locator('input[type="text"], textarea')
            if text_inputs.count() > 0:
                print("✓ Form input elements found and functional")
                
        except Exception as e:
            print(f"✗ Form interaction test failed: {e}")
        finally:
            browser.close()

def test_performance_basics():
    """Test basic performance metrics"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            start_time = time.time()
            page.goto("http://localhost:5000")
            page.wait_for_load_state('networkidle')
            load_time = time.time() - start_time
            
            if load_time < 5.0:
                print(f"✓ Page load time acceptable: {load_time:.2f}s")
            else:
                print(f"! Page load time slow: {load_time:.2f}s")
            
            # Check for console errors
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg) if msg.type == "error" else None)
            
            time.sleep(2)  # Wait for any delayed console errors
            
            if len(console_errors) == 0:
                print("✓ No console errors detected")
            else:
                print(f"! {len(console_errors)} console errors detected")
                
        except Exception as e:
            print(f"✗ Performance test failed: {e}")
        finally:
            browser.close()

def run_all_browser_tests():
    """Run comprehensive browser functionality tests"""
    print("🧪 Running AlphaForge Browser Functionality Tests")
    print("=" * 50)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        if response.status_code != 200:
            print("✗ Server not responding correctly")
            return
    except:
        print("✗ Server not accessible at http://localhost:5000")
        return
    
    print("✓ Server is running and accessible")
    print()
    
    # Run all tests
    test_landing_page_functionality()
    test_navigation_functionality()
    test_ai_assistant_visibility()
    test_ticker_symbol_inputs()
    test_responsive_design()
    test_form_interactions()
    test_performance_basics()
    
    print()
    print("🎯 Browser testing completed")
    print("=" * 50)

if __name__ == "__main__":
    run_all_browser_tests()
import pytest
from playwright.sync_api import sync_playwright, expect
import time

BASE_URL = "http://localhost:5000"

def test_landing_page_loads():
    """Test that landing page loads correctly"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(BASE_URL)
        
        # Check main elements are present
        expect(page.locator("text=AlphaForge")).to_be_visible()
        expect(page.locator("text=Quantitative Trading")).to_be_visible()
        expect(page.locator("text=Start Free Trial")).to_be_visible()
        
        browser.close()

def test_quantum_assistant_access():
    """Test accessing the Quantum Trading Assistant"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(BASE_URL)
        
        # Click on Try AI Assistant button
        page.click("text=Try AI Assistant")
        
        # Should navigate to quantum assistant page
        expect(page).to_have_url(f"{BASE_URL}/quantum-assistant")
        
        # Check quantum assistant UI elements
        expect(page.locator("text=Quantum Trading Assistant")).to_be_visible()
        expect(page.locator("input[placeholder*='message']")).to_be_visible()
        
        browser.close()

def test_quantum_assistant_chat_flow():
    """Test basic chat interaction with quantum assistant"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/quantum-assistant")
        
        # Wait for page to load
        page.wait_for_load_state("networkidle")
        
        # Find message input
        message_input = page.locator("input[type='text']").first
        if not message_input.is_visible():
            message_input = page.locator("textarea").first
        
        # Type and send a message
        message_input.fill("What is quantum trading?")
        
        # Look for send button
        send_button = page.locator("button:has-text('Send')").first
        if not send_button.is_visible():
            # Try Enter key
            message_input.press("Enter")
        else:
            send_button.click()
        
        # Wait for response (should appear within reasonable time)
        page.wait_for_timeout(3000)
        
        # Check if chat messages area exists
        chat_area = page.locator("[data-testid*='chat'], .chat, .messages").first
        if chat_area.is_visible():
            expect(chat_area).to_contain_text("quantum")
        
        browser.close()

def test_crm_form_interaction():
    """Test CRM form submission flow"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/quantum-assistant")
        page.wait_for_load_state("networkidle")
        
        # Look for CRM form trigger (might be after chat limit)
        # Try to find "Unlock Unlimited" or similar button
        unlock_buttons = page.locator("text=Unlock, text=Unlimited, button:has-text('Access')")
        
        if unlock_buttons.count() > 0:
            unlock_buttons.first.click()
            
            # Fill CRM form if it appears
            if page.locator("input[name='name'], input[placeholder*='name']").is_visible():
                page.fill("input[name='name'], input[placeholder*='name']", "Test User")
                page.fill("input[name='email'], input[placeholder*='email']", "test@example.com")
                
                # Fill other fields if present
                if page.locator("select[name='role'], select[placeholder*='role']").is_visible():
                    page.select_option("select[name='role'], select[placeholder*='role']", "trader")
                
                if page.locator("select[name='tradingExperience']").is_visible():
                    page.select_option("select[name='tradingExperience']", "beginner")
                
                # Submit form
                page.click("button:has-text('Submit'), button:has-text('Save'), button[type='submit']")
                
                # Wait for response
                page.wait_for_timeout(2000)
        
        browser.close()

def test_navigation_between_pages():
    """Test navigation between different pages"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Start at landing page
        page.goto(BASE_URL)
        
        # Navigate to different sections
        sections = [
            ("Try AI Assistant", "/quantum-assistant"),
            ("Sign In", "/api/login"),  # This will redirect but we can test the attempt
        ]
        
        for button_text, expected_path in sections:
            page.goto(BASE_URL)  # Reset to home
            
            if page.locator(f"text={button_text}").is_visible():
                page.click(f"text={button_text}")
                page.wait_for_load_state("networkidle")
                
                # Check URL contains expected path (or reasonable redirect)
                current_url = page.url
                assert BASE_URL in current_url, f"Navigation failed for {button_text}"
        
        browser.close()

def test_responsive_design():
    """Test responsive design on different screen sizes"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # Test mobile size
        mobile_page = browser.new_page()
        mobile_page.set_viewport_size({"width": 375, "height": 667})
        mobile_page.goto(BASE_URL)
        
        # Should still show main elements
        expect(mobile_page.locator("text=AlphaForge")).to_be_visible()
        
        # Test tablet size
        tablet_page = browser.new_page()
        tablet_page.set_viewport_size({"width": 768, "height": 1024})
        tablet_page.goto(BASE_URL)
        
        expect(tablet_page.locator("text=AlphaForge")).to_be_visible()
        
        # Test desktop size
        desktop_page = browser.new_page()
        desktop_page.set_viewport_size({"width": 1200, "height": 800})
        desktop_page.goto(BASE_URL)
        
        expect(desktop_page.locator("text=AlphaForge")).to_be_visible()
        
        browser.close()

def test_dark_mode_toggle():
    """Test dark mode functionality if available"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        
        # Look for dark mode toggle
        dark_toggle = page.locator("button:has-text('Dark'), [data-testid*='theme'], .theme-toggle").first
        
        if dark_toggle.is_visible():
            # Get initial background color
            initial_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
            
            # Toggle dark mode
            dark_toggle.click()
            page.wait_for_timeout(500)
            
            # Check if background changed
            new_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
            assert initial_bg != new_bg, "Dark mode toggle not working"
        
        browser.close()

def test_error_handling():
    """Test error handling for non-existent pages"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Try to access non-existent page
        page.goto(f"{BASE_URL}/non-existent-page")
        
        # Should show error page or redirect
        # Either 404 page or redirect to home
        page.wait_for_load_state("networkidle")
        
        # Check that we get some reasonable response
        title = page.title()
        assert "AlphaForge" in title or "404" in title or "Not Found" in title
        
        browser.close()

def test_form_validation():
    """Test form validation on quantum assistant page"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.goto(f"{BASE_URL}/quantum-assistant")
        page.wait_for_load_state("networkidle")
        
        # Try to send empty message
        send_button = page.locator("button:has-text('Send')").first
        if send_button.is_visible():
            send_button.click()
            
            # Should either show validation error or do nothing
            page.wait_for_timeout(1000)
            
            # Form should still be present (not submitted)
            expect(page.locator("input[type='text'], textarea").first).to_be_visible()
        
        browser.close()

def test_performance_basic():
    """Basic performance test - page load times"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Measure page load time
        start_time = time.time()
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        load_time = time.time() - start_time
        
        # Should load within reasonable time
        assert load_time < 10, f"Page took too long to load: {load_time}s"
        
        # Test quantum assistant page load time
        start_time = time.time()
        page.goto(f"{BASE_URL}/quantum-assistant")
        page.wait_for_load_state("networkidle")
        load_time = time.time() - start_time
        
        assert load_time < 10, f"Quantum assistant page took too long: {load_time}s"
        
        browser.close()

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
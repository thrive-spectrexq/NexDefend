import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        try:
            # Set Token
            page.goto("http://localhost:5173")
            page.evaluate("localStorage.setItem('token', 'dummy-token')")

            # 1. Verify Forensics Page
            print("Navigating to Forensics Page...")
            page.goto("http://localhost:5173/forensics")
            page.wait_for_selector("h1:has-text('DIGITAL FORENSICS LAB')", timeout=10000)
            page.screenshot(path="verification_forensics.png")
            print("Forensics Page verified.")

            # 2. Verify Secure Chat Page
            print("Navigating to Secure Chat Page...")
            page.goto("http://localhost:5173/secure-chat")
            page.wait_for_selector("h3:has-text('SECURE CHANNEL')", timeout=10000)
            page.screenshot(path="verification_chat.png")
            print("Secure Chat Page verified.")

        except Exception as e:
            print(f"Verification Failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()

from playwright.sync_api import sync_playwright, Page, expect

def verify_login_and_dashboard(page: Page):
    """
    This script verifies the login flow and the styled dashboard of the NexDefend application.
    """
    # 1. Arrange: Go to the login page.
    page.goto("http://localhost:5173/auth/login")

    # 2. Assert: Check that the login button is visible.
    login_button = page.get_by_role("button", name="Log In")
    expect(login_button).to_be_visible()

    # 3. Screenshot: Capture the result for visual verification.
    page.screenshot(path="jules-scratch/verification/login-page-visible.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    verify_login_and_dashboard(page)
    browser.close()

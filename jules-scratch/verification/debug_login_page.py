from playwright.sync_api import sync_playwright, Page

def debug_login_page_with_html(page: Page):
    """
    This script navigates to the login page and prints its HTML content to debug rendering issues.
    """
    # 1. Arrange: Go to the login page.
    page.goto("http://localhost:5173/auth/login", wait_until="networkidle")

    # 2. Act: Get the page's HTML content.
    content = page.content()
    print(content)

    # 3. Screenshot: Capture the page for visual inspection.
    page.screenshot(path="jules-scratch/verification/login-page-debug.png")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    debug_login_page_with_html(page)
    browser.close()

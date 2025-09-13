from playwright.sync_api import Page, expect

def test_homepage_screenshot(page: Page):
    """
    This test navigates to the homepage and takes a screenshot.
    """
    # 1. Arrange: Go to the homepage.
    page.goto("http://localhost:3000")

    # 2. Assert: Check for the hero title to ensure the page has loaded.
    expect(page.get_by_role("heading", name="The Open Source Security Platform")).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/homepage.png")

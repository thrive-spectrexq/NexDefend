from playwright.sync_api import sync_playwright, Page, expect, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to Register page
        page.goto("http://localhost:3000/register")
        page.wait_for_url("http://localhost:3000/register")

        # Fill out the registration form
        page.get_by_label("Name").fill("testuser")
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Register").click()

        # Go to Login page
        page.goto("http://localhost:3000/login")
        page.wait_for_url("http://localhost:3000/login")

        # Fill out the login form
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Password").fill("password123")
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to dashboard
        page.wait_for_url("http://localhost:3000/dashboard")

        # Go to Compliance page
        page.goto("http://localhost:3000/compliance")
        page.wait_for_url("http://localhost:3000/compliance")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/compliance_page.png")

    except TimeoutError as e:
        print(f"Timeout error: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

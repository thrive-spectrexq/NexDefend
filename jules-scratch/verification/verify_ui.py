from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Screenshot of the Homepage
    page.goto("http://localhost:3000/")
    page.screenshot(path="jules-scratch/verification/homepage.png")

    # Screenshot of the Dashboard with the new Navbar
    page.goto("http://localhost:3000/login")
    page.get_by_label("Email").click()
    page.get_by_label("Email").fill("test@test.com")
    page.get_by_label("Password").click()
    page.get_by_label("Password").fill("password")
    page.get_by_role("button", name="Login").click()
    page.screenshot(path="jules-scratch/verification/dashboard.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

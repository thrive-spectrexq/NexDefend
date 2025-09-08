from playwright.sync_api import sync_playwright, Page, expect, TimeoutError
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Define the absolute path for the screenshot
    screenshot_path = "/app/jules-scratch/verification/home_page.png"
    error_screenshot_path = "/app/jules-scratch/verification/error.png"

    # Ensure the directory exists
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)


    try:
        page.goto("http://localhost:3000/")
        page.wait_for_url("http://localhost:3000/")
        page.screenshot(path=screenshot_path)
        print(f"Screenshot taken successfully at {screenshot_path}")

    except TimeoutError as e:
        print(f"Timeout error: {e}")
        page.screenshot(path=error_screenshot_path)
    finally:
        context.close()
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

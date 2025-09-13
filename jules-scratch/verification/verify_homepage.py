from playwright.sync_api import sync_playwright
import os

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # The absolute path to the build directory is needed for the file:// URL.
    # Based on previous errors, the repo root is /app.
    index_html_path = "/app/nexdefend-frontend/build/index.html"

    page.goto(f"file://{index_html_path}")

    # Wait for the page to load, a specific element to be visible
    page.wait_for_selector("h1")

    page.screenshot(path="jules-scratch/verification/homepage.png", full_page=True)
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    time.sleep(30) # Wait for the server to start
    page.goto("http://localhost:3000")
    page.screenshot(path="jules-scratch/verification/homepage.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

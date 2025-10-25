
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/dashboard")
    page.screenshot(path="jules-scratch/verification/dashboard.png")
    browser.close()

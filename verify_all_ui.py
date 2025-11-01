import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:5174/", wait_until="networkidle")
        await page.screenshot(path="verification/homepage.png")

        # Verify hero buttons
        await page.click('button:has-text("Get started free")')
        await page.wait_for_selector('.sidebar.open')
        await page.click('.close-btn')
        await page.wait_for_selector('.sidebar:not(.open)')
        await page.click('button:has-text("Request a demo")')
        await page.wait_for_selector('.sidebar.open')
        await page.click('.close-btn')

        # Verify sidebar form interactivity
        await page.click('button:has-text("Login")')
        await page.wait_for_selector('.sidebar.open')
        await page.fill('#login-email', 'test@example.com')
        await page.fill('#login-password', 'password')
        await page.screenshot(path="verification/sidebar_login_filled.png")
        await page.click('button:has-text("Register")')
        await page.fill('#register-name', 'Test User')
        await page.fill('#register-email', 'test@example.com')
        await page.fill('#register-password', 'password')
        await page.screenshot(path="verification/sidebar_register_filled.png")
        await page.click('.sidebar.open .btn-primary') # Submit the form
        await page.wait_for_selector('.sidebar:not(.open)')


        # Verify FAQ
        await page.evaluate('document.querySelector(".faq").scrollIntoView()')
        await page.click('button:has-text("Open source security")')
        await page.wait_for_selector('.faq-item.open')
        await page.screenshot(path="verification/faq_open.png")
        await page.click('button:has-text("Open source security")')
        await page.wait_for_selector('.faq-item:not(.open)')


        await browser.close()

asyncio.run(main())

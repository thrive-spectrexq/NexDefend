import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # Navigate directly to the dashboard
            await page.goto("http://localhost:4173/dashboard", timeout=60000)

            # Wait for the dashboard grid to be visible
            await page.wait_for_selector(".bg-gray-900", timeout=10000)

            # Take a screenshot
            screenshot_path = "verification/dashboard_tailwind.png"
            await page.screenshot(path=screenshot_path, full_page=True)
            print(f"Dashboard screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="verification/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

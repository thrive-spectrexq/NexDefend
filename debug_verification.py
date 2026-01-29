import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        base_url = "http://localhost:4173"

        # Capture console logs
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        print("Navigating...")
        await page.goto(base_url)
        await page.evaluate("localStorage.setItem('token', 'dummy-token')")

        # 1. Data Explorer Debug
        print("Checking Data Explorer...")
        await page.goto(f"{base_url}/data-explorer")
        await page.wait_for_load_state("networkidle")
        await page.screenshot(path="verification/debug_explorer.png")

        # Check Heading
        if await page.get_by_role("heading", name="Data Explorer").is_visible():
             print("Heading found.")
        else:
             print("Heading NOT found.")

        # Check Button
        if await page.get_by_text("RUN QUERY").is_visible():
             print("Button found.")
        else:
             print("Button NOT found.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

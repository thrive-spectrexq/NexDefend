import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        base_url = "http://localhost:4173"

        await page.goto(base_url)
        await page.evaluate("localStorage.setItem('token', 'dummy-token')")

        # 1. Topology
        print("Checking Topology...")
        await page.goto(f"{base_url}/topology")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/debug_topology.png")

        # 2. Vulnerabilities
        print("Checking Vulnerabilities...")
        await page.goto(f"{base_url}/vulnerabilities")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="verification/debug_vuln.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

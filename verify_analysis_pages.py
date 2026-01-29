import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        base_url = "http://localhost:4173"

        print("Navigating...")
        try:
            await page.goto(base_url)
        except Exception as e:
            print(f"Failed to connect: {e}")
            await browser.close()
            return

        # Inject token
        await page.evaluate("localStorage.setItem('token', 'dummy-token')")

        # 1. Topology
        print("1. Checking Topology...")
        await page.goto(f"{base_url}/topology")
        # Check for SVG
        try:
            svg = page.locator("svg")
            await svg.wait_for(state="visible", timeout=5000)
            print("SUCCESS: Topology SVG loaded.")
        except:
             print("FAILURE: Topology SVG not found.")
             await page.screenshot(path="verification/fail_topology.png")

        # 2. Data Explorer
        print("2. Checking Data Explorer...")
        await page.goto(f"{base_url}/data-explorer")
        # Use get_by_role for Heading
        if await page.get_by_role("heading", name="Data Explorer").is_visible():
             # Check for "RUN QUERY" button
             if await page.get_by_text("RUN QUERY").is_visible():
                 print("SUCCESS: Data Explorer loaded.")
             else:
                 print("FAILURE: Run Query button not found.")
        else:
             print("FAILURE: Data Explorer title not found.")

        # 3. Vulnerabilities
        print("3. Checking Vulnerabilities...")
        await page.goto(f"{base_url}/vulnerabilities")
        # Check for Donut Chart (recharts-surface)
        try:
            chart = page.locator(".recharts-surface").first
            await chart.wait_for(state="visible", timeout=5000)
            print("SUCCESS: Vulnerabilities Charts loaded.")
        except:
            print("FAILURE: Vulnerabilities Charts not found.")

        # 4. Cloud Dashboard
        print("4. Checking Cloud Dashboard...")
        await page.goto(f"{base_url}/cloud")
        if await page.get_by_text("Cloud Security Posture").is_visible():
             print("SUCCESS: Cloud Dashboard loaded.")
        else:
             print("FAILURE: Cloud Dashboard title not found.")

        print("Verification complete.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

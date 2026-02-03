import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        base_url = "http://localhost:4173"

        print(f"Navigating to {base_url}...")
        try:
            await page.goto(base_url, timeout=10000)
        except Exception as e:
            print(f"Failed to connect to {base_url}: {e}")
            await browser.close()
            return

        # Inject token
        await page.evaluate("localStorage.setItem('token', 'dummy-token-for-testing')")

        # 1. Verify UEBA
        print("\n--- Verifying UEBA Page ---")
        await page.goto(f"{base_url}/ueba")
        try:
            await page.get_by_text("User Risk Timeline").wait_for(timeout=5000)
            print("SUCCESS: 'User Risk Timeline' found.")
            await page.get_by_text("Insider Threat Vectors").wait_for(timeout=2000)
            print("SUCCESS: 'Insider Threat Vectors' Radar found.")
        except Exception as e:
            print(f"FAILURE: UEBA missing elements. {e}")
            await page.screenshot(path="verification/fail_ueba.png")

        # 2. Verify Compliance
        print("\n--- Verifying Compliance Page ---")
        await page.goto(f"{base_url}/compliance")
        try:
            await page.get_by_text("Framework Adherence").wait_for(timeout=5000)
            print("SUCCESS: 'Framework Adherence' Chart found.")
            await page.get_by_text("Control Gap Analysis").wait_for(timeout=2000)
            print("SUCCESS: 'Control Gap Analysis' found.")
        except Exception as e:
            print(f"FAILURE: Compliance missing elements. {e}")
            await page.screenshot(path="verification/fail_compliance.png")

        # 3. Verify Risk
        print("\n--- Verifying Risk Page ---")
        await page.goto(f"{base_url}/risk")
        try:
            await page.get_by_text("Risk Trend").wait_for(timeout=5000)
            print("SUCCESS: 'Risk Trend' Chart found.")
            await page.get_by_text("Risk Heatmap").wait_for(timeout=2000)
            print("SUCCESS: 'Risk Heatmap' found.")
        except Exception as e:
            print(f"FAILURE: Risk missing elements. {e}")
            await page.screenshot(path="verification/fail_risk.png")

        # 4. Verify Vulnerabilities
        print("\n--- Verifying Vulnerabilities Page ---")
        await page.goto(f"{base_url}/vulnerabilities")
        try:
            await page.get_by_text("Exploitability Context").wait_for(timeout=5000)
            print("SUCCESS: 'Exploitability Context' Chart found.")
            await page.get_by_text("Patch Velocity").wait_for(timeout=2000)
            print("SUCCESS: 'Patch Velocity' Chart found.")
        except Exception as e:
             print(f"FAILURE: Vulnerabilities missing elements. {e}")
             await page.screenshot(path="verification/fail_vuln.png")

        print("\nVerification complete.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

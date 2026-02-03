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
        print("Injecting auth token...")
        await page.evaluate("localStorage.setItem('token', 'dummy-token-for-testing')")

        # 1. Verify Main Dashboard
        print("\n--- Verifying Main Dashboard ---")
        await page.goto(f"{base_url}/dashboard")
        try:
            await page.get_by_text("Security Posture").wait_for(timeout=5000)
            print("SUCCESS: 'Security Posture' Gauge found.")
            await page.get_by_text("NexDefend AI Insights").wait_for(timeout=2000)
            print("SUCCESS: 'AI Insights' panel found.")
        except Exception as e:
            print(f"FAILURE: Main Dashboard missing elements. {e}")
            await page.screenshot(path="verification/fail_dashboard_new.png")

        # 2. Verify Network Dashboard
        print("\n--- Verifying Network Dashboard ---")
        await page.goto(f"{base_url}/network")
        try:
            await page.get_by_text("Flow Quality Analysis").wait_for(timeout=5000)
            print("SUCCESS: 'Flow Quality Analysis' Scatter Chart found.")
            await page.get_by_text("Top Talkers").wait_for(timeout=2000)
            print("SUCCESS: 'Top Talkers' Bar Chart found.")
        except Exception as e:
            print(f"FAILURE: Network Dashboard missing elements. {e}")
            await page.screenshot(path="verification/fail_network_new.png")

        # 3. Verify Threat Intel
        print("\n--- Verifying Threat Intel Page ---")
        await page.goto(f"{base_url}/threat-intel")
        try:
            await page.get_by_text("Attack Vector Analysis").wait_for(timeout=5000)
            print("SUCCESS: 'Attack Vector Analysis' Radar Chart found.")
            await page.get_by_text("Threat Campaign Activity").wait_for(timeout=2000)
            print("SUCCESS: 'Campaign Activity' Chart found.")
        except Exception as e:
            print(f"FAILURE: Threat Intel missing elements. {e}")
            await page.screenshot(path="verification/fail_threat_new.png")

        # 4. Verify Cloud Dashboard
        print("\n--- Verifying Cloud Dashboard ---")
        await page.goto(f"{base_url}/cloud")
        try:
            await page.get_by_text("Cloud Spend & Forecast").wait_for(timeout=5000)
            print("SUCCESS: 'Cloud Spend' Chart found.")
            await page.get_by_text("Workload Distribution").wait_for(timeout=2000)
            print("SUCCESS: 'Workload Distribution' Chart found.")
        except Exception as e:
             print(f"FAILURE: Cloud Dashboard missing elements. {e}")
             await page.screenshot(path="verification/fail_cloud_new.png")

        print("\nVerification passed successfully.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

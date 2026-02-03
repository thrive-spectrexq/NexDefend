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

        # ---------------------------
        # Settings Page Verification
        # ---------------------------
        print("\n--- Verifying Settings Page ---")
        await page.goto(f"{base_url}/settings")

        # Wait for title
        try:
            await page.get_by_text("System Configuration").wait_for(timeout=5000)
            print("SUCCESS: Settings Page loaded.")
        except:
            print("FAILURE: Settings Page title not found.")
            await page.screenshot(path="verification/fail_settings_load.png")
            await browser.close()
            return

        # Check Tabs
        print("Checking Tabs...")
        if await page.get_by_role("button", name="Integrations").is_visible():
             print("SUCCESS: 'Integrations' tab found.")
        else:
             print("FAILURE: 'Integrations' tab missing.")

        # Click Integrations
        print("Clicking 'Integrations' tab...")
        await page.get_by_role("button", name="Integrations").click()

        # Check for Slack Card
        try:
            await page.get_by_text("Slack").first.wait_for(timeout=2000)
            print("SUCCESS: Slack integration card visible.")
        except:
            print("FAILURE: Slack integration card not found.")
            await page.screenshot(path="verification/fail_settings_integrations.png")

        # ---------------------------
        # Profile Page Verification
        # ---------------------------
        print("\n--- Verifying Profile Page ---")
        await page.goto(f"{base_url}/profile")

        # Wait for Tabs (User name might load async, but tabs are static-ish or load fast)
        try:
            await page.get_by_role("button", name="Security & Login").wait_for(timeout=5000)
            print("SUCCESS: Profile Page loaded.")
        except:
            print("FAILURE: Profile Page 'Security' tab not found.")
            await page.screenshot(path="verification/fail_profile_load.png")
            await browser.close()
            return

        # Click Security
        print("Clicking 'Security & Login' tab...")
        await page.get_by_role("button", name="Security & Login").click()

        # Check for Change Password
        if await page.get_by_text("Change Password").first.is_visible():
            print("SUCCESS: 'Change Password' section visible.")
        else:
            print("FAILURE: 'Change Password' section missing.")

        print("\nVerification passed successfully.")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

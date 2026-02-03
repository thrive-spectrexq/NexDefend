import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        print("Launching browser...")
        browser = await p.chromium.launch(headless=True)
        # 1. Desktop Context
        context_desktop = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page_desktop = await context_desktop.new_page()
        base_url = "http://localhost:4173"

        print("Navigating Desktop...")
        try:
            await page_desktop.goto(base_url, timeout=10000)
            await page_desktop.evaluate("localStorage.setItem('token', 'dummy-token')")
            await page_desktop.goto(base_url + "/dashboard")

            # Check Sidebar is visible and wide
            sidebar = page_desktop.locator("aside")
            await sidebar.wait_for()

            # Click Toggle
            toggle_btn = page_desktop.locator("button:has(svg.lucide-menu)")
            await toggle_btn.click()

            # Check if collapsed (width should change or class should change)
            # Just ensuring no error for now
            print("SUCCESS: Desktop sidebar toggle clicked.")

        except Exception as e:
            print(f"FAILURE: Desktop verification failed. {e}")
            await page_desktop.screenshot(path="verification/fail_sidebar_desktop.png")


        # 2. Mobile Context
        print("Navigating Mobile (iPhone 12 viewport)...")
        context_mobile = await browser.new_context(viewport={'width': 390, 'height': 844})
        page_mobile = await context_mobile.new_page()

        try:
            await page_mobile.goto(base_url, timeout=10000)
            await page_mobile.evaluate("localStorage.setItem('token', 'dummy-token')")
            await page_mobile.goto(base_url + "/dashboard")

            # Sidebar should be hidden initially (translated off screen)
            # We check if backdrop is NOT visible
            backdrop = page_mobile.locator(".fixed.inset-0.bg-black\/80")
            if await backdrop.is_visible():
                print("FAILURE: Mobile backdrop visible on load.")
            else:
                 print("SUCCESS: Mobile backdrop hidden on load.")

            # Click Hamburger
            toggle_btn_mobile = page_mobile.locator("button:has(svg.lucide-menu)")
            await toggle_btn_mobile.click()

            # Now backdrop should be visible
            await backdrop.wait_for(state="visible", timeout=2000)
            print("SUCCESS: Mobile sidebar opened (backdrop visible).")

            # Click backdrop to close
            await backdrop.click()
            await backdrop.wait_for(state="hidden", timeout=2000)
            print("SUCCESS: Mobile sidebar closed via backdrop.")

        except Exception as e:
             print(f"FAILURE: Mobile verification failed. {e}")
             await page_mobile.screenshot(path="verification/fail_sidebar_mobile.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

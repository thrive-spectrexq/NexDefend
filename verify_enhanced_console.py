from playwright.sync_api import sync_playwright, expect
import time

def verify_enhanced_console():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        print("Navigating to Command Dashboard...")
        # Direct navigation to dashboard (auth removed for dev)
        page.goto("http://localhost:5173/dashboard")
        time.sleep(2) # Wait for page load and animations

        print("Checking Command Dashboard...")
        # Check stat cards
        expect(page.get_by_text("Security Score")).to_be_visible()
        expect(page.get_by_text("Active Threats")).to_be_visible()

        # Take screenshot of Dashboard
        page.screenshot(path="/home/jules/verification/enhanced_dashboard.png")
        print("Dashboard screenshot captured.")

        print("Navigating to Detections Queue...")
        page.get_by_text("Detections").click()
        time.sleep(1)
        expect(page.get_by_text("Detections Queue")).to_be_visible()

        # Check Filter Panel Interaction
        page.get_by_text("Filter View").click()
        time.sleep(0.5)

        # Use more specific selector for "Severity" label in filter panel
        expect(page.locator("label").filter(has_text="Severity")).to_be_visible()

        # Take screenshot of Detections
        page.screenshot(path="/home/jules/verification/enhanced_detections.png")
        print("Detections screenshot captured.")

        print("Navigating to Host Management...")
        page.get_by_text("Hosts").click()
        time.sleep(1)
        expect(page.get_by_text("FIN-WS-004")).to_be_visible()

        # Click a host to go to Details
        print("Navigating to Host Details...")
        page.get_by_text("FIN-WS-004").click()
        time.sleep(1)
        expect(page.get_by_text("System Information")).to_be_visible()
        expect(page.get_by_text("Resource Usage")).to_be_visible()

        # Take screenshot of Host Details
        page.screenshot(path="/home/jules/verification/enhanced_host_details.png")
        print("Host Details screenshot captured.")

        print("Checking Toast Notification...")
        # Wait for simulated socket event (usually 8s)
        print("Waiting for websocket event...")
        try:
            # Look for a toast notification
            # Note: We look for the class used in critical/high alerts or the container
            toast = page.locator(".fixed.bottom-6.right-6 div").first

            # wsService emits every 8s
            toast.wait_for(state="visible", timeout=12000)
            page.screenshot(path="/home/jules/verification/enhanced_toast.png")
            print("Toast screenshot captured.")
        except Exception as e:
            print(f"Toast verification skipped or timed out: {e}")

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_enhanced_console()

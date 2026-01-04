
from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the dashboard (using mock server if possible, or build preview)
        # Assuming dev server is running on 5173
        try:
            page.goto('http://localhost:5173/dashboard')
            page.wait_for_timeout(3000) # Wait for page load

            # Screenshot Command Dashboard
            page.screenshot(path='verification/dashboard.png')
            print('Screenshot saved: dashboard.png')

            # Open Notification Center
            page.get_by_role('button').filter(has_text='').nth(1).click() # Trying to find bell icon - selector might be tricky without aria-label
            # Actually, I added aria-label? No. Let's try CSS selector for bell icon parent
            # The bell icon is inside a button in TopBar.

            # Alternative: Navigate to Host Details
            page.goto('http://localhost:5173/dashboard/hosts/FIN-WS-004')
            page.wait_for_timeout(2000)
            page.screenshot(path='verification/host_details.png')
            print('Screenshot saved: host_details.png')

            # Click Remote Shell
            page.get_by_text('Remote Shell').click()
            page.wait_for_timeout(1000)
            page.screenshot(path='verification/remote_shell.png')
            print('Screenshot saved: remote_shell.png')

        except Exception as e:
            print(f'Error: {e}')
        finally:
            browser.close()

if __name__ == '__main__':
    verify_frontend()

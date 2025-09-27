const puppeteer = require('puppeteer');

async function submitForm() {
    try {
        console.log('Starting form submission...');
        
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium', // Use system Chromium
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--disable-extensions'
            ] // Important for Replit
        });
        
        const page = await browser.newPage();
        await page.goto('https://docs.google.com/forms/d/e/1FAIpQLSedsvopvHyfYrMVaizi53DWs1-joDSzpZiLroJ8hRKRLyOQvQ/viewform', { waitUntil: 'networkidle2' });
        console.log('Page loaded');
        
        // Wait a bit for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for Google Form to load and find form fields
        let formFieldFound = false;
        try {
            // Wait for Google Form fields to be available
            await page.waitForSelector('input[type="text"], textarea, input[type="email"], input[type="tel"], input[type="number"]', { timeout: 10000 });
            console.log('Form fields found');
            
            // Get all form input fields
            const formInputs = await page.$$('input[type="text"], textarea, input[type="email"], input[type="tel"], input[type="number"]');
            console.log(`Found ${formInputs.length} form input fields`);
            
            if (formInputs.length > 0) {
                console.log('Filling form fields with specific data...');
                
                // Fill Student ID (first field) - try multiple methods
                if (formInputs[0]) {
                    console.log('Attempting to fill Student ID field...');
                    await formInputs[0].click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Clear any existing text first
                    await formInputs[0].click({ clickCount: 3 }); // Select all text
                    await page.keyboard.press('Delete');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Try different typing methods
                    try {
                        await formInputs[0].type('20-05-0076', { delay: 100 });
                        console.log('Filled Student ID: 20-05-0076');
                    } catch (error) {
                        console.log('Direct typing failed, trying keyboard method...');
                        await page.keyboard.type('20-05-0076');
                    }
                }
                
                // Fill Last Name (second field)
                if (formInputs[1]) {
                    console.log('Attempting to fill Last Name field...');
                    await formInputs[1].click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    await formInputs[1].click({ clickCount: 3 });
                    await page.keyboard.press('Delete');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    try {
                        await formInputs[1].type('Abarientos', { delay: 100 });
                        console.log('Filled Last Name: Abarientos');
                    } catch (error) {
                        await page.keyboard.type('Abarientos');
                    }
                }
                
                // Fill First Name (third field)
                if (formInputs[2]) {
                    console.log('Attempting to fill First Name field...');
                    await formInputs[2].click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    await formInputs[2].click({ clickCount: 3 });
                    await page.keyboard.press('Delete');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    try {
                        await formInputs[2].type('Al Cedric', { delay: 100 });
                        console.log('Filled First Name: Al Cedric');
                    } catch (error) {
                        await page.keyboard.type('Al Cedric');
                    }
                }
                
                // Fill Middle Initial (fourth field)
                if (formInputs[3]) {
                    console.log('Attempting to fill Middle Initial field...');
                    await formInputs[3].click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    await formInputs[3].click({ clickCount: 3 });
                    await page.keyboard.press('Delete');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    try {
                        await formInputs[3].type('L.', { delay: 100 });
                        console.log('Filled Middle Initial: L.');
                    } catch (error) {
                        await page.keyboard.type('L.');
                    }
                }
                
                formFieldFound = true;
            }
            
            // Handle the 5th field - selection dropdown (PRESENT/EXCUSE)
            try {
                console.log('Looking for dropdown to select PRESENT...');
                
                // Look for dropdown/select elements
                const dropdowns = await page.$$('select, div[role="listbox"], div[jsname="LgbsSe"]');
                console.log(`Found ${dropdowns.length} dropdown elements`);
                
                if (dropdowns.length > 0) {
                    // Click on the dropdown to open it
                    console.log('Opening dropdown...');
                    await dropdowns[0].click();
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Try keyboard navigation to select PRESENT
                    console.log('Using keyboard navigation to select PRESENT...');
                    
                    // Focus on the dropdown
                    await dropdowns[0].focus();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Press Enter to open dropdown (if not already open)
                    await page.keyboard.press('Enter');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Use arrow keys to navigate to PRESENT
                    console.log('Trying arrow key navigation...');
                    
                    // Method 1: Try going down once
                    await page.keyboard.press('ArrowDown');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await page.keyboard.press('Enter');
                    console.log('Selected option with ArrowDown + Enter');
                    
                    // Wait a bit to see if that worked
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // If that didn't work, try going down twice
                    console.log('Trying second option...');
                    await dropdowns[0].focus();
                    await page.keyboard.press('Enter');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await page.keyboard.press('ArrowDown');
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await page.keyboard.press('ArrowDown');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await page.keyboard.press('Enter');
                    console.log('Selected option with ArrowDown + ArrowDown + Enter');
                } else {
                    console.log('No dropdown found');
                }
                
            } catch (error) {
                console.log('Could not handle selection field:', error.message);
            }
            
        } catch (error) {
            console.log('Could not find form fields, taking debug screenshot...');
            await page.screenshot({ path: 'debug-screenshot.png' });
            throw error;
        }
        
        if (formFieldFound) {
            console.log('Form fields filled successfully');
            
            // Look for submit button
            try {
                console.log('Looking for submit button...');
                
                // Try multiple selectors for the Google Form submit button
                const submitSelectors = [
                    'div[jsname="M2UYVd"]',  // The specific jsname from your HTML
                    'div[role="button"][aria-label="Submit"]',  // Role and aria-label
                    'div[role="button"]:has-text("Submit")',  // Role with Submit text
                    'button[type="submit"]',  // Standard submit button
                    'div[class*="uArJ5e"]'  // Class-based selector
                ];
                
                let submitButton = null;
                for (const selector of submitSelectors) {
                    try {
                        submitButton = await page.$(selector);
                        if (submitButton) {
                            console.log(`Found submit button with selector: ${selector}`);
                            break;
                        }
                    } catch (error) {
                        console.log(`Selector ${selector} failed:`, error.message);
                    }
                }
                
                if (submitButton) {
                    await submitButton.click();
                    console.log('Clicked submit button successfully');
                    
                    // Wait for form submission to process
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Check if we're still on the form page or if submission was successful
                    const currentUrl = page.url();
                    console.log('Current URL after submit:', currentUrl);
                    
                    // Check if URL changed (indicating successful submission)
                    if (currentUrl.includes('formResponse') || currentUrl.includes('thank') || currentUrl !== 'https://docs.google.com/forms/d/e/1FAIpQLSedsvopvHyfYrMVaizi53DWs1-joDSzpZiLroJ8hRKRLyOQvQ/viewform') {
                        console.log('SUCCESS: Form submitted! URL changed to:', currentUrl);
                    } else {
                        console.log('WARNING: Form may not have submitted - URL unchanged');
                        
                        // Try pressing Enter again as fallback
                        console.log('Trying Enter key as fallback...');
                        await page.keyboard.press('Enter');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        const finalUrl = page.url();
                        console.log('Final URL after Enter fallback:', finalUrl);
                    }
                    
                    // Look for success indicators
                    const successIndicators = await page.$$('div:has-text("Your response has been recorded"), div:has-text("Thank you"), div:has-text("Success")');
                    if (successIndicators.length > 0) {
                        console.log('Form submitted successfully!');
                    } else {
                        console.log('Form submission may not have completed, checking for errors...');
                        const errorElements = await page.$$('div:has-text("error"), div:has-text("Error"), div:has-text("required")');
                        if (errorElements.length > 0) {
                            console.log('Found potential error messages on the page');
                        }
                    }
                } else {
                    console.log('Submit button not found with any selector, trying to press Enter');
                    await page.keyboard.press('Enter');
                    
                    // Wait and check for submission
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    const currentUrl = page.url();
                    console.log('Current URL after Enter key:', currentUrl);
                }
            } catch (error) {
                console.log('Could not find submit button, pressing Enter');
                await page.keyboard.press('Enter');
            }
        }
        
        await browser.close();
        console.log('Form submission completed successfully!');
        
    } catch (error) {
        console.error('Error in form submission:', error);
        throw error;
    }
}

module.exports = submitForm;

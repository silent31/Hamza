const fs = require('fs-extra');
const path = require('path');
const login = require('aminul-new-fca');

/**
 * Complete A-to-Z login implementation using aminul-new-fca with account.txt
 * @param {string} accountPath - Path to account.txt file
 * @param {object} options - Login options for aminul-new-fca
 * @returns {Promise<object>} - Returns the Facebook API object
 */
async function loginWithAccountTxt(accountPath, options = {}) {
    try {
        // Check if account.txt exists
        if (!fs.existsSync(accountPath)) {
            throw new Error(`Account file not found: ${accountPath}`);
        }

        // Read and parse account.txt
        const accountText = fs.readFileSync(accountPath, 'utf8').trim();
        let appState;

        try {
            // Parse the account.txt as JSON (cookies/appstate)
            appState = JSON.parse(accountText);
            
            // Validate appState format
            if (!Array.isArray(appState)) {
                throw new Error('Invalid appState format: Expected an array');
            }

            // Check for required cookies
            const requiredCookies = ['c_user', 'xs', 'datr'];
            const cookieNames = appState.map(cookie => cookie.name || cookie.key);
            
            for (const required of requiredCookies) {
                if (!cookieNames.includes(required)) {
                    throw new Error(`Missing required cookie: ${required}`);
                }
            }

            // Convert cookies to proper format for aminul-new-fca if needed
            appState = appState.map(cookie => {
                if (cookie.name && !cookie.key) {
                    return {
                        ...cookie,
                        key: cookie.name,
                        domain: cookie.domain || '.facebook.com',
                        path: cookie.path || '/',
                        hostOnly: cookie.hostOnly || false,
                        creation: cookie.creation || new Date().toISOString(),
                        lastAccessed: cookie.lastAccessed || new Date().toISOString()
                    };
                }
                return cookie;
            });

        } catch (parseError) {
            throw new Error(`Failed to parse account.txt: ${parseError.message}`);
        }

        // Default login options for aminul-new-fca
        const loginOptions = {
            forceLogin: true,
            listenEvents: true,
            updatePresence: true,
            selfListen: true,
            selfListenEvent: true,
            autoMarkDelivery: false,
            autoReconnect: true,
            online: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            ...options
        };

        console.log('[ AMINUL-LOGIN ]', 'Starting login with account.txt...');
        console.log('[ AMINUL-LOGIN ]', `Found ${appState.length} cookies in account.txt`);

        // Login using aminul-new-fca with appState
        return new Promise((resolve, reject) => {
            login({ appState }, loginOptions, (err, api) => {
                if (err) {
                    console.error('[ AMINUL-LOGIN ]', 'Login failed:', err);
                    
                    // Handle specific errors
                    if (err.error === 'login-approval') {
                        return reject(new Error('Login approval required. Please check your Facebook account for security alerts.'));
                    } else if (err.error === 'checkpoint-required') {
                        return reject(new Error('Facebook checkpoint required. Please log into Facebook manually to resolve security checks.'));
                    } else if (err.toString().includes('appState')) {
                        return reject(new Error('Invalid or expired session. Please update your account.txt with fresh cookies.'));
                    }
                    
                    return reject(err);
                }

                console.log('[ AMINUL-LOGIN ]', 'Successfully logged in with aminul-new-fca!');
                
                // Save updated appState back to account.txt
                try {
                    const updatedAppState = api.getAppState();
                    fs.writeFileSync(accountPath, JSON.stringify(updatedAppState, null, 2));
                    console.log('[ AMINUL-LOGIN ]', 'Updated account.txt with fresh session data');
                } catch (saveError) {
                    console.warn('[ AMINUL-LOGIN ]', 'Warning: Could not save updated session:', saveError.message);
                }

                resolve(api);
            });
        });

    } catch (error) {
        console.error('[ AMINUL-LOGIN ]', 'Error during login process:', error.message);
        throw error;
    }
}

/**
 * Get Facebook user ID from appState
 * @param {array} appState - Array of cookies/appState
 * @returns {string|null} - Facebook user ID or null
 */
function getUserIdFromAppState(appState) {
    try {
        const cUserCookie = appState.find(cookie => 
            (cookie.name === 'c_user' || cookie.key === 'c_user')
        );
        return cUserCookie ? cUserCookie.value : null;
    } catch (error) {
        return null;
    }
}

/**
 * Validate account.txt file format
 * @param {string} accountPath - Path to account.txt file
 * @returns {object} - Validation result
 */
function validateAccountTxt(accountPath) {
    try {
        if (!fs.existsSync(accountPath)) {
            return { valid: false, error: 'File does not exist' };
        }

        const content = fs.readFileSync(accountPath, 'utf8').trim();
        const appState = JSON.parse(content);

        if (!Array.isArray(appState)) {
            return { valid: false, error: 'Not a valid array format' };
        }

        const requiredCookies = ['c_user', 'xs', 'datr'];
        const cookieNames = appState.map(cookie => cookie.name || cookie.key);
        const missingCookies = requiredCookies.filter(required => !cookieNames.includes(required));

        if (missingCookies.length > 0) {
            return { valid: false, error: `Missing required cookies: ${missingCookies.join(', ')}` };
        }

        const userId = getUserIdFromAppState(appState);
        
        return { 
            valid: true, 
            userId, 
            cookieCount: appState.length,
            hasValidSession: !!userId
        };

    } catch (error) {
        return { valid: false, error: `Parse error: ${error.message}` };
    }
}

module.exports = {
    loginWithAccountTxt,
    getUserIdFromAppState,
    validateAccountTxt
};
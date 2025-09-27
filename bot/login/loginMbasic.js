const cheerio = require("cheerio");
const qs = require('qs');

module.exports = async function loginMbasic(options) {
    const { email, pass, twoFactorSecretOrCode, userAgent, proxy } = options;
    
    const headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Microsoft Edge\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": userAgent || "Mozilla/5.0 (Linux; Android 12; M2102J20SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36"
    };

    let _request;
    if (proxy) {
        _request = require("request").defaults({ jar: true, headers, simple: false, proxy });
    } else {
        _request = require("request").defaults({ jar: true, headers, simple: false });
    }

    const request = (options) => {
        return new Promise((resolve, reject) => {
            _request(options, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    };

    const jar = _request.jar();
    const targetCookie = "https://mbasic.facebook.com/";
    jar.setCookie(`locale=en_US`, targetCookie);

    try {
        // Get login page
        const res1 = await request({
            url: 'https://mbasic.facebook.com/login/',
            method: 'GET',
            jar
        });

        let $ = cheerio.load(res1.body);
        const formData = { ...qs.parse($('#login_form').serialize()) };
        
        delete formData.pass;
        formData.email = email;
        formData.pass = pass;

        // Submit login form
        const res2 = await request({
            url: 'https://mbasic.facebook.com/login/device-based/login/async/?refsrc=deprecated&lwv=100',
            method: 'POST',
            jar,
            form: formData
        });

        // Check for various error conditions
        if (res2.body.includes(`You used an old password`)) {
            const error = new Error('You used an old password');
            error.name = 'OLD_PASSWORD';
            throw error;
        }

        if (res2.body.includes(`Invalid username or password`) || 
            res2.body.includes(`Incorrect password`) ||
            res2.body.includes(`forgot_password_uri`)) {
            const error = new Error('Wrong username or password');
            error.name = 'WRONG_ACCOUNT';
            throw error;
        }

        // Check if login successful
        if (jar.getCookieString(targetCookie).includes('c_user')) {
            return jar.getCookies(targetCookie);
        }

        // Handle 2FA if needed
        if (res2.body.includes('checkpoint') || res2.body.includes('two-factor')) {
            if (twoFactorSecretOrCode) {
                // Handle 2FA code submission
                const res3 = await request({
                    url: 'https://mbasic.facebook.com/checkpoint/?next=https://mbasic.facebook.com/home.php',
                    jar,
                    method: 'GET'
                });

                $ = cheerio.load(res3.body);
                const formData2FA = { ...qs.parse($('form[method="post"]').serialize()) };
                formData2FA.approvals_code = twoFactorSecretOrCode;

                const res4 = await request({
                    url: 'https://mbasic.facebook.com/login/checkpoint/',
                    method: 'POST',
                    form: formData2FA,
                    jar
                });

                if (jar.getCookieString(targetCookie).includes('c_user')) {
                    return jar.getCookies(targetCookie);
                }
            }
            
            const error = new Error('2FA code required');
            error.name = '2FA_REQUIRED';
            throw error;
        }

        const error = new Error("Can't login to Facebook, please check your credentials");
        error.name = "LOGIN_FAILED";
        throw error;

    } catch (err) {
        if (err.name) throw err;
        
        const error = new Error(`Login failed: ${err.message}`);
        error.name = "LOGIN_ERROR";
        throw error;
    }
};
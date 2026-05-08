// Anti-detection and obfuscation layer
class SecuritySystem {
    constructor() {
        this.validateEnvironment();
        this.preventDebugging();
        this.disableConsoleLogging();
        this.checkForMonitoringTools();
    }

    validateEnvironment() {
        // Check if running in legitimate browser environment
        if (typeof window === 'undefined') return;
        
        // Prevent execution in iframes or restricted contexts
        try {
            if (window.self !== window.top) {
                // Allow parent frame but log attempt
            }
        } catch (e) {
            // Cross-origin restriction - likely sandbox
        }
    }

    preventDebugging() {
        // Detect if developer tools are open
        let debugOpen = false;
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold ||
                window.outerWidth - window.innerWidth > threshold) {
                debugOpen = true;
            }
        }, 500);
    }

    disableConsoleLogging() {
        // Prevent sensitive info leakage through console
        const originalLog = console.log;
        console.log = function(...args) {
            // Only log if contains specific keywords
            const str = args.join(' ');
            if (str.includes('physics') || str.includes('education') || str.includes('error')) {
                originalLog.apply(console, args);
            }
        };
    }

    checkForMonitoringTools() {
        // Detect common monitoring/filtering tools
        const monitoringSignatures = [
            'websense', 'zscaler', 'fortinet', 'paloalto', 
            'cisco', 'symantec', 'mcafee', 'kaspersky'
        ];
        
        // Check user agent
        const ua = navigator.userAgent.toLowerCase();
        monitoringSignatures.forEach(sig => {
            if (ua.includes(sig)) {
                // Detected monitoring tool - still allow but note it
            }
        });
    }
}

// Educational content validation (disguise)
class ContentValidator {
    static isEducationalContext() {
        // Check if page contains educational keywords
        const pageText = document.body.innerText.toLowerCase();
        return pageText.includes('physics') || 
               pageText.includes('science') || 
               pageText.includes('learning') ||
               pageText.includes('education');
    }

    static validatePageContent() {
        // Ensure Sparx Science content is visible
        const sparxPage = document.getElementById('sparxPage');
        return sparxPage && !sparxPage.classList.contains('hidden');
    }
}

// Main application controller with enhanced security
class ApplicationController {
    constructor() {
        this.security = new SecuritySystem();
        this.secretTriggerClicked = false;
        this.clickCount = 0;
        this.lastClickTime = 0;
        this.accessAttempts = 0;
        this.maxAttempts = 10; // Prevent brute force
        this.setupSecretTrigger();
        this.setupFailsafes();
    }

    setupSecretTrigger() {
        const trigger = document.getElementById('secretTrigger');
        
        // Primary access method: bottom right corner double-click
        trigger.addEventListener('click', () => {
            this.handleSecretTrigger();
        });

        // Backup methods to prevent detection by single-method blocking
        
        // Method 1: Keyboard shortcut (Ctrl+Shift+U)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'U') {
                this.handleSecretTrigger();
            }
        });

        // Method 2: Alt+Shift+P (Phoenix)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.shiftKey && e.key === 'P') {
                this.handleSecretTrigger();
            }
        });

        // Method 3: Triple-tap with 2-finger touch on mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                this.accessAttempts++;
                if (this.accessAttempts >= 3) {
                    this.handleSecretTrigger();
                    this.accessAttempts = 0;
                }
            }
        }, false);

        // Method 4: Vibration pattern on mobile (if supported)
        if (navigator.vibrate) {
            document.addEventListener('click', (e) => {
                // Random trigger for mobile that won't be obviously detectable
                if (Math.random() < 0.001 && e.clientX > window.innerWidth - 50) {
                    navigator.vibrate(100);
                }
            });
        }
    }

    setupFailsafes() {
        // Prevent page from being detected as game
        // Regularly validate educational content
        setInterval(() => {
            if (!ContentValidator.isEducationalContext()) {
                // Restore educational appearance if removed
                const header = document.querySelector('.sparx-header');
                if (header) header.style.display = 'block';
            }
        }, 5000);

        // Prevent screenshots/recording detection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.shiftKey && e.key === 'S')) {
                // Don't block, just note it happened
            }
        });
    }

    handleSecretTrigger() {
        // Rate limiting to prevent brute force
        if (this.accessAttempts > this.maxAttempts) {
            return;
        }

        const now = Date.now();
        
        // Double-click detection (within 500ms)
        if (now - this.lastClickTime < 500) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
        }
        
        this.lastClickTime = now;

        // Show CAPTCHA on second click or alternative methods
        if (this.clickCount === 2 || this.accessAttempts > 0) {
            this.showCaptcha();
            this.clickCount = 0;
            this.accessAttempts = 0;
        }
    }

    showCaptcha() {
        const modal = document.getElementById('captchaModal');
        modal.classList.remove('hidden');
        document.getElementById('captchaInput').focus();
        
        // Regenerate CAPTCHA if it hasn't been already
        if (window.captchaSystem) {
            window.captchaSystem.generateNewCode();
        }
    }
}

// Initialize with security checks
let appController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Validate we're in educational context before initializing
        if (ContentValidator.isEducationalContext()) {
            appController = new ApplicationController();
        }
    });
} else {
    if (ContentValidator.isEducationalContext()) {
        appController = new ApplicationController();
    }
}

// Smooth scroll for any links and prevent detection
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
    }
});

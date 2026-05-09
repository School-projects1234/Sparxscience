// Advanced Passcode Verification System with anti-brute-force
class PasscodeSystem {
    constructor() {
        // The secret admin passcode is hidden as a char code array in the file
        this.correctPasscode = this.obfuscateCode(this.decodeSecret([48, 56, 50, 56, 49, 56]));
        this.adminEmail = this.decodeSecret([97, 100, 109, 105, 110, 64, 115, 112, 97, 114, 120, 115, 99, 105, 101, 110, 99, 101, 46, 99, 111, 109]).toLowerCase();
        this.attemptCount = 0;
        this.maxAttempts = 5;
        this.lockoutTime = 0;
        this.setupEventListeners();
        this.startAttemptMonitoring();
    }

    decodeSecret(values) {
        if (Array.isArray(values)) {
            return String.fromCharCode(...values);
        }

        try {
            return atob(values);
        } catch (e) {
            return '';
        }
    }

    obfuscateCode(code) {
        // Simple obfuscation that's still functional
        // Store as character codes to make source harder to read
        return code.split('').map(c => c.charCodeAt(0)).join(',');
    }

    comparePasscode(input) {
        // Compare by converting input the same way
        const inputCodes = input.split('').map(c => c.charCodeAt(0)).join(',');
        return inputCodes === this.correctPasscode;
    }

    setupEventListeners() {
        document.getElementById('submitPasscode').addEventListener('click', () => this.verify());
        document.getElementById('passcodeInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verify();
        });
    }

    startAttemptMonitoring() {
        // Monitor for brute force attempts
        setInterval(() => {
            // Gradually reduce attempt count over time
            if (this.attemptCount > 0 && Math.random() > 0.8) {
                this.attemptCount = Math.max(0, this.attemptCount - 1);
            }
        }, 10000);
    }

    verify() {
        // Check lockout
        if (this.lockoutTime > Date.now()) {
            const waitTime = Math.ceil((this.lockoutTime - Date.now()) / 1000);
            document.getElementById('passcodeError').textContent = 
                `Too many attempts. Wait ${waitTime} seconds.`;
            document.getElementById('passcodeError').classList.remove('hidden');
            return false;
        }

        // Increment attempt counter
        this.attemptCount++;
        
        const input = document.getElementById('passcodeInput').value.toUpperCase();
        const errorElement = document.getElementById('passcodeError');
        
        if (this.comparePasscode(input)) {
            if (!window.sparxScience || window.sparxScience.currentAccount.toLowerCase() !== this.adminEmail) {
                errorElement.textContent = 'Admin passcode is valid only for the admin account.';
                errorElement.classList.remove('hidden');
                document.getElementById('passcodeInput').value = '';
                return false;
            }

            errorElement.classList.add('hidden');
            document.getElementById('passcodeModal').classList.add('hidden');
            document.getElementById('passcodeInput').value = '';
            this.attemptCount = 0; // Reset on success

            // Log successful verification (without exposing details)
            this.logVerification(true);

            setTimeout(() => {
                if (window.sparxScience) {
                    window.sparxScience.handleAdminAuth();
                }
            }, 300);

            return true;
        } else {
            // Wrong passcode
            
            // Implement exponential backoff
            if (this.attemptCount >= this.maxAttempts) {
                this.lockoutTime = Date.now() + (Math.pow(2, this.attemptCount - this.maxAttempts) * 5000);
                errorElement.textContent = 'Too many attempts. Try again later.';
            } else {
                const remaining = this.maxAttempts - this.attemptCount;
                errorElement.textContent = `Invalid passcode. ${remaining} attempts remaining.`;
            }
            
            errorElement.classList.remove('hidden');
            document.getElementById('passcodeInput').value = '';
            
            // Log failed attempt
            this.logVerification(false);
            
            return false;
        }
    }

    logVerification(success) {
        // Client-side logging for monitoring (doesn't send anywhere)
        const timestamp = new Date().toLocaleTimeString();
        const status = success ? '✓' : '✗';
        // Could be extended to send to a analytics service if needed
    }
}

// Initialize passcode system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.passcodeSystem = new PasscodeSystem();
    });
} else {
    window.passcodeSystem = new PasscodeSystem();
}

// Close passcode modal
document.getElementById('closePasscode').addEventListener('click', () => {
    document.getElementById('passcodeModal').classList.add('hidden');
    document.getElementById('passcodeInput').value = '';
});

// Prevent passcode field from being auto-filled
document.getElementById('passcodeInput').addEventListener('paste', (e) => {
    e.preventDefault();
    return false;
});

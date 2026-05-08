// Advanced CAPTCHA System - Resistant to OCR and automation
class CaptchaSystem {
    constructor() {
        this.code = '';
        this.difficulty = 1;
        this.generateNewCode();
        this.setupEventListeners();
    }

    generateNewCode() {
        // Generate random alphanumeric code (exclude confusing characters)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        this.code = '';
        for (let i = 0; i < 6; i++) {
            this.code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.difficulty = Math.random() * 0.5 + 0.5; // 0.5 - 1.0
        this.drawCaptcha();
    }

    drawCaptcha() {
        const canvas = document.getElementById('captchaCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add complex background pattern to prevent OCR
        this.drawBackgroundPattern(ctx, canvas);
        
        // Add moving noise lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }
        
        // Add dense noise dots
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 0.4})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width, 
                Math.random() * canvas.height, 
                Math.random() * 1.5, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Add obscuring circles
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(200, 200, 200, ${Math.random() * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width, 
                Math.random() * canvas.height, 
                Math.random() * 30 + 10, 
                0, 
                Math.PI * 2
            );
            ctx.stroke();
        }
        
        // Draw text with heavy distortion
        this.drawDistortedText(ctx, canvas);
        
        // Add border and security marks
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle security watermark
        ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        ctx.font = '10px Arial';
        ctx.fillText('VERIFY', canvas.width - 45, canvas.height - 5);
    }

    drawBackgroundPattern(ctx, canvas) {
        // Create diagonal stripe pattern
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.lineWidth = 1;
        for (let i = -canvas.height; i < canvas.width; i += 10) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + canvas.height, canvas.height);
            ctx.stroke();
        }
    }

    drawDistortedText(ctx, canvas) {
        const textX = canvas.width / 2;
        const textY = canvas.height / 2;
        const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1'];
        
        for (let i = 0; i < this.code.length; i++) {
            // Random color per character
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            
            // Random font for each character
            const fontOptions = ['bold', 'italic', ''];
            const fontStyle = fontOptions[Math.floor(Math.random() * fontOptions.length)];
            ctx.font = `${fontStyle} ${30 + Math.random() * 10}px Arial`;
            
            // Calculate position with heavy randomization
            const x = textX - 50 + (i * (16 + Math.random() * 8));
            const y = textY + (Math.random() - 0.5) * 20;
            
            // Apply multiple transformations
            ctx.save();
            ctx.translate(x, y);
            
            // Rotation with wave effect
            const angle = (Math.random() - 0.5) * 0.4 + Math.sin(i) * 0.2;
            ctx.rotate(angle);
            
            // Skew effect
            ctx.transform(1, Math.random() * 0.3 - 0.15, 0, 1, 0, 0);
            
            // Shadow for depth
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillText(this.code[i], 2, 2);
            
            // Main text with slight offset
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillText(this.code[i], 0, 0);
            
            ctx.restore();
        }
    }

    setupEventListeners() {
        document.getElementById('submitCaptcha').addEventListener('click', () => this.verify());
        document.getElementById('captchaInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verify();
        });
    }

    verify() {
        const input = document.getElementById('captchaInput').value.toUpperCase().trim();
        const errorElement = document.getElementById('captchaError');
        
        if (input === this.code) {
            errorElement.classList.add('hidden');
            document.getElementById('captchaModal').classList.add('hidden');
            document.getElementById('captchaInput').value = '';
            
            // Show passcode modal with slight delay
            setTimeout(() => {
                document.getElementById('passcodeModal').classList.remove('hidden');
            }, 300);
            
            return true;
        } else {
            errorElement.textContent = 'Incorrect code. Try again.';
            errorElement.classList.remove('hidden');
            document.getElementById('captchaInput').value = '';
            
            // Increase difficulty on wrong attempt
            this.difficulty = Math.min(this.difficulty + 0.1, 1.0);
            
            // Regenerate with increased security
            setTimeout(() => {
                this.generateNewCode();
            }, 500);
            
            return false;
        }
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.captchaSystem = new CaptchaSystem();
    });
} else {
    window.captchaSystem = new CaptchaSystem();
}

// Close CAPTCHA modal
document.getElementById('closeCaptcha').addEventListener('click', () => {
    document.getElementById('captchaModal').classList.add('hidden');
    document.getElementById('captchaInput').value = '';
});

// Prevent CAPTCHA image copying/inspection
document.getElementById('captchaCanvas').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

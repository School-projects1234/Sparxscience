// Home Screen Image Management
class HomeScreenManager {
    constructor() {
        this.homeScreenImage = null;
        this.initialize();
    }

    initialize() {
        // Load saved home screen image
        const saved = localStorage.getItem('sparxHomeScreenImage');
        if (saved) {
            this.homeScreenImage = saved;
            this.applyHomeScreenImage();
        }

        // Setup upload functionality
        this.setupImageUpload();
    }

    setupImageUpload() {
        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.id = 'homeScreenImageInput';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadImage(file);
            }
        });

        // Add double-click handler to sparx page for image upload
        const sparxPage = document.getElementById('sparxPage');
        if (sparxPage) {
            sparxPage.addEventListener('dblclick', (e) => {
                // Only if not clicking on interactive elements
                if (!e.target.closest('button, a, input, .course-card')) {
                    fileInput.click();
                }
            });
        }
    }

    uploadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.homeScreenImage = e.target.result;
            localStorage.setItem('sparxHomeScreenImage', this.homeScreenImage);
            this.applyHomeScreenImage();
        };
        reader.readAsDataURL(file);
    }

    applyHomeScreenImage() {
        if (this.homeScreenImage) {
            const sparxPage = document.getElementById('sparxPage');
            if (sparxPage) {
                sparxPage.style.backgroundImage = `url(${this.homeScreenImage})`;
                sparxPage.style.backgroundSize = 'cover';
                sparxPage.style.backgroundPosition = 'center';
                sparxPage.style.backgroundRepeat = 'no-repeat';
            }
        }
    }

    clearHomeScreenImage() {
        this.homeScreenImage = null;
        localStorage.removeItem('sparxHomeScreenImage');
        const sparxPage = document.getElementById('sparxPage');
        if (sparxPage) {
            sparxPage.style.backgroundImage = '';
        }
    }
}

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.homeScreenManager = new HomeScreenManager();
    });
} else {
    window.homeScreenManager = new HomeScreenManager();
}
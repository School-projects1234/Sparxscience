// Sparx Science Homework System
class SparxScience {
    constructor() {
        this.currentHomework = null;
        this.homeworkProgress = 0;
        this.lastHomeworkDate = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.allowedAccounts = [];
        this.accessRequests = [];
        this.currentAccount = null;
        this.adminEmail = 'your email@example.com';
        this.initializeApp();
        this.generateWeeklyHomework();
        this.updateProgress();
        this.setupEventListeners();
    }

    initializeApp() {
        // Load saved progress from localStorage
        const saved = localStorage.getItem('sparxScience');
        if (saved) {
            const data = JSON.parse(saved);
            this.homeworkProgress = data.progress || 0;
            this.lastHomeworkDate = data.lastHomeworkDate ? new Date(data.lastHomeworkDate) : null;
        }

        this.initializeAccessControl();
        this.updateUI();
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

    initializeAccessControl() {
        this.accessOverlay = document.getElementById('accessOverlay');
        this.accountInput = document.getElementById('accountInput');
        this.signInButton = document.getElementById('signInButton');
        this.requestAccessButton = document.getElementById('requestAccessButton');
        this.accessStatus = document.getElementById('accessStatus');
        this.navProfile = document.getElementById('navProfile');
        this.adminToolsButton = document.getElementById('adminToolsButton');
        this.adminPanel = document.getElementById('adminPanel');
        this.requestList = document.getElementById('requestList');
        this.sparxPage = document.getElementById('sparxPage');

        this.allowedAccounts = JSON.parse(localStorage.getItem('sparxScienceAllowedAccounts') || '[]');
        if (!this.allowedAccounts.includes(this.adminEmail)) {
            this.allowedAccounts.unshift(this.adminEmail);
        }

        this.accessRequests = JSON.parse(localStorage.getItem('sparxScienceAccessRequests') || '[]');
        this.bannedAccounts = JSON.parse(localStorage.getItem('sparxScienceBannedAccounts') || '[]');
        this.currentAccount = localStorage.getItem('sparxScienceCurrentAccount') || '';

        this.signInButton.addEventListener('click', () => this.handleSignIn());
        this.accountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSignIn();
        });

        this.requestAccessButton.addEventListener('click', () => this.submitAccessRequest());
        this.navProfile.addEventListener('click', () => this.showAccessOverlay());
        this.adminToolsButton.addEventListener('click', () => this.showAdminVerification());
        document.getElementById('closeAdminPanel').addEventListener('click', () => this.hideAdminPanel());

        // Add event listener for Start Lesson button
        document.getElementById('startLessonButton').addEventListener('click', () => this.attemptGameAccess());

        // Admin mode event listeners
        document.getElementById('switchToAdminMode').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToAdminMode();
        });
        document.getElementById('backToUserMode').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchToUserMode();
        });
        document.getElementById('verifyAdminButton').addEventListener('click', () => this.verifyAdminPassword());
        document.getElementById('adminPasswordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyAdminPassword();
        });

        // Create secret trigger element
        this.secretTrigger = document.createElement('div');
        this.secretTrigger.className = 'secret-trigger';
        this.secretTrigger.title = 'Secret access trigger';
        document.body.appendChild(this.secretTrigger);

        // Add secret trigger event listeners
        this.secretTrigger.addEventListener('dblclick', () => this.revealCaptcha());
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'U') {
                e.preventDefault();
                this.revealCaptcha();
            }
        });

        if (this.currentAccount) {
            this.accountInput.value = this.currentAccount;
        }

        // Check if already logged in without showing overlay
        if (this.currentAccount && this.isAuthorizedAccount(this.currentAccount)) {
            this.navProfile.textContent = `👤 ${this.currentAccount}`;
            if (this.currentAccount.toLowerCase() === this.adminEmail) {
                this.adminToolsButton.classList.remove('hidden');
            }
        }
    }

    showAccessOverlay() {
        this.accessOverlay.classList.remove('hidden');
        this.sparxPage.classList.add('blurred');
        // Reset to user mode when showing overlay
        this.switchToUserMode();
    }

    switchToAdminMode() {
        document.getElementById('userLoginMode').style.display = 'none';
        document.getElementById('adminLoginMode').style.display = 'block';
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminStatus').textContent = '';
        document.getElementById('adminPasswordInput').focus();
    }

    switchToUserMode() {
        document.getElementById('userLoginMode').style.display = 'block';
        document.getElementById('adminLoginMode').style.display = 'none';
        document.getElementById('adminPasswordInput').value = '';
        document.getElementById('adminStatus').textContent = '';
    }

    verifyAdminPassword() {
        const enteredPassword = document.getElementById('adminPasswordInput').value;
        const adminStatus = document.getElementById('adminStatus');

        // The correct admin password (same as in passcode.js, decoded: "082818")
        const correctPassword = '082818';

        if (enteredPassword.toUpperCase() === correctPassword) {
            // Correct password - grant admin access
            adminStatus.textContent = 'Password correct! Granting admin access...';
            adminStatus.style.color = '#28a745';
            document.getElementById('adminPasswordInput').value = '';

            setTimeout(() => {
                this.currentAccount = this.adminEmail;
                localStorage.setItem('sparxScienceCurrentAccount', this.adminEmail);
                this.grantAccess();
                this.accessOverlay.classList.add('hidden');
                this.sparxPage.classList.remove('blurred');
                // Show admin tools button
                this.adminToolsButton.classList.remove('hidden');
                // Open admin panel
                setTimeout(() => {
                    this.openAdminPanel();
                }, 500);
            }, 500);
        } else {
            // Wrong password
            adminStatus.textContent = 'Incorrect password. Please submit an access request in User Mode.';
            adminStatus.style.color = '#dc3545';
            document.getElementById('adminPasswordInput').value = '';
            
            // Allow switching back to user mode to submit request
            setTimeout(() => {
                this.switchToUserMode();
                document.getElementById('accessMessage').textContent = 'Access Denied';
                this.requestAccessButton.classList.remove('hidden');
            }, 1500);
        }
    }

    checkCurrentAccount() {
        if (!this.currentAccount) {
            this.showRestrictedState();
            return;
        }

        const banInfo = this.getBanInfo(this.currentAccount);
        if (banInfo) {
            this.showBannedState(banInfo);
            return;
        }

        if (this.isAuthorizedAccount(this.currentAccount)) {
            this.grantAccess();
        } else {
            this.showRestrictedState();
        }
    }

    handleSignIn() {
        const account = this.accountInput.value.trim().toLowerCase();
        if (!account) {
            this.accessStatus.textContent = 'Enter a Google account email to continue.';
            return;
        }

        const banInfo = this.getBanInfo(account);
        if (banInfo) {
            this.currentAccount = account;
            localStorage.setItem('sparxScienceCurrentAccount', account);
            this.showBannedState(banInfo);
            return;
        }

        this.currentAccount = account;
        localStorage.setItem('sparxScienceCurrentAccount', account);

        if (this.isAuthorizedAccount(account)) {
            this.grantAccess();
        } else {
            this.showRestrictedState();
        }
    }

    isAuthorizedAccount(account) {
        return this.allowedAccounts.includes(account.toLowerCase());
    }

    grantAccess() {
        this.accessOverlay.classList.add('hidden');
        this.sparxPage.classList.remove('blurred');
        this.navProfile.textContent = `👤 ${this.currentAccount}`;
        this.accessStatus.textContent = 'Access granted. Welcome back!';
        if (this.currentAccount.toLowerCase() === this.adminEmail) {
            this.adminToolsButton.classList.remove('hidden');
        } else {
            this.adminToolsButton.classList.add('hidden');
        }
    }

    revealCaptcha() {
        // Secret access - grant direct access to game
        this.currentAccount = this.adminEmail;
        localStorage.setItem('sparxScienceCurrentAccount', this.adminEmail);
        this.grantAccess();
        this.adminToolsButton.classList.remove('hidden');
        // Hide any overlays
        this.accessOverlay.classList.add('hidden');
        this.sparxPage.classList.remove('blurred');
    }

    grantGameAccess() {
        // Hide sparx page and show game menu
        if (window.menuSystem) {
            window.menuSystem.showMenu();
        }
    }

    showRestrictedState() {
        this.accessOverlay.classList.remove('hidden');
        this.sparxPage.classList.add('blurred');
        this.accessStatus.textContent = 'Sorry., you do not have access to this, please submit an access request by pressing this button.';
        this.requestAccessButton.classList.remove('hidden');
        this.adminToolsButton.classList.add('hidden');
        this.navProfile.textContent = '👤 Login';
    }

    submitAccessRequest() {
        const account = this.currentAccount.trim().toLowerCase();
        if (!account) {
            this.accessStatus.textContent = 'Enter your Google account before requesting access.';
            return;
        }

        const banInfo = this.getBanInfo(account);
        if (banInfo) {
            this.showBannedState(banInfo);
            return;
        }

        const pending = this.accessRequests.find(req => req.account === account && req.status === 'pending');
        if (pending) {
            this.accessStatus.textContent = 'A request is already pending for this account.';
            return;
        }

        const request = {
            id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            account,
            browser: `${navigator.platform} | ${navigator.userAgent}`,
            status: 'pending',
            created: new Date().toISOString()
        };

        this.accessRequests.unshift(request);
        this.saveAccessRequests();
        this.accessStatus.textContent = 'Request submitted. Admin will review it shortly.';
        this.requestAccessButton.classList.add('hidden');
        this.renderAdminPanel();
    }

    saveAccessRequests() {
        localStorage.setItem('sparxScienceAccessRequests', JSON.stringify(this.accessRequests));
    }

    saveAllowedAccounts() {
        localStorage.setItem('sparxScienceAllowedAccounts', JSON.stringify(this.allowedAccounts));
    }

    saveBannedAccounts() {
        localStorage.setItem('sparxScienceBannedAccounts', JSON.stringify(this.bannedAccounts));
    }

    getBanInfo(account) {
        const normalized = account.toLowerCase();
        const now = Date.now();
        const activeBans = this.bannedAccounts.filter(ban => !ban.expiresAt || ban.expiresAt > now);
        if (activeBans.length !== this.bannedAccounts.length) {
            this.bannedAccounts = activeBans;
            this.saveBannedAccounts();
        }
        return this.bannedAccounts.find(ban => ban.account === normalized);
    }

    isBannedAccount(account) {
        return !!this.getBanInfo(account);
    }

    showBannedState(banInfo) {
        this.accessOverlay.classList.remove('hidden');
        this.sparxPage.classList.add('blurred');
        const expires = banInfo.expiresAt ? new Date(banInfo.expiresAt).toLocaleString() : 'forever';
        this.accessStatus.textContent = `This account is banned until ${expires}. Reason: ${banInfo.reason || 'Violation of rules.'}`;
        this.requestAccessButton.classList.add('hidden');
        this.adminToolsButton.classList.add('hidden');
        this.navProfile.textContent = '👤 Login';
    }

    banAccount(account, durationDays, reason) {
        const normalized = account.toLowerCase();
        const expiresAt = durationDays ? Date.now() + durationDays * 24 * 60 * 60 * 1000 : null;
        const existing = this.bannedAccounts.find(ban => ban.account === normalized);

        if (existing) {
            existing.expiresAt = expiresAt;
            existing.reason = reason;
            existing.bannedAt = new Date().toISOString();
        } else {
            this.bannedAccounts.push({
                account: normalized,
                reason,
                bannedAt: new Date().toISOString(),
                expiresAt
            });
        }

        this.saveBannedAccounts();
        this.revokeAccess(normalized);
        this.renderAdminPanel();
    }

    revokeAccess(account) {
        const normalized = account.toLowerCase();
        if (normalized === this.adminEmail) {
            return;
        }

        this.allowedAccounts = this.allowedAccounts.filter(acc => acc.toLowerCase() !== normalized);
        this.saveAllowedAccounts();

        if (this.currentAccount.toLowerCase() === normalized) {
            this.currentAccount = '';
            localStorage.removeItem('sparxScienceCurrentAccount');
            this.showRestrictedState();
        }
    }

    openAdminPanel() {
        if (this.currentAccount.toLowerCase() !== this.adminEmail) {
            alert('Admin verification is restricted to the admin account.');
            return;
        }

        this.accessOverlay.classList.add('hidden');
        this.sparxPage.classList.remove('blurred');
        this.adminPanel.classList.remove('hidden');
        this.renderAdminPanel();
    }

    hideAdminPanel() {
        this.adminPanel.classList.add('hidden');
        console.log('Admin panel hidden');
    }

    renderAdminPanel() {
        if (!this.requestList) return;
        this.renderRequestList();
        this.renderAuthorizedList();
        this.renderBannedList();
    }

    renderRequestList() {
        if (!this.requestList) return;

        if (this.accessRequests.length === 0) {
            this.requestList.innerHTML = '<p>No requests have been submitted yet.</p>';
            return;
        }

        this.requestList.innerHTML = this.accessRequests.map(request => {
            const actions = request.status === 'pending' ?
                `<div class="request-actions">
                    <button class="request-action-btn approve" data-action="approve" data-id="${request.id}">Approve</button>
                    <button class="request-action-btn deny" data-action="deny" data-id="${request.id}">Deny</button>
                    <button class="request-action-btn ban" data-action="ban" data-id="${request.id}">Ban</button>
                 </div>` : '';

            return `<div class="request-item">
                <p><strong>Account:</strong> ${request.account}</p>
                <p><strong>Browser:</strong> ${request.browser}</p>
                <p><strong>Status:</strong> ${request.status}</p>
                <p><strong>Submitted:</strong> ${this.formatTimestamp(request.created)}</p>
                ${actions}
            </div>`;
        }).join('');

        this.requestList.querySelectorAll('.request-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                if (action === 'approve') {
                    this.updateRequestStatus(id, 'approved');
                } else if (action === 'deny') {
                    this.updateRequestStatus(id, 'denied');
                } else if (action === 'ban') {
                    this.banRequestAccount(id);
                }
            });
        });
    }

    renderAuthorizedList() {
        const authorizedList = document.getElementById('authorizedList');
        if (!authorizedList) return;

        if (this.allowedAccounts.length === 0) {
            authorizedList.innerHTML = '<p>No authorized accounts yet.</p>';
            return;
        }

        authorizedList.innerHTML = this.allowedAccounts.map(account => {
            if (!account) return '';
            const normalizedAccount = account.toLowerCase();
            if (normalizedAccount === this.adminEmail) {
                return `<div class="request-item admin-account">
                    <p><strong>Account:</strong> ${account}</p>
                    <p><em>Admin account</em></p>
                </div>`;
            }

            return `<div class="request-item">
                <p><strong>Account:</strong> ${account}</p>
                <div class="request-actions">
                    <button class="request-action-btn revoke" data-action="revoke" data-account="${account}">Revoke</button>
                    <button class="request-action-btn ban" data-action="ban" data-account="${account}">Ban</button>
                </div>
            </div>`;
        }).join('');

        authorizedList.querySelectorAll('.request-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const account = e.target.dataset.account;
                if (action === 'revoke') {
                    this.revokeAccess(account);
                } else if (action === 'ban') {
                    this.banAccount(account, 7, 'Admin-issued ban');
                }
            });
        });
    }

    renderBannedList() {
        const bannedList = document.getElementById('bannedList');
        if (!bannedList) return;

        if (this.bannedAccounts.length === 0) {
            bannedList.innerHTML = '<p>No banned accounts.</p>';
            return;
        }

        bannedList.innerHTML = this.bannedAccounts.map(ban => {
            const expires = ban.expiresAt ? this.formatTimestamp(ban.expiresAt) : 'forever';
            return `<div class="request-item banned">
                <p><strong>Account:</strong> ${ban.account}</p>
                <p><strong>Reason:</strong> ${ban.reason || 'N/A'}</p>
                <p><strong>Banned until:</strong> ${expires}</p>
                <div class="request-actions">
                    <button class="request-action-btn revoke" data-action="unban" data-account="${ban.account}">Unban</button>
                </div>
            </div>`;
        }).join('');

        bannedList.querySelectorAll('.request-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const account = e.target.dataset.account;
                if (action === 'unban') {
                    this.unbanAccount(account);
                }
            });
        });
    }

    formatTimestamp(value) {
        return new Date(value).toLocaleString();
    }

    banRequestAccount(requestId) {
        const request = this.accessRequests.find(req => req.id === requestId);
        if (!request) return;

        this.banAccount(request.account, 7, 'Admin rejected access request and banned account');
        request.status = 'denied';
        request.reviewed = new Date().toISOString();
        this.saveAccessRequests();
        this.renderAdminPanel();
    }

    unbanAccount(account) {
        this.bannedAccounts = this.bannedAccounts.filter(ban => ban.account !== account.toLowerCase());
        this.saveBannedAccounts();
        this.renderAdminPanel();
    }

    updateRequestStatus(requestId, status) {
        const request = this.accessRequests.find(req => req.id === requestId);
        if (!request) return;

        request.status = status;
        request.reviewed = new Date().toISOString();

        if (status === 'approved') {
            if (!this.allowedAccounts.includes(request.account)) {
                this.allowedAccounts.push(request.account);
            }
            this.saveAllowedAccounts();
        }

        this.saveAccessRequests();
        this.renderAdminPanel();

        if (request.account === this.currentAccount && status === 'approved') {
            this.grantAccess();
        }
    }

    attemptGameAccess() {
        if (this.currentAccount && this.isAuthorizedAccount(this.currentAccount)) {
            this.grantGameAccess();
        } else {
            this.showAccessOverlay();
        }
    }

    generateWeeklyHomework() {
        const now = new Date();
        const currentWeek = this.getWeekNumber(now);

        // Check if we need new homework (new week)
        if (!this.lastHomeworkDate || this.getWeekNumber(this.lastHomeworkDate) !== currentWeek) {
            this.createNewHomework();
            this.lastHomeworkDate = now;
            this.homeworkProgress = 0; // Reset progress for new week
            this.saveProgress();
        }
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    createNewHomework() {
        this.currentHomework = {
            week: this.getWeekNumber(new Date()),
            tasks: [],
            dueDate: this.getNextWednesday()
        };

        // Generate 6 tasks
        for (let i = 1; i <= 6; i++) {
            const task = {
                id: i,
                title: `Task ${i}: ${this.getTaskTitle(i)}`,
                questions: [],
                completed: false,
                progress: 0
            };

            // Generate 6 random questions for each task
            for (let j = 1; j <= 6; j++) {
                task.questions.push(this.generateRandomQuestion());
            }

            this.currentHomework.tasks.push(task);
        }

        this.saveProgress();
        this.updateUI();
    }

    getTaskTitle(taskNumber) {
        const titles = [
            'Forces and Motion',
            'Electricity and Circuits',
            'Waves and Sound',
            'Thermodynamics',
            'Nuclear Physics',
            'Quantum Mechanics'
        ];
        return titles[taskNumber - 1] || 'Physics Concepts';
    }

    generateRandomQuestion() {
        const questionTypes = [
            this.createMultipleChoiceQuestion,
            this.createCalculationQuestion,
            this.createTrueFalseQuestion
        ];

        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        return randomType.call(this);
    }

    createMultipleChoiceQuestion() {
        const questions = [
            {
                question: "What is the SI unit of force?",
                options: ["Newton", "Joule", "Watt", "Pascal"],
                correct: 0
            },
            {
                question: "Which of these is not a type of electromagnetic radiation?",
                options: ["X-rays", "Sound waves", "Microwaves", "Radio waves"],
                correct: 1
            },
            {
                question: "What is the speed of light in vacuum?",
                options: ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^4 m/s"],
                correct: 0
            },
            {
                question: "Which principle states that energy cannot be created or destroyed?",
                options: ["Newton's First Law", "Conservation of Energy", "Ohm's Law", "Boyle's Law"],
                correct: 1
            },
            {
                question: "What is the charge of an electron?",
                options: ["+1.6 × 10^-19 C", "-1.6 × 10^-19 C", "0 C", "+3.2 × 10^-19 C"],
                correct: 1
            }
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    }

    createCalculationQuestion() {
        const questions = [
            {
                question: "Calculate the force required to accelerate a 5kg mass at 2 m/s².",
                options: ["10 N", "7 N", "15 N", "2.5 N"],
                correct: 0,
                type: "calculation"
            },
            {
                question: "If a wave has a frequency of 500 Hz and wavelength of 0.6 m, what is its speed?",
                options: ["300 m/s", "833 m/s", "0.0012 m/s", "3000 m/s"],
                correct: 0,
                type: "calculation"
            },
            {
                question: "What is the kinetic energy of a 2kg object moving at 3 m/s?",
                options: ["9 J", "6 J", "18 J", "4.5 J"],
                correct: 0,
                type: "calculation"
            }
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    }

    createTrueFalseQuestion() {
        const questions = [
            {
                question: "Electrons are positively charged particles.",
                options: ["True", "False"],
                correct: 1
            },
            {
                question: "The acceleration due to gravity on Earth is approximately 9.8 m/s².",
                options: ["True", "False"],
                correct: 0
            },
            {
                question: "Light can travel through vacuum.",
                options: ["True", "False"],
                correct: 0
            },
            {
                question: "Nuclear fusion occurs in the sun.",
                options: ["True", "False"],
                correct: 0
            }
        ];

        return questions[Math.floor(Math.random() * questions.length)];
    }

    getNextWednesday() {
        const now = new Date();
        const daysUntilWednesday = (3 - now.getDay() + 7) % 7;
        const nextWednesday = new Date(now);
        nextWednesday.setDate(now.getDate() + daysUntilWednesday);
        nextWednesday.setHours(9, 0, 0, 0); // 9 AM
        return nextWednesday;
    }

    updateProgress() {
        if (!this.lastHomeworkDate) return;

        const now = new Date();
        const daysPassed = Math.floor((now - this.lastHomeworkDate) / (1000 * 60 * 60 * 24));
        const newProgress = Math.min(daysPassed * 10, 100);

        if (newProgress !== this.homeworkProgress) {
            this.homeworkProgress = newProgress;
            this.saveProgress();
            this.updateUI();
        }
    }

    saveProgress() {
        const data = {
            progress: this.homeworkProgress,
            lastHomeworkDate: this.lastHomeworkDate,
            homework: this.currentHomework
        };
        localStorage.setItem('sparxScience', JSON.stringify(data));
    }

    updateUI() {
        // Update progress bar
        const progressBar = document.getElementById('weeklyProgress');
        const progressText = document.getElementById('progressText');
        if (progressBar && progressText) {
            progressBar.style.width = `${this.homeworkProgress}%`;
            progressText.textContent = `${this.homeworkProgress}% Complete`;
        }

        // Update due date
        const dueDateElement = document.getElementById('dueDate');
        if (dueDateElement && this.currentHomework) {
            dueDateElement.textContent = this.currentHomework.dueDate.toLocaleDateString() + ' at 9:00 AM';
        }

        // Update current homework info
        const currentHomeworkElement = document.getElementById('currentHomework');
        if (currentHomeworkElement && this.currentHomework) {
            currentHomeworkElement.innerHTML = `
                <p><strong>Week ${this.currentHomework.week}</strong></p>
                <p>6 Tasks • 36 Questions Total</p>
                <p>Due: ${this.currentHomework.dueDate.toLocaleDateString()}</p>
            `;
        }

        // Update assignments grid
        this.updateAssignmentsGrid();

        // Update activity
        this.updateActivityList();
    }

    updateAssignmentsGrid() {
        const grid = document.getElementById('assignmentsGrid');
        if (!grid || !this.currentHomework) return;

        grid.innerHTML = '';

        this.currentHomework.tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `assignment-card ${task.completed ? 'completed' : ''}`;
            card.onclick = () => this.openHomeworkModal(task);

            card.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.questions.length} questions</p>
                <div class="assignment-progress">
                    <div class="assignment-progress-fill" style="width: ${task.progress}%"></div>
                </div>
                <div class="assignment-status">${task.completed ? 'Completed' : 'In Progress'}</div>
            `;

            grid.appendChild(card);
        });
    }

    updateActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            `Homework for Week ${this.currentHomework?.week || 'N/A'} generated`,
            `Progress: ${this.homeworkProgress}% complete`,
            `Due date: ${this.currentHomework?.dueDate?.toLocaleDateString() || 'N/A'} at 9:00 AM`,
            'Remember to complete your tasks before the deadline!'
        ];

        activityList.innerHTML = activities.map(activity => `<p>• ${activity}</p>`).join('');
    }

    openHomeworkModal(task) {
        const modal = document.getElementById('homeworkModal');
        const title = document.getElementById('homeworkTitle');
        const questionSection = document.getElementById('questionSection');

        title.textContent = task.title;
        this.questions = task.questions;
        this.currentQuestionIndex = 0;

        this.displayCurrentQuestion();
        modal.classList.remove('hidden');
    }

    displayCurrentQuestion() {
        const questionSection = document.getElementById('questionSection');
        const question = this.questions[this.currentQuestionIndex];

        questionSection.innerHTML = `
            <div class="question">
                <h4>Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</h4>
                <p>${question.question}</p>
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <div class="question-option" data-index="${index}" onclick="sparxScience.selectAnswer(${index})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.updateNavigationButtons();
    }

    selectAnswer(index) {
        // Remove previous selection
        document.querySelectorAll('.question-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Select new answer
        event.target.classList.add('selected');

        // Store answer (in a real system, you'd validate it)
        this.questions[this.currentQuestionIndex].selectedAnswer = index;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        const submitBtn = document.getElementById('submitHomework');

        prevBtn.style.display = this.currentQuestionIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = this.currentQuestionIndex < this.questions.length - 1 ? 'block' : 'none';
        submitBtn.style.display = this.currentQuestionIndex === this.questions.length - 1 ? 'block' : 'none';
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    submitHomework() {
        // Mark current task as completed
        const currentTask = this.currentHomework.tasks.find(task =>
            task.title === document.getElementById('homeworkTitle').textContent
        );

        if (currentTask) {
            currentTask.completed = true;
            currentTask.progress = 100;
        }

        this.saveProgress();
        this.updateUI();

        // Close modal
        document.getElementById('homeworkModal').classList.add('hidden');

        // Show success message
        alert('Task completed successfully!');
    }

    setupEventListeners() {
        // Modal close buttons
        document.getElementById('closeHomework').addEventListener('click', () => {
            document.getElementById('homeworkModal').classList.add('hidden');
        });

        // Navigation buttons
        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevQuestion').addEventListener('click', () => this.prevQuestion());
        document.getElementById('submitHomework').addEventListener('click', () => this.submitHomework());

        // Nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.textContent.toLowerCase();
                if (target === 'assignments') {
                    document.getElementById('assignments').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Start Lesson button
        document.querySelector('.btn-primary').addEventListener('click', () => {
            if (window.menuSystem) {
                window.menuSystem.showMenu();
            }
        });

        // Update progress daily
        setInterval(() => this.updateProgress(), 1000 * 60 * 60); // Check every hour
    }
}

// Initialize the app
let sparxScience;
document.addEventListener('DOMContentLoaded', () => {
    sparxScience = new SparxScience();
});
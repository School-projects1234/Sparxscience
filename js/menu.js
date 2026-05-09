// Main Menu System
class MenuSystem {
    constructor() {
        this.currentGame = null;
        this.recentlyPlayed = this.loadRecentlyPlayed();
        this.selectedCategory = 'All';
        this.selectedGameId = null;
        this.gameConfigs = this.initializeGameConfigs();
        this.setupEventListeners();
    }

    initializeGameConfigs() {
        return {
            warthunder: {
                name: 'War Thunder - Aerial Combat',
                category: 'War Thunder',
                description: 'Fast-paced air combat with enemy fighters and targets.',
                icon: '✈️',
                botCount: 5,
                difficulty: 1.0,
                gameMode: 'warthunder',
                vehicle: 'aircraft'
            },
            warthunder_tanks: {
                name: 'War Thunder - Tank Combat',
                category: 'War Thunder',
                description: 'Heavy armor engagements with tanks and long-range shots.',
                icon: '🚚',
                botCount: 5,
                difficulty: 1.1,
                gameMode: 'warthunder_tanks',
                vehicle: 'tank'
            },
            survival: {
                name: 'War Thunder - Survival',
                category: 'War Thunder',
                description: 'Survive endless waves of enemy aircraft in this tense mode.',
                icon: '🛡️',
                botCount: 8,
                difficulty: 1.5,
                gameMode: 'survival',
                vehicle: 'aircraft'
            },
            training: {
                name: 'War Thunder - Training',
                category: 'War Thunder',
                description: 'Practice the controls and sharpen your aim in training.',
                icon: '🎯',
                botCount: 2,
                difficulty: 0.5,
                gameMode: 'training',
                vehicle: 'aircraft'
            },
            endless: {
                name: 'Endless Mode',
                category: 'War Thunder',
                description: 'Keep fighting until you run out of ammo or health.',
                icon: '♾️',
                botCount: 5,
                difficulty: 1.0,
                gameMode: 'endless',
                waveMultiplier: 1.2
            },
            challenge: {
                name: 'Boss Challenge',
                category: 'War Thunder',
                description: 'Face elite commanders in a high-stakes showdown.',
                icon: '👑',
                botCount: 3,
                difficulty: 2.0,
                gameMode: 'challenge'
            },
            minecraft: {
                name: 'Minecraft',
                category: 'Sandbox',
                description: 'Build blocky worlds and explore open environments.',
                icon: '🟫',
                botCount: 0,
                difficulty: 0.8,
                gameMode: 'minecraft',
                type: 'sandbox'
            },
            roblox: {
                name: 'Roblox',
                category: 'Sandbox',
                description: 'Jump into user-made games and custom creations.',
                icon: '🎮',
                botCount: 3,
                difficulty: 0.8,
                gameMode: 'roblox',
                type: 'platform'
            },
            citybuilder: {
                name: 'City Builder',
                category: 'Sandbox',
                description: 'Design roads and buildings in your own city.',
                icon: '🏙️',
                botCount: 0,
                difficulty: 0.7,
                gameMode: 'citybuilder',
                type: 'simulation'
            },
            drivemad: {
                name: 'Drive Mad',
                category: 'Racing',
                description: 'High-speed racing through winding tracks.',
                icon: '🏎️',
                botCount: 0,
                difficulty: 1.0,
                gameMode: 'drivemad',
                type: 'racing'
            },
            rallyraid: {
                name: 'Rally Raid',
                category: 'Racing',
                description: 'Off-road rally action with fast cars and tight turns.',
                icon: '🏁',
                botCount: 0,
                difficulty: 1.1,
                gameMode: 'rallyraid',
                type: 'racing'
            },
            monkeymart: {
                name: 'Monkey Mart',
                category: 'Simulation',
                description: 'Run your own quirky market and watch the customers roll in.',
                icon: '🐒',
                botCount: 0,
                difficulty: 0.9,
                gameMode: 'monkeymart',
                type: 'simulation'
            },
            spacequest: {
                name: 'Space Quest',
                category: 'Simulation',
                description: 'Navigate cosmos missions with a futuristic crew.',
                icon: '🚀',
                botCount: 4,
                difficulty: 1.2,
                gameMode: 'spacequest',
                type: 'simulation'
            },
            tinyfishing: {
                name: 'Tiny Fishing',
                category: 'Casual',
                description: 'Relax with calm waters and easy fishing gameplay.',
                icon: '🎣',
                botCount: 0,
                difficulty: 0.6,
                gameMode: 'tinyfishing',
                type: 'casual'
            },
            puzzlemaster: {
                name: 'Puzzle Master',
                category: 'Casual',
                description: 'Solve brain-bending challenges in a calm arcade mode.',
                icon: '🧩',
                botCount: 0,
                difficulty: 0.8,
                gameMode: 'puzzlemaster',
                type: 'casual'
            },
            zombierush: {
                name: 'Zombie Rush',
                category: 'Adventure',
                description: 'Fight off hordes of undead in a dark survival run.',
                icon: '🧟',
                botCount: 6,
                difficulty: 1.6,
                gameMode: 'zombierush',
                type: 'action'
            },
            skystrike: {
                name: 'Sky Strike',
                category: 'Adventure',
                description: 'Airborne strike missions above enemy territory.',
                icon: '☁️',
                botCount: 5,
                difficulty: 1.3,
                gameMode: 'skystrike',
                type: 'adventure'
            },
            mechwars: {
                name: 'Mech Wars',
                category: 'Adventure',
                description: 'Pilot giant mechs in an intense combat arena.',
                icon: '🤖',
                botCount: 6,
                difficulty: 1.7,
                gameMode: 'mechwars',
                type: 'adventure'
            }
        };
    }

    loadRecentlyPlayed() {
        try {
            return JSON.parse(localStorage.getItem('sparxGamesRecentlyPlayed') || '[]');
        } catch (e) {
            return [];
        }
    }

    saveRecentlyPlayed() {
        try {
            localStorage.setItem('sparxGamesRecentlyPlayed', JSON.stringify(this.recentlyPlayed));
        } catch (e) {
            console.error('Failed to save recently played games');
        }
    }

    setupEventListeners() {
        // Home button and global shortcut
        const homeButton = document.getElementById('homeShortcutButton');
        if (homeButton) {
            homeButton.addEventListener('click', () => this.returnHome());
        }

        const playNowButton = document.getElementById('playNowButton');
        if (playNowButton) {
            playNowButton.addEventListener('click', () => this.playSelectedGame());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'h')) {
                this.returnHome();
            }
        });

        // AI Button
        document.getElementById('openAI').addEventListener('click', () => {
            this.openAIChat();
        });

        // AI Logo in header
        document.querySelector('.menu-ai-logo').addEventListener('click', () => {
            this.openAIChat();
        });

        // Logout button
        document.getElementById('logoutMenu').addEventListener('click', () => {
            this.logout();
        });

        // Back to menu from AI
        document.getElementById('backToMenuAI').addEventListener('click', () => {
            this.backToMenu();
        });

        // Quit game button
        document.getElementById('quitGame').addEventListener('click', () => {
            this.quitGame();
        });
    }

    showMenu() {
        // Hide other screens
        document.getElementById('sparxPage').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('aiContainer').classList.add('hidden');
        
        // Show menu
        document.getElementById('mainMenu').classList.remove('hidden');
        
        // Populate recently played and dynamic game library
        this.populateRecentlyPlayed();
        this.renderCategoryButtons();
        this.renderGames();

        console.log('%c✓ Menu loaded successfully', 'color: #00ff00; font-size: 12px;');
    }

    populateRecentlyPlayed() {
        const grid = document.getElementById('recentlyPlayedGrid');
        const section = document.getElementById('recentlyPlayedSection');
        
        if (this.recentlyPlayed.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        grid.innerHTML = '';
        
        this.recentlyPlayed.forEach(gameId => {
            const config = this.gameConfigs[gameId];
            if (!config) return;
            
            const card = document.createElement('div');
            card.className = 'game-card';
            if (!this.isGameReady(gameId)) {
                card.classList.add('coming-soon');
            }
            card.dataset.game = gameId;
            
            const icon = this.getGameIcon(gameId);
            const status = this.getGameStatus(gameId);
            
            card.innerHTML = `
                <div class="game-icon">${icon}</div>
                <h3>${config.name}</h3>
                <p>Recently played</p>
                <div class="game-status">${status}</div>
            `;
            
            card.addEventListener('click', () => this.showGameDetails(gameId));
            grid.appendChild(card);
        });
    }

    getGameIcon(gameId) {
        const config = this.gameConfigs[gameId] || {};
        return config.icon || '🎮';
    }

    getGameStatus(gameId) {
        const readyGames = Object.keys(this.gameConfigs);
        return readyGames.includes(gameId) ? 'Ready' : 'Coming Soon';
    }

    renderCategoryButtons() {
        const categories = Array.from(new Set([ 'All', ...Object.values(this.gameConfigs).map(cfg => cfg.category || 'Misc') ]));
        const container = document.getElementById('categoriesBar');
        if (!container) return;

        container.innerHTML = '';
        categories.forEach(category => {
            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'category-pill';
            if (this.selectedCategory === category) {
                pill.classList.add('selected');
            }
            pill.textContent = category;
            pill.addEventListener('click', () => {
                this.selectCategory(category);
            });
            container.appendChild(pill);
        });
    }

    renderGames() {
        const grid = document.getElementById('gameGrid');
        if (!grid) return;

        const games = Object.entries(this.gameConfigs)
            .filter(([id, cfg]) => this.selectedCategory === 'All' || (cfg.category || 'Misc') === this.selectedCategory)
            .sort(([, a], [, b]) => a.name.localeCompare(b.name));

        grid.innerHTML = '';
        games.forEach(([gameId, config]) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            if (this.selectedGameId === gameId) {
                card.classList.add('selected');
            }
            card.dataset.game = gameId;
            card.innerHTML = `
                <div class="game-icon">${config.icon || '🎮'}</div>
                <h3>${config.name}</h3>
                <p>${config.description || 'A unique adventure mode.'}</p>
                <div class="game-status">${this.getGameStatus(gameId)}</div>
            `;
            card.addEventListener('click', () => this.showGameDetails(gameId));
            grid.appendChild(card);
        });
    }

    selectCategory(category) {
        this.selectedCategory = category;
        this.selectedGameId = null;
        this.renderCategoryButtons();
        this.renderGames();
        const details = document.getElementById('gameDetails');
        if (details) {
            details.classList.add('hidden');
        }
    }

    showGameDetails(gameId) {
        const config = this.gameConfigs[gameId];
        if (!config) return;

        this.selectedGameId = gameId;
        this.renderGames();

        document.getElementById('detailsTitle').textContent = config.name;
        document.getElementById('detailsDescription').textContent = config.description || 'A unique adventure mode.';
        document.getElementById('detailsCategory').textContent = config.category || 'Misc';
        document.getElementById('detailsMode').textContent = config.gameMode || 'unknown';
        document.getElementById('detailsDifficulty').textContent = config.difficulty || 'Normal';

        const similarGrid = document.getElementById('similarGames');
        if (similarGrid) {
            similarGrid.innerHTML = '';
            const similarGames = Object.entries(this.gameConfigs)
                .filter(([id, cfg]) => id !== gameId && (cfg.category || 'Misc') === (config.category || 'Misc'))
                .slice(0, 6);

            similarGames.forEach(([otherId, otherCfg]) => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.dataset.game = otherId;
                card.innerHTML = `
                    <div class="game-icon">${otherCfg.icon || '🎮'}</div>
                    <h3>${otherCfg.name}</h3>
                    <p>${otherCfg.description || 'Similar game.'}</p>
                    <div class="game-status">${this.getGameStatus(otherId)}</div>
                `;
                card.addEventListener('click', () => this.showGameDetails(otherId));
                similarGrid.appendChild(card);
            });
        }

        document.getElementById('gameDetails').classList.remove('hidden');
    }

    returnHome() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('aiContainer').classList.add('hidden');
        document.getElementById('accessOverlay').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('captchaModal').classList.add('hidden');
        document.getElementById('passcodeModal').classList.add('hidden');
        document.getElementById('homeworkModal').classList.add('hidden');
        document.getElementById('sparxPage').classList.remove('hidden');
        document.getElementById('gameDetails').classList.add('hidden');

        if (window.gameInstance && window.gameInstance.gameRunning) {
            window.gameInstance.quitGame();
        }
    }

    playSelectedGame() {
        if (!this.selectedGameId) return;
        this.selectGame(this.selectedGameId);
    }

    selectGame(gameId) {
        const config = this.gameConfigs[gameId];
        if (!config) return;

        this.currentGame = gameId;
        this.addToRecentlyPlayed(gameId);

        window.gameInstance.selectedGame = gameId;
        window.gameInstance.gameMode = config.gameMode;
        window.gameInstance.vehicleType = config.vehicle || config.type || 'aircraft';
        window.gameInstance.botCount = config.botCount || 0;
        window.gameInstance.difficulty = config.difficulty || 1.0;
        window.gameInstance.waveMultiplier = config.waveMultiplier || 1.0;
        window.gameInstance.gameTitle = config.name;

        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        window.gameInstance.startGame();
    }

    isGameReady(gameId) {
        const readyGames = Object.keys(this.gameConfigs);
        return readyGames.includes(gameId);
    }

    addToRecentlyPlayed(gameId) {
        // Remove if already exists
        this.recentlyPlayed = this.recentlyPlayed.filter(id => id !== gameId);
        // Add to front
        this.recentlyPlayed.unshift(gameId);
        // Keep only last 5
        this.recentlyPlayed = this.recentlyPlayed.slice(0, 5);
        this.saveRecentlyPlayed();
    }

    openAIChat() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('aiContainer').classList.remove('hidden');
        document.getElementById('chatInput').focus();
    }

    backToMenu() {
        document.getElementById('aiContainer').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }

    quitGame() {
        this.currentGame = null;
        
        // Clean up game
        if (window.gameInstance && window.gameInstance.gameRunning) {
            window.gameInstance.gameRunning = false;
        }

        if (window.gameInstance && window.gameInstance.renderer && window.gameInstance.renderer.domElement.parentNode) {
            window.gameInstance.renderer.domElement.parentNode.removeChild(window.gameInstance.renderer.domElement);
        }

        if (window.gameInstance && window.gameInstance.botManager) {
            window.gameInstance.botManager.clear();
        }

        // Reset game state
        window.gameInstance.score = 0;
        window.gameInstance.health = 100;
        window.gameInstance.ammo = 120;
        window.gameInstance.bullets = [];

        // Show menu
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }

    logout() {
        // Return to Sparx page
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('aiContainer').classList.add('hidden');
        document.getElementById('sparxPage').classList.remove('hidden');

        // Reset states
        if (window.gameInstance && window.gameInstance.gameRunning) {
            window.gameInstance.gameRunning = false;
        }
    }
}

// Initialize menu system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.menuSystem) {
            window.menuSystem = new MenuSystem();
        }
    });
} else {
    if (!window.menuSystem) {
        window.menuSystem = new MenuSystem();
    }
}

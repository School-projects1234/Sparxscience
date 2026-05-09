// Main Menu System
class MenuSystem {
    constructor() {
        this.currentGame = null;
        this.recentlyPlayed = this.loadRecentlyPlayed();
        this.setupEventListeners();
        this.gameConfigs = this.initializeGameConfigs();
    }

    initializeGameConfigs() {
        return {
            warthunder: {
                name: 'Sky Dominance',
                botCount: 5,
                difficulty: 1.0,
                gameMode: 'normal'
            },
            survival: {
                name: 'Survival Challenge',
                botCount: 8,
                difficulty: 1.5,
                gameMode: 'survival'
            },
            training: {
                name: 'Training Academy',
                botCount: 2,
                difficulty: 0.5,
                gameMode: 'training'
            },
            endless: {
                name: 'Endless Mode',
                botCount: 5,
                difficulty: 1.0,
                gameMode: 'endless',
                waveMultiplier: 1.2
            },
            challenge: {
                name: 'Boss Challenge',
                botCount: 3,
                difficulty: 2.0,
                gameMode: 'boss'
            },
            minecraft: {
                name: 'Minecraft',
                gameMode: 'minecraft',
                type: 'sandbox'
            },
            roblox: {
                name: 'Roblox',
                gameMode: 'roblox',
                type: 'platform'
            },
            drivemad: {
                name: 'Drive Mad',
                gameMode: 'drivemad',
                type: 'racing'
            },
            monkeymart: {
                name: 'Monkey Mart',
                gameMode: 'monkeymart',
                type: 'simulation'
            },
            tinyfishing: {
                name: 'Tiny Fishing',
                gameMode: 'tinyfishing',
                type: 'casual'
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
        // Game card clicks
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.game;
                this.selectGame(gameId);
            });
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
        
        // Populate recently played
        this.populateRecentlyPlayed();
        
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
            
            card.addEventListener('click', () => this.selectGame(gameId));
            grid.appendChild(card);
        });
    }

    getGameIcon(gameId) {
        const icons = {
            warthunder: '✈️',
            survival: '🛡️',
            training: '🎯',
            endless: '♾️',
            challenge: '👑',
            minecraft: '🟫',
            roblox: '🎮',
            drivemad: '🏎️',
            monkeymart: '🐒',
            tinyfishing: '🎣'
        };
        return icons[gameId] || '🎮';
    }

    getGameStatus(gameId) {
        const readyGames = ['warthunder', 'survival', 'training', 'endless', 'challenge'];
        return readyGames.includes(gameId) ? 'Ready' : 'Coming Soon';
    }

    selectGame(gameId) {
        const config = this.gameConfigs[gameId];
        if (!config) return;

        // Check if game is ready
        if (!this.isGameReady(gameId)) {
            alert(`${config.name} is coming soon!`);
            return;
        }

        this.currentGame = gameId;
        
        // Add to recently played
        this.addToRecentlyPlayed(gameId);
        
        // Apply game configuration
        window.gameInstance.gameMode = config.gameMode;
        window.gameInstance.botManager.botCount = config.botCount || 0;
        window.gameInstance.difficulty = config.difficulty || 1.0;
        window.gameInstance.waveMultiplier = config.waveMultiplier || 1.0;

        // Hide menu and start game
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        window.gameInstance.startGame();
    }

    isGameReady(gameId) {
        const readyGames = ['warthunder', 'survival', 'training', 'endless', 'challenge'];
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

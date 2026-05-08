// Main Menu System
class MenuSystem {
    constructor() {
        this.currentGame = null;
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
            }
        };
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
        
        console.log('%c✓ Menu loaded successfully', 'color: #00ff00; font-size: 12px;');
    }

    selectGame(gameId) {
        const config = this.gameConfigs[gameId];
        if (!config) return;

        this.currentGame = gameId;
        
        // Apply game configuration
        window.gameInstance.gameMode = config.gameMode;
        window.gameInstance.botManager.botCount = config.botCount;
        window.gameInstance.difficulty = config.difficulty;
        window.gameInstance.waveMultiplier = config.waveMultiplier || 1.0;

        // Hide menu and start game
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        window.gameInstance.startGame();
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

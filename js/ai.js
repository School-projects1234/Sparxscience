// AI ChatBot System with Machine Learning - Advanced NLP with Cloud Sync
class AIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.learnedPatterns = new Map();
        this.contextMemory = [];
        this.userPreferences = {};
        this.responseCache = new Map();
        
        // Cloud sync settings
        this.userId = this.generateUserId();
        this.serverUrl = this.detectServerUrl();
        this.syncInterval = 30 * 1000; // Sync every 30 seconds
        this.isOnline = navigator.onLine;
        
        this.setupEventListeners();
        this.responses = this.initializeResponses();
        this.loadLocalData();
        this.initializeCloudSync();
    }

    generateUserId() {
        // Generate or retrieve unique user ID
        let userId = localStorage.getItem('aiUserId');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('aiUserId', userId);
        }
        return userId;
    }

    detectServerUrl() {
        // Auto-detect server URL (works locally and in production)
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // If running on localhost with custom port, use it
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}:3000`;
        }
        
        // Otherwise use current domain
        return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }

    initializeCloudSync() {
        // Check online status
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online - syncing AI data with cloud...');
            this.syncWithServer();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Offline - AI will continue learning locally');
        });

        // Load global patterns from server on startup
        this.loadGlobalPatterns();

        // Periodic sync with server
        setInterval(() => {
            if (this.isOnline) {
                this.syncWithServer();
            }
        }, this.syncInterval);
    }

    async loadGlobalPatterns() {
        // Fetch and load globally learned patterns from server
        if (!this.isOnline) return;

        try {
            const response = await fetch(`${this.serverUrl}/api/ai/learning`);
            if (response.ok) {
                const data = await response.json();
                
                // Merge global patterns into local learning
                if (data.patterns && Array.isArray(data.patterns)) {
                    data.patterns.forEach(([key, value]) => {
                        if (!this.learnedPatterns.has(key)) {
                            this.learnedPatterns.set(key, value);
                        }
                    });
                }
                
                console.log(`📥 Loaded ${data.patterns.length} patterns from global AI database`);
            }
        } catch (error) {
            console.warn('Could not fetch global patterns:', error.message);
        }
    }

    async syncWithServer() {
        // Sync current learning data with server
        if (!this.isOnline) return;

        try {
            const syncData = {
                userId: this.userId,
                patterns: Array.from(this.learnedPatterns.entries()),
                preferences: this.userPreferences,
                conversations: this.conversationHistory.slice(-50) // Last 50 conversations
            };

            const response = await fetch(`${this.serverUrl}/api/ai/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`☁️ Synced with server: ${result.synced.conversations} conversations, ${result.synced.patterns} patterns`);
                
                // Load any new patterns from server after sync
                if (result.globalStats) {
                    this.userPreferences.globalStats = result.globalStats;
                }
            }
        } catch (error) {
            console.warn('Cloud sync failed (offline or server unavailable):', error.message);
        }
    }

    async getGlobalStats() {
        // Retrieve global AI statistics from server
        if (!this.isOnline) {
            return { error: 'Offline - cannot fetch global stats' };
        }

        try {
            const response = await fetch(`${this.serverUrl}/api/ai/stats`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Could not fetch global stats:', error.message);
        }
        return null;
    }

    loadLocalData() {
        // Load previously learned patterns from localStorage
        const saved = localStorage.getItem('aiLearningData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.learnedPatterns = new Map(data.patterns || []);
                this.userPreferences = data.preferences || {};
            } catch (e) {
                console.log('Learning data backup not found, starting fresh');
            }
        }
    }

    saveLearnedData() {
        // Persist learning data locally
        const data = {
            patterns: Array.from(this.learnedPatterns.entries()),
            preferences: this.userPreferences
        };
        localStorage.setItem('aiLearningData', JSON.stringify(data));
    }

    initializeResponses() {
        return {
            // Game-related queries
            'how to play|controls|tutorial': [
                'Use **WASD** or **Arrow Keys** to move your aircraft. **W/Up** to go forward, **S/Down** to go back, **A/Left** and **D/Right** to strafe.',
                'Aim with your **Mouse** and click to shoot. On mobile, use touch controls on the right side of the screen.',
                'You can ascend with **Space** and descend with **Shift**. Manage your ammo carefully - you get 120 rounds per game!',
                'Different game modes have different challenges. Try Training Academy first to learn the controls!'
            ],
            'difficulty|hard|easy': [
                'Try **Training Academy** for an easier experience with fewer bots.',
                'Want a challenge? **Survival Challenge** and **Boss Challenge** modes are extreme difficulty with advanced AI!',
                'Each game mode scales difficulty differently. Sky Dominance is balanced, Endless gets progressively harder.'
            ],
            'score|points|reward': [
                'You earn **100 points** for each bot you destroy.',
                'Completing waves faster gives bonus multipliers in some modes.',
                'Boss Challenge offers the highest rewards but is extremely difficult!'
            ],
            'game mode|endless|survival|training|boss': [
                'We have 5 game modes:\n🛩️ **Sky Dominance** - Balanced combat\n🌍 **Survival** - Extreme difficulty\n🎯 **Training** - Learn the basics\n♾️ **Endless** - Infinite waves\n👑 **Boss Challenge** - Ultimate test',
                'Each mode adjusts the AI difficulty and bot count differently. Try them all!'
            ],
            
            // Game strategy
            'strategy|tips|advice': [
                'Always keep moving to avoid enemy fire. Staying still makes you an easy target!',
                'Use altitude to your advantage. Flying higher gives you better positioning.',
                'Circle around enemies to get behind them. The AI prefersmissing targets behind them.',
                'Manage your ammo! 120 rounds might seem like a lot, but aim carefully.',
                'Focus on one bot at a time rather than spreading damage.'
            ],
            'how to improve|better|getting killed': [
                'Practice your mouse aiming in Training Academy mode first.',
                'Keep moving in unpredictable patterns to dodge enemy shots.',
                'Learn to use the terrain - trees and hills provide cover!',
                'The earlier game modes are less challenging. Work your way up!',
                'Watch your health bar - retreat and circle if you get hit!'
            ],

            // Technical questions
            'problem|bug|not working': [
                'Try refreshing the page if the game isn\'t loading properly.',
                'Make sure WebGL is enabled in your browser.',
                'If bots aren\'t visible, try a different browser like Chrome or Firefox.',
                'Mobile performance varies - desktop works best!',
                'Check the browser console (F12) for any error messages.'
            ],
            'mobile|phone|tablet': [
                'The game works on mobile with touch controls!',
                'Use the **left side** of the screen to control movement.',
                'Use the **right side** to aim and look around.',
                '**Tap the screen** anywhere to shoot.',
                'Large tablets work best for the experience.'
            ],
            'offline|internet|connection': [
                'The game works completely offline after loading! It only needs internet to download initially.',
                'No server connection required - everything runs in your browser.',
                'You can play in airplane mode once the game loads!'
            ],

            // AI questions
            'ai|bot|enemy': [
                'Each bot has intelligent AI that patrols, chases, and shoots!',
                'Bots will chase you if they detect you within 30 units.',
                'They\'re programmed with realistic dogfighting tactics.',
                'Higher difficulty modes have more aggressive and skilled AI.',
                'Boss Challenge has extremely advanced AI opponents!'
            ],

            // General help
            'help|support|question': [
                'I\'m here to help! Ask me about:\n- **Controls & gameplay**\n- **Game modes & difficulty**\n- **Strategies & tips**\n- **Technical issues**\n- **Mobile support**\n- **AI & bots**',
                'Feel free to ask anything about the game!'
            ],

            // Greetings
            'hello|hi|hey|start': [
                'Welcome! 👋 What would you like to know about the games?',
                'Hey there! Looking for help with gameplay, strategy, or technical issues?',
                'Greetings! Ready to dominate the skies? Ask me anything!'
            ],

            // Fun responses
            'cool|awesome|grewat': [
                'Thanks! Happy flying! 🛩️',
                'Right? The AI is pretty impressive!',
                'Glad you\'re enjoying it! Try Boss Challenge if you want a real test!'
            ]
        };
    }

    setupEventListeners() {
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Initialize with welcome message on first load
        setTimeout(() => {
            if (document.getElementById('chatMessages').children.length === 0) {
                this.clearHistory();
            }
        }, 100);
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        input.value = '';

        // Get AI response using ML-enhanced generation
        const response = this.generateResponse(message);
        
        // Simulate realistic thinking delay (longer for harder queries)
        const tokens = this.tokenize(message);
        const thinkingTime = 400 + (tokens.length * 50) + Math.random() * 300;
        
        setTimeout(() => {
            this.addMessageToChat(response, 'ai');
            
            // Show thinking indicator
            this.updateContextFromConversation(message, response);
        }, thinkingTime);

        // Store in history with metadata
        this.conversationHistory.push({
            user: message,
            ai: response,
            timestamp: Date.now(),
            tokens: tokens,
            intent: this.recognizeIntent(message, this.tokenize(message))
        });
        
        this.contextMemory.push({
            query: message,
            response: response,
            time: Date.now()
        });
    }

    updateContextFromConversation(userInput, aiResponse) {
        // Learn user preferences from conversation
        if (userInput.includes('boss')) {
            this.userPreferences.lastGameMode = 'Boss Challenge';
        } else if (userInput.includes('training') || userInput.includes('learn')) {
            this.userPreferences.lastGameMode = 'Training Academy';
        } else if (userInput.includes('mobile') || userInput.includes('phone')) {
            this.userPreferences.platform = 'mobile';
        }
        
        // Detect skill level from questions
        if (userInput.includes('how do i') || userInput.includes('how to') || userInput.includes('beginner')) {
            this.userPreferences.skillLevel = 'beginner';
        } else if (userInput.includes('advanced') || userInput.includes('pro') || userInput.includes('expert')) {
            this.userPreferences.skillLevel = 'advanced';
        }
    }

    generateResponse(userInput) {
        const input = userInput.toLowerCase().trim();
        
        // Check cache first for performance
        if (this.responseCache.has(input)) {
            return this.responseCache.get(input);
        }

        // Tokenize and analyze input
        const tokens = this.tokenize(input);
        const intent = this.recognizeIntent(input, tokens);
        const context = this.extractContext(input);
        
        // Score all available responses for best match
        const bestMatch = this.findBestResponse(input, tokens, intent);
        
        let response = '';
        
        if (bestMatch.score > 0.5) {
            // High confidence match
            response = this.formatResponse(bestMatch.text, context, intent);
            this.learnFromInteraction(input, response, bestMatch.score);
        } else if (this.learnedPatterns.has(intent)) {
            // Use learned pattern
            response = this.learnedPatterns.get(intent);
            this.updateLearnedPattern(intent, response);
        } else {
            // Generate contextual default response
            response = this.generateContextualResponse(input, context, intent, tokens);
            this.recordNewPattern(input, response, intent);
        }

        // Cache and return
        this.responseCache.set(input, response);
        return response;
    }

    tokenize(text) {
        // Break text into meaningful tokens
        return text
            .toLowerCase()
            .split(/[\s,\?!\.;:]+/)
            .filter(token => token.length > 1)
            .map(token => token.trim());
    }

    recognizeIntent(input, tokens) {
        // Analyze input to determine user intent
        const intentPatterns = {
            'help': ['help', 'assist', 'support', 'question', 'how', 'what', 'explain'],
            'strategy': ['strategy', 'tips', 'advice', 'trick', 'improve', 'better', 'success', 'win'],
            'controls': ['control', 'button', 'key', 'wasd', 'arrow', 'mouse', 'touch', 'gameplay'],
            'difficulty': ['hard', 'easy', 'difficult', 'challenge', 'mode', 'challenging'],
            'technical': ['bug', 'error', 'problem', 'crash', 'not working', 'broken', 'issue'],
            'mobile': ['mobile', 'phone', 'tablet', 'touch', 'responsive'],
            'ai_bot': ['ai', 'bot', 'enemy', 'artificial', 'intelligent', 'opponent'],
            'gameplay': ['play', 'game', 'score', 'points', 'achivement', 'reward', 'level'],
            'general': ['hi', 'hello', 'hey', 'greetings', 'cool', 'awesome', 'thanks']
        };

        let bestIntent = 'help';
        let bestScore = 0;

        for (const [intent, keywords] of Object.entries(intentPatterns)) {
            const score = tokens.filter(token => keywords.includes(token)).length / tokens.length;
            if (score > bestScore) {
                bestScore = score;
                bestIntent = intent;
            }
        }

        return bestIntent;
    }

    extractContext(input) {
        // Extract contextual information like game mode, difficulty, etc.
        const context = {
            mentionsBoss: input.includes('boss'),
            mentionsDifficulty: input.includes('hard') || input.includes('easy') || input.includes('difficulty'),
            mentionsMobile: input.includes('mobile') || input.includes('phone') || input.includes('tablet'),
            mentionsStrategy: input.includes('strategy') || input.includes('tips') || input.includes('how'),
            recentMode: this.userPreferences.lastGameMode || 'general',
            skillLevel: this.userPreferences.skillLevel || 'intermediate'
        };
        return context;
    }

    findBestResponse(input, tokens, intent) {
        let bestMatch = { text: '', score: 0 };
        
        // Check all response categories
        for (const [pattern, responses] of Object.entries(this.responses)) {
            const patterns = pattern.split('|');
            
            for (const p of patterns) {
                const score = this.calculateSimilarity(input, p, tokens);
                
                if (score > bestMatch.score) {
                    const selectedResponse = this.selectBestResponseFromSet(
                        responses, 
                        input, 
                        this.userPreferences.recentResponses || []
                    );
                    bestMatch = { 
                        text: selectedResponse, 
                        score: score,
                        pattern: p
                    };
                }
            }
        }
        
        return bestMatch;
    }

    calculateSimilarity(text1, text2, tokens) {
        // TF-IDF-like similarity scoring
        const text1Lower = text1.toLowerCase();
        const text2Lower = text2.toLowerCase();
        
        // Exact match bonus
        if (text1Lower === text2Lower) return 1.0;
        if (text1Lower.includes(text2Lower) || text2Lower.includes(text1Lower)) return 0.8;
        
        // Token overlap scoring
        const text2Tokens = text2Lower.split('|');
        const matches = tokens.filter(token => 
            text2Tokens.some(p => p.includes(token) || token.includes(p))
        ).length;
        
        return Math.min(matches / Math.max(tokens.length, 1), 1.0) * 0.6;
    }

    selectBestResponseFromSet(responses, input, recent) {
        // Avoid repeating recently used responses
        const recentSet = new Set(recent.slice(-3));
        
        // Find unused response, or pick random if all used
        const unused = responses.filter(r => !recentSet.has(r));
        const selected = unused.length > 0 ? 
            unused[Math.floor(Math.random() * unused.length)] :
            responses[Math.floor(Math.random() * responses.length)];
        
        // Track response usage
        if (!this.userPreferences.recentResponses) {
            this.userPreferences.recentResponses = [];
        }
        this.userPreferences.recentResponses.push(selected);
        if (this.userPreferences.recentResponses.length > 10) {
            this.userPreferences.recentResponses.shift();
        }
        
        return selected;
    }

    formatResponse(response, context, intent) {
        // Personalize response based on user context
        let formatted = response;
        
        if (context.skillLevel === 'beginner') {
            formatted = formatted.replace(/Try/g, 'Start with');
        } else if (context.skillLevel === 'advanced') {
            formatted = this.addAdvancedTips(formatted);
        }
        
        if (context.mentionsMobile && !formatted.includes('mobile')) {
            formatted += ' (Works great on mobile too!)';
        }
        
        return this.selectRandomResponse([formatted]);
    }

    addAdvancedTips(response) {
        // Add expert-level tips
        const advancedTips = {
            'strategy': ' Pro tip: Advanced players master circle strafing and altitude management!',
            'controls': ' Expert move: Rebind keys to your preference for faster reflexes!',
            'difficulty': ' Challenge: Try the Boss Challenge mode for the ultimate AI test!'
        };
        
        for (const [key, tip] of Object.entries(advancedTips)) {
            if (response.toLowerCase().includes(key)) {
                return response + tip;
            }
        }
        return response;
    }

    generateContextualResponse(input, context, intent, tokens) {
        // Generate dynamic responses based on context
        const contextResponses = {
            'help': `I can help! Based on your skill level (${context.skillLevel}), here are some resources. ${
                context.mentionsStrategy ? 'For strategy, focus on movement patterns and positioning.' : 
                context.mentionsMobile ? 'Mobile controls: left side moves, right side aims.' :
                'Try asking about controls, strategies, game modes, or technical issues!'
            }`,
            
            'strategy': `Great question! ${
                context.skillLevel === 'beginner' ? 'Start by mastering basic movement - avoid staying still!' :
                'Advanced tactics include altitude manipulation and predictive aiming.'
            } ${
                context.mentionsBoss ? 'Boss fights require patience and perfect timing.' : ''
            }`,
            
            'controls': `Movement controls vary by device. ${
                context.mentionsMobile ? 'Mobile: tap left side to move, right to aim' :
                'Desktop: WASD or arrows to move, mouse to aim and shoot'
            }. Want specific controls?`,
            
            'difficulty': `Challenge depends on your skill. ${
                context.skillLevel === 'beginner' ? 'Try Training Academy mode first.' :
                'Try Boss Challenge if you want the ultimate test!'
            }`,
            
            'technical': 'Technical issues? Try refreshing, checking WebGL support, or testing in Chrome/Firefox. Still stuck?',
            
            'mobile': 'Mobile gaming! The touchscreen controls work great. Try a larger device for better experience.',
            
            'ai_bot': 'Our AI uses sophisticated pathfinding and decision trees. Higher difficulty means more aggressive AI behavior!',
            
            'gameplay': `Scoring depends on mode. Generally: 100 points per bot, bonuses for speed. ${
                context.recentMode ? `You were playing ${context.recentMode} - good choice!` : ''
            }`,
            
            'general': 'Hey! I\'m here to help with anything about the games. What would you like to know?'
        };

        return contextResponses[intent] || contextResponses['help'];
    }

    learnFromInteraction(userInput, response, confidence) {
        // Learn from positive interactions
        if (confidence > 0.7) {
            const tokens = this.tokenize(userInput);
            const intent = this.recognizeIntent(userInput, tokens);
            
            // Update learning data
            const key = tokens.slice(0, 3).join(' ');
            this.learnedPatterns.set(intent, response);
            
            // Track user preferences
            if (!this.userPreferences.topicFrequency) {
                this.userPreferences.topicFrequency = {};
            }
            this.userPreferences.topicFrequency[intent] = 
                (this.userPreferences.topicFrequency[intent] || 0) + 1;
        }
        
        this.saveLearnedData();
        
        // Async server sync (don't wait for it)
        if (this.isOnline) {
            this.recordPatternOnServer(userInput, response);
        }
    }

    recordNewPattern(input, response, intent) {
        // Record new successful patterns for future use
        const tokens = this.tokenize(input);
        if (tokens.length > 0) {
            const pattern = tokens.slice(0, 2).join(' ');
            if (!this.learnedPatterns.has(pattern)) {
                this.learnedPatterns.set(pattern, response);
                this.saveLearnedData();
                
                // Try to record on server
                if (this.isOnline) {
                    this.recordPatternOnServer(pattern, response);
                }
            }
        }
    }

    async recordPatternOnServer(key, value) {
        // Record a new pattern on the server (collective learning)
        if (!this.isOnline) return;

        try {
            const response = await fetch(`${this.serverUrl}/api/ai/pattern`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key,
                    value,
                    userId: this.userId
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`📤 Pattern recorded globally (${result.totalPatterns} patterns now)`);
            }
        } catch (error) {
            console.warn('Could not record pattern on server:', error.message);
        }
    }

    updateLearnedPattern(pattern, response) {
        // Reinforce successful patterns
        const current = this.learnedPatterns.get(pattern);
        if (current !== response) {
            this.learnedPatterns.set(pattern, response);
            this.saveLearnedData();
        }
    }

    selectRandomResponse(responses) {
        if (Array.isArray(responses) && responses.length > 0) {
            const response = responses[Math.floor(Math.random() * responses.length)];
            return response
                .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold text
                .replace(/__(.*?)__/g, '$1');      // Underscores  
        }
        return responses || 'That\'s interesting! Tell me more!';
    }

    addMessageToChat(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.innerHTML = `<p>${this.escapeHtml(message)}</p>`;
        
        chatMessages.appendChild(messageElement);
        
        // Auto-scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    clearHistory() {
        this.conversationHistory = [];
        this.contextMemory = [];
        document.getElementById('chatMessages').innerHTML = '';
        
        // Show cloud sync status
        this.addCloudStatusMessage();
        
        // Show welcome message
        this.addMessageToChat(
            'Hello! I\'m your AI assistant powered by cloud-synchronized machine learning. I learn from conversations with everyone and improve over time. Ask me anything about the games, get help, or just chat! What can I help you with?',
            'ai'
        );
    }

    // Sentiment analysis for response quality
    analyzeSentiment(text) {
        const positive = ['good', 'great', 'awesome', 'cool', 'love', 'thanks', 'helpful', 'perfect'];
        const negative = ['bad', 'hate', 'terrible', 'useless', 'broken', 'confusing', 'difficult'];
        
        const lower = text.toLowerCase();
        const posCount = positive.filter(word => lower.includes(word)).length;
        const negCount = negative.filter(word => lower.includes(word)).length;
        
        return {
            sentiment: posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral',
            score: (posCount - negCount) / Math.max(posCount + negCount, 1)
        };
    }

    // Analyze conversation patterns to improve future responses
    analyzeConversationPatterns() {
        const patterns = {
            topTopics: {},
            commonQuestions: [],
            userSatisfaction: 0
        };

        for (const entry of this.conversationHistory) {
            const intent = entry.intent || 'unknown';
            patterns.topTopics[intent] = (patterns.topTopics[intent] || 0) + 1;
            
            const sentiment = this.analyzeSentiment(entry.user + ' ' + entry.ai);
            if (sentiment.sentiment === 'positive') {
                patterns.userSatisfaction += sentiment.score;
            }
        }

        return patterns;
    }

    // Get AI statistics
    getStatistics() {
        return {
            totalMessages: this.conversationHistory.length,
            topicsDiscussed: Object.keys(this.userPreferences.topicFrequency || {}),
            userSkillLevel: this.userPreferences.skillLevel || 'unknown',
            favoriteGameMode: this.userPreferences.lastGameMode || 'unknown',
            learnedPatterns: this.learnedPatterns.size,
            conversationDuration: this.conversationHistory.length > 0 ? 
                Date.now() - this.conversationHistory[0].timestamp : 0,
            userId: this.userId,
            isOnline: this.isOnline,
            syncStatus: this.isOnline ? 'syncing' : 'offline',
            globalStats: this.userPreferences.globalStats || {}
        };
    }

    // Add a method to display cloud sync status to user
    addCloudStatusMessage() {
        const chatMessages = document.getElementById('chatMessages');
        const statusMsg = document.createElement('div');
        statusMsg.className = 'message system-message';
        statusMsg.style.fontSize = '0.9em';
        statusMsg.style.color = '#999';
        statusMsg.style.textAlign = 'center';
        statusMsg.innerHTML = `<p>☁️ Cloud synced AI • Learning shared globally • User ID: ${this.userId.split('_')[0]}</p>`;
        chatMessages.appendChild(statusMsg);
    }
}

// Initialize AI with Machine Learning support
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.aiAssistant) {
            window.aiAssistant = new AIAssistant();
        }
    });
} else {
    if (!window.aiAssistant) {
        window.aiAssistant = new AIAssistant();
    }
}

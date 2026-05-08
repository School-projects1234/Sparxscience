// AI ChatBot System (ChatGPT-like)
class AIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.setupEventListeners();
        this.responses = this.initializeResponses();
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
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message to chat
        this.addMessageToChat(message, 'user');
        input.value = '';

        // Get AI response
        const response = this.generateResponse(message);
        
        // Simulate typing delay
        setTimeout(() => {
            this.addMessageToChat(response, 'ai');
        }, 500 + Math.random() * 500);

        // Store in history
        this.conversationHistory.push({
            user: message,
            ai: response,
            timestamp: Date.now()
        });
    }

    generateResponse(userInput) {
        const input = userInput.toLowerCase();

        // Check for matching patterns
        for (const [pattern, responses] of Object.entries(this.responses)) {
            const patterns = pattern.split('|');
            if (patterns.some(p => input.includes(p))) {
                return this.selectRandomResponse(responses);
            }
        }

        // Default responses if no match
        const defaultResponses = [
            'That\'s a great question! I\'m still learning, but the game has lots of features to explore!',
            'I\'m not sure about that, but try checking the game controls or tutorials!',
            'Interesting! Want to know about game strategies, controls, or how to improve?',
            'Great question! For more info, try the game yourself and see what works best.',
            'Hmm, that\'s a tricky one! Why don\'t you try it in the game and see what happens? 😄'
        ];

        return this.selectRandomResponse(defaultResponses);
    }

    selectRandomResponse(responses) {
        const response = responses[Math.floor(Math.random() * responses.length)];
        // Convert markdown-like formatting
        return response
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold text
            .replace(/__(.*?)__/g, '$1');      // Underscores
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
        document.getElementById('chatMessages').innerHTML = '';
        this.addMessageToChat(
            'Hello! I\'m your AI assistant. Ask me anything about the games, get help, or just chat! What can I help you with?',
            'ai'
        );
    }
}

// Initialize AI Assistant
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

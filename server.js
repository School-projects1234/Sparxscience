// Express Server with AI Learning Data Sync
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-start indicator
const AUTO_START_MODE = process.argv.includes('--auto-start');

console.log('\n🚀 =============================================');
console.log('   Sparx Science - Cloud AI Sync Server');
console.log('   Auto-Start Mode:', AUTO_START_MODE ? 'ENABLED ✅' : 'DISABLED');
console.log('=============================================\n');

// Global AI learning database (shared across all users)
let globalAIDatabase = {
    learnedPatterns: new Map(),
    userResponses: {},
    conversationStats: {
        totalMessages: 0,
        totalUsers: 0,
        topTopics: {}
    },
    lastUpdated: Date.now()
};

// Load persisted data on startup
const DATA_FILE = path.join(__dirname, 'data', 'ai-learning-data.json');
loadPersistedData();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

/**
 * API ENDPOINTS FOR AI LEARNING SYNC
 */

// GET: Retrieve global AI learning data
app.get('/api/ai/learning', (req, res) => {
    try {
        const data = {
            patterns: Array.from(globalAIDatabase.learnedPatterns.entries()),
            stats: globalAIDatabase.conversationStats,
            timestamp: Date.now(),
            userCount: Object.keys(globalAIDatabase.userResponses).length
        };
        res.json(data);
    } catch (error) {
        console.error('Error fetching learning data:', error);
        res.status(500).json({ error: 'Failed to fetch learning data' });
    }
});

// POST: Sync user AI session data with server
app.post('/api/ai/sync', (req, res) => {
    try {
        const { userId, patterns, preferences, conversations } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        // Store user-specific data
        if (!globalAIDatabase.userResponses[userId]) {
            globalAIDatabase.userResponses[userId] = {
                id: userId,
                joinedAt: Date.now(),
                conversations: [],
                preferences: {},
                syncs: 0
            };
            globalAIDatabase.conversationStats.totalUsers++;
        }

        const user = globalAIDatabase.userResponses[userId];

        // Merge patterns into global learning
        if (patterns && Array.isArray(patterns)) {
            patterns.forEach(([key, value]) => {
                globalAIDatabase.learnedPatterns.set(key, value);
            });
        }

        // Update user preferences
        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }

        // Track conversations
        if (conversations && Array.isArray(conversations)) {
            user.conversations = conversations;
            globalAIDatabase.conversationStats.totalMessages += conversations.length;
        }

        user.syncs++;
        user.lastSync = Date.now();

        // Update topic frequency
        if (conversations) {
            conversations.forEach(conv => {
                const topic = conv.intent || 'unknown';
                globalAIDatabase.conversationStats.topTopics[topic] = 
                    (globalAIDatabase.conversationStats.topTopics[topic] || 0) + 1;
            });
        }

        globalAIDatabase.lastUpdated = Date.now();
        persistData();

        res.json({
            success: true,
            userId,
            synced: {
                patterns: patterns ? patterns.length : 0,
                conversations: conversations ? conversations.length : 0
            },
            globalStats: globalAIDatabase.conversationStats
        });
    } catch (error) {
        console.error('Error syncing AI data:', error);
        res.status(500).json({ error: 'Failed to sync AI data' });
    }
});

// GET: User-specific AI data
app.get('/api/ai/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const userData = globalAIDatabase.userResponses[userId];

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId,
            preferences: userData.preferences,
            conversationCount: userData.conversations.length,
            syncs: userData.syncs,
            joinedAt: userData.joinedAt,
            lastSync: userData.lastSync
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// POST: Add new learned pattern (collective learning)
app.post('/api/ai/pattern', (req, res) => {
    try {
        const { key, value, userId } = req.body;

        if (!key || !value) {
            return res.status(400).json({ error: 'key and value required' });
        }

        globalAIDatabase.learnedPatterns.set(key, value);
        globalAIDatabase.lastUpdated = Date.now();
        persistData();

        res.json({
            success: true,
            pattern: key,
            totalPatterns: globalAIDatabase.learnedPatterns.size
        });
    } catch (error) {
        console.error('Error adding pattern:', error);
        res.status(500).json({ error: 'Failed to add pattern' });
    }
});

// GET: Global AI statistics
app.get('/api/ai/stats', (req, res) => {
    try {
        res.json({
            learnedPatterns: globalAIDatabase.learnedPatterns.size,
            totalUsers: globalAIDatabase.conversationStats.totalUsers,
            totalMessages: globalAIDatabase.conversationStats.totalMessages,
            topTopics: globalAIDatabase.conversationStats.topTopics,
            lastUpdated: globalAIDatabase.lastUpdated,
            uptime: process.uptime(),
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// POST: Batch sync multiple learning entries
app.post('/api/ai/batch-sync', (req, res) => {
    try {
        const { userId, patterns, stats } = req.body;

        if (!Array.isArray(patterns)) {
            return res.status(400).json({ error: 'patterns must be an array' });
        }

        let synced = 0;
        patterns.forEach(([key, value]) => {
            if (key && value) {
                globalAIDatabase.learnedPatterns.set(key, value);
                synced++;
            }
        });

        if (stats) {
            if (stats.totalMessages) {
                globalAIDatabase.conversationStats.totalMessages += stats.totalMessages;
            }
            if (stats.topTopics) {
                Object.assign(globalAIDatabase.conversationStats.topTopics, stats.topTopics);
            }
        }

        globalAIDatabase.lastUpdated = Date.now();
        persistData();

        res.json({
            success: true,
            patternsToSynced: synced,
            totalPatterns: globalAIDatabase.learnedPatterns.size
        });
    } catch (error) {
        console.error('Error in batch sync:', error);
        res.status(500).json({ error: 'Failed to batch sync' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
    });
});

/**
 * UTILITY FUNCTIONS
 */

function persistData() {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dataToSave = {
            patterns: Array.from(globalAIDatabase.learnedPatterns.entries()),
            conversationStats: globalAIDatabase.conversationStats,
            lastUpdated: Date.now()
        };

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(dataToSave, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error('Error persisting data:', error);
    }
}

function loadPersistedData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            
            // Restore patterns
            if (data.patterns && Array.isArray(data.patterns)) {
                data.patterns.forEach(([key, value]) => {
                    globalAIDatabase.learnedPatterns.set(key, value);
                });
            }

            // Restore stats
            if (data.conversationStats) {
                globalAIDatabase.conversationStats = data.conversationStats;
            }

            console.log(`✅ Loaded ${globalAIDatabase.learnedPatterns.size} learned patterns from disk`);
        }
    } catch (error) {
        console.error('Error loading persisted data:', error);
    }
}

// Periodic data persistence (every 5 minutes)
setInterval(() => {
    persistData();
}, 5 * 60 * 1000);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Sparx Science Server running on http://localhost:${PORT}`);
    console.log(`📚 AI Learning Database loaded with ${globalAIDatabase.learnedPatterns.size} patterns`);
    console.log(`👥 Global users tracked: ${globalAIDatabase.conversationStats.totalUsers}`);
});

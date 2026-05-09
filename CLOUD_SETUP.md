# Cloud AI Learning Sync Setup Guide

The Sparx Science AI now syncs learning data globally across all instances, making it smarter for everyone!

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
# or for development
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Access the Application
Open your browser to `http://localhost:3000`

## How It Works

### 🌐 Cloud Synchronization

- **Local Learning**: Each browser session learns from conversations locally
- **Server Sync**: Every 30 seconds, learning data syncs to the central server
- **Global Database**: All users benefit from patterns learned by everyone
- **Offline Support**: Works offline, syncs when connection restored

### 📊 Data Stored

The AI tracks:
- **Learned Patterns**: Question patterns and their best responses
- **User Preferences**: Skill level, favorite game modes, topics discussed
- **Conversation History**: Last 50 conversations per user
- **Global Statistics**: 
  - Total messages across all users
  - Most discussed topics
  - Number of active users
  - Total learned patterns

### 🔄 Sync Mechanism

1. **On Startup**: AI loads global patterns from server
2. **During Chat**: New patterns recorded locally immediately
3. **Every 30 Seconds**: Full sync of all user data to server
4. **On New Patterns**: Critical patterns backed up instantly
5. **Periodic Persistence**: Server saves data to disk every 5 minutes

### 🔗 API Endpoints

- `GET /api/ai/learning` - Get global learning data
- `GET /api/ai/stats` - Get global statistics
- `GET /api/ai/user/:userId` - Get user statistics
- `POST /api/ai/sync` - Sync user data with server
- `POST /api/ai/pattern` - Record new learned pattern
- `POST /api/ai/batch-sync` - Batch sync multiple patterns
- `GET /api/health` - Health check

### 📁 Data Files

Server persists data to:
```
data/
  └── ai-learning-data.json
```

Data includes:
- All learned patterns
- Conversation statistics
- Topic frequency tracking

### 🌍 Deployment

#### Local Development
```bash
npm start  # Runs on localhost:3000
```

#### Production Deployment

**Heroku:**
```bash
git push heroku main
heroku open
```

**Docker:**
```bash
docker build -t sparx-science .
docker run -p 3000:3000 sparx-science
```

**Environment Variables:**
```bash
PORT=3000          # Server port (default: 3000)
NODE_ENV=production
```

### 📈 Monitoring Performance

Check AI statistics:
```javascript
// In browser console
window.aiAssistant.getStatistics()
window.aiAssistant.getGlobalStats()
```

Server stats endpoint:
```bash
curl http://localhost:3000/api/ai/stats
```

### 🔐 Security Considerations

1. User IDs are anonymous (user_random_timestamp)
2. No personal information collected
3. All data is stored locally on server
4. CORS enabled for browser security
5. Input validation on all endpoints

### ⚙️ Configuration

Adjust in `server.js`:
- `PORT` - Server listening port (default: 3000)
- Sync interval in `ai.js` - `this.syncInterval = 30 * 1000` (milliseconds)
- Data persistence interval - Line in `server.js`:
  ```javascript
  setInterval(() => persistData(), 5 * 60 * 1000) // 5 minutes
  ```

### 🐛 Troubleshooting

**AI not syncing?**
- Check if server is running: `curl http://localhost:3000/api/health`
- Check browser console for errors (F12)
- Look for "Cloud sync failed" messages

**Data not persisting?**
- Ensure `data/` directory is writable
- Check server logs for file write errors
- Verify sufficient disk space

**Offline mode?**
- AI continues learning locally
- Syncs when connection restored
- Check `window.aiAssistant.isOnline`

### 📚 Example Usage

```javascript
// Check sync status
const stats = await window.aiAssistant.getGlobalStats();
console.log(`Global AI has learned ${stats.learnedPatterns} patterns`);
console.log(`Active users: ${stats.totalUsers}`);

// Manually sync (usually automatic)
await window.aiAssistant.syncWithServer();

// View local statistics
window.aiAssistant.getStatistics();
```

## Features

✅ Cloud-synchronized learning  
✅ Offline-first architecture  
✅ Persistent data storage  
✅ Global pattern database  
✅ Collective intelligence  
✅ User anonymity  
✅ Automatic syncing  
✅ Health monitoring  

---

**Version**: 1.0.0  
**Last Updated**: May 9, 2026

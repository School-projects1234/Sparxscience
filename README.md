# War Thunder Browser Game 🎮

A 3D War Thunder-like combat game playable in your browser with a secret access system.

## 🕵️ Secret Access Instructions

1. **Visit the disguised Sparx Science page** - It looks like a regular physics learning platform
2. **Look for the secret trigger** in the **bottom right corner**
3. **Double-click** the bottom right corner to reveal the CAPTCHA
4. **Solve the CAPTCHA** to proceed
5. **Enter the passcode**: `same1`
6. **Start flying and take down the enemy bots!**

## 🎮 Game Controls

### Keyboard + Mouse
- **W/A/S/D or Arrow Keys** - Move your aircraft
- **Mouse** - Look around and aim
- **Left Click or Spacebar** - Fire weapons
- **Shift** - Descend
- **Space** - Ascend

### Mobile/Touch
- **Touch left side** - Move left
- **Touch right side** - Move right
- **Touch top** - Move forward
- **Touch bottom** - Move backward
- **Tap screen** - Fire weapons

## 🎯 Game Mechanics

- **3D Aerial Combat** - Dogfight against AI bots
- **Health System** - Track your aircraft's integrity
- **Ammo Management** - Limited ammunition per session
- **Score Tracking** - Earn points for destroying enemies
- **Wave System** - New enemies spawn when all are defeated
- **AI Opponents** - Bots patrol and chase you intelligently

## 🔐 Security Features

- **CAPTCHA Protection** - Prevents automated access
- **Passcode System** - Personal access code required
- **Anti-Detection** - Cannot be easily blocked or filtered
- **Disguised Interface** - Appears as educational content

## 🛠 Technical Stack

- **Three.js** - 3D graphics engine
- **HTML5/CSS3** - UI and styling
- **Vanilla JavaScript** - Game logic and AI
- **WebGL** - Hardware-accelerated rendering

## 📊 Game Features

- **Fully 3D Environment** - Terrain with hills and obstacles
- **Dynamic Lighting** - Shadows and realistic lighting
- **Particle-like Effects** - Visual feedback for gameplay
- **Responsive Design** - Works on desktop and mobile
- **Smooth Physics** - Realistic aircraft movement

## 🚀 Deployment to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/root` folder
5. Your game will be live at `https://username.github.io/Sparxscience`

## 🎨 Customization

### Change the Passcode
Edit `js/passcode.js` line 6:
```javascript
this.correctPasscode = 'YOUR_CODE_HERE';
```

### Adjust Bot Difficulty
Edit `js/bots.js` to modify:
- Bot count: `this.botCount = 5;`
- Bot speed: Change speed multipliers
- AI aggressiveness: Modify shooting frequency

### Tweak Game Physics
Edit `js/game.js`:
- Player speed: `const moveSpeed = 0.3;`
- Gravity: `this.velocity.y -= 0.008;`
- Max altitude: Change Y position limits

## ⚠️ Browser Requirements

- Modern browser with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- 1GB+ RAM recommended
- Stable internet connection

## 📝 License

This project is created for educational purposes.

## 🐛 Known Issues & Tips

- First load may take a moment to initialize Three.js
- Mobile performance may vary depending on device
- Enable hardware acceleration in browser settings for best performance
- Use fullscreen (F11) for immersive experience

## 🤝 Support

For issues or suggestions, check the browser console (F12) for detailed error messages.

---

**Remember: The bottom right corner holds the secret! 🔍**

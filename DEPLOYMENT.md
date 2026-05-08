# 🚀 Deployment Guide

## Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface (Easiest)

1. **Ensure code is pushed to GitHub:**
   ```bash
   git status
   git add .
   git commit -m "Add 3D War Thunder-like game with secret access"
   git push origin main
   ```

2. **Go to Repository Settings:**
   - Navigate to your GitHub repository
   - Click on "Settings" tab
   - Scroll down to "Pages" section

3. **Enable GitHub Pages:**
   - Branch: Select `main`
   - Folder: Select `/ (root)`
   - Click "Save"

4. **Wait for deployment:**
   - GitHub will show a URL like: `https://School-projects1234.github.io/Sparxscience`
   - Your game will be live in 1-2 minutes!

### Option 2: Using GitHub CLI

```bash
gh repo edit --enable-discussions
# Then configure Pages via web interface as above
```

### Option 3: Using Git Commands

```bash
# Make sure everything is committed
git add .
git commit -m "Deploy War Thunder game to GitHub Pages"
git push origin main
```

## 📋 Pre-Deployment Checklist

- ✅ All files are in the correct folders
- ✅ `index.html` is in the root directory
- ✅ `.nojekyll` file is present (prevents Jekyll processing)
- ✅ All JavaScript files are linked correctly
- ✅ CSS file is properly linked
- ✅ No console errors in browser dev tools (F12)
- ✅ Game runs locally (see Testing section)

## 🧪 Testing Locally Before Deployment

### Using Python 3 (Recommended):
```bash
cd /workspaces/Sparxscience
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Using Python 2:
```bash
python -m SimpleHTTPServer 8000
```

### Using Node.js:
```bash
npm install -g http-server
http-server
```

### Using PHP:
```bash
php -S localhost:8000
```

## ✅ Post-Deployment Verification

1. **Visit your live URL:**
   - `https://Your-GitHub-Username.github.io/Sparxscience`

2. **Test the access system:**
   - Page loads and shows Sparx Science interface
   - Check browser console: Should see hint message
   - Double-click bottom right corner
   - CAPTCHA appears
   - Enter the displayed code
   - Passcode modal appears
   - Enter: `PHOENIX`
   - Game launches!

3. **Test game functionality:**
   - Camera and aircraft movements work
   - Bots are visible and moving
   - Shooting creates bullets
   - Health, ammo, score display updates
   - Mobile controls work (if testing on phone)

## 🔧 Troubleshooting

### Page shows 404
- Make sure repository is public
- Check that branch is `main` (or whatever your default is)
- Wait 2-3 minutes for GitHub to process

### Game doesn't load after passcode
- Open browser DevTools (F12)
- Check Console tab for errors
- Verify all JavaScript files loaded (Network tab)
- Clear browser cache and reload

### CAPTCHA not showing
- Check if JavaScript is enabled
- Verify you double-clicked (not single-click) bottom right
- Try keyboard shortcut: Ctrl+Shift+U

### Game runs but bots don't appear
- Check browser console for Three.js errors
- Ensure WebGL is supported (type `chrome://settings` → Search "GPU")
- Try a different browser

### Passcode not working
- Passcode is case-sensitive: `PHOENIX`
- Try refreshing the page
- Clear browser cache
- Check console for errors

## 📝 Customization After Deployment

### Change the Passcode
1. Edit `js/passcode.js`
2. Line 6: Change `'PHOENIX'` to your code
3. Commit and push: 
   ```bash
   git add js/passcode.js
   git commit -m "Update passcode"
   git push origin main
   ```
4. Changes live in 1-2 minutes

### Modify Game Parameters
- Bot count: `js/bots.js` line ~85
- Game speed: `js/game.js` line ~380
- Colors: `css/style.css` throughout

## 🌍 Additional Deployment Options

### Netlify
1. Connect GitHub repo to Netlify
2. Build command: (leave empty)
3. Publish directory: `/`
4. Deploy!

### Vercel
1. Import project from GitHub
2. Framework: Other
3. Deploy!

### Heroku (with buildpack)
1. Not recommended for static games
2. Use GitHub Pages instead

## 📞 Support

If deployment fails:
1. Check repository is public
2. Verify `.nojekyll` file exists
3. Check file permissions
4. View GitHub Pages deployment logs in Settings → Pages

---

**Your game will be live and accessible from anywhere in the world! 🎮**

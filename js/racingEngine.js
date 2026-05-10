// Racing Game Engine (Drive Mad, Rally Raid)
class RacingGameEngine {
    constructor(gameMode = 'arcade') {
        this.gameMode = gameMode; // 'arcade' or 'rally'
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gameRunning = false;
        this.gameTimer = 0;
        this.raceTimer = 0;
        this.currentLap = 1;
        this.maxLaps = 3;
        this.playerPosition = 0;
        this.playerSpeed = 0;
        this.maxSpeed = 300;
        this.keys = {};
        this.score = 0;
        this.damage = 0;
        this.coins = 0;
        
        this.initGame();
    }
    
    initGame() {
        const container = document.getElementById('gameContainer');
        const gameTitle = this.gameMode === 'arcade' ? 'Drive Mad' : 'Rally Raid';
        
        container.innerHTML = `
            <div id="racingUI" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
                <canvas id="racingCanvas"></canvas>
                <div class="racing-hud">
                    <div class="hud-info">
                        <div class="race-info">
                            <h2>${gameTitle}</h2>
                            <p>Lap: <span id="lapDisplay">1/3</span></p>
                            <p>Speed: <span id="speedDisplay">0</span> km/h</p>
                        </div>
                        <div class="race-stats">
                            <p>Time: <span id="timeDisplay">00:00</span></p>
                            <p>Position: <span id="positionDisplay">1st</span></p>
                            <p>Damage: <span id="damageDisplay">0%</span></p>
                        </div>
                    </div>
                    <div class="race-controls">
                        Arrow Keys/WASD: Drive | Space: Drift | Shift: Brake
                        <button id="quitRacing" class="btn-secondary">Quit</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 500, 50);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, -50);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('racingCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Create race track
        this.createRaceTrack();
        
        // Setup input
        this.setupInput();
        
        // Setup quit button
        document.getElementById('quitRacing').addEventListener('click', () => this.quit());
        
        // Start game
        this.gameRunning = true;
        this.animate();
    }
    
    createRaceTrack() {
        // Create a simple race track
        const trackLength = 400;
        const trackWidth = 15;
        
        // Track ground
        const groundGeometry = new THREE.PlaneGeometry(trackWidth, trackLength);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Track lines
        const lineGeometry = new THREE.PlaneGeometry(0.5, trackLength);
        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.x = -Math.PI / 2;
        line.position.z = -trackLength / 2;
        this.scene.add(line);
        
        // Surrounding terrain
        const grassGeometry = new THREE.PlaneGeometry(200, trackLength);
        const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = -0.1;
        this.scene.add(grass);
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        if (!this.gameRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.gameTimer += 1/60;
        this.raceTimer += 1/60;
        this.updateGameLogic();
        this.updateHUD();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateGameLogic() {
        // Handle acceleration/deceleration
        const acceleration = 0.5;
        const friction = 0.95;
        
        if (this.keys['arrowup'] || this.keys['w']) {
            this.playerSpeed = Math.min(this.maxSpeed, this.playerSpeed + acceleration);
        } else if (this.keys['arrowdown'] || this.keys['s'] || this.keys['shift']) {
            this.playerSpeed = Math.max(0, this.playerSpeed - acceleration * 1.5);
        } else {
            this.playerSpeed *= friction;
        }
        
        // Update position
        this.playerPosition += this.playerSpeed * 0.01;
        
        // Check lap completion (400 unit circuit)
        if (this.playerPosition >= 400) {
            if (this.currentLap < this.maxLaps) {
                this.currentLap++;
                this.playerPosition = this.playerPosition - 400;
                this.score += 1000;
            } else {
                this.endRace();
            }
        }
        
        // Random damage from rough terrain
        if (Math.random() > 0.98) {
            this.damage = Math.min(100, this.damage + Math.random() * 5);
        }
        
        if (this.damage >= 100) {
            this.endRace('Vehicle destroyed!');
        }
        
        // Update camera to follow player
        this.camera.position.z = -this.playerPosition - 50;
    }
    
    updateHUD() {
        const minutes = Math.floor(this.raceTimer / 60);
        const seconds = Math.floor(this.raceTimer % 60);
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        document.getElementById('lapDisplay').textContent = `${this.currentLap}/${this.maxLaps}`;
        document.getElementById('speedDisplay').textContent = Math.floor(this.playerSpeed);
        document.getElementById('timeDisplay').textContent = timeStr;
        document.getElementById('damageDisplay').textContent = Math.floor(this.damage) + '%';
        
        const positions = ['1st', '2nd', '3rd', '4th'];
        document.getElementById('positionDisplay').textContent = positions[0]; // Simple implementation
    }
    
    endRace(reason = 'Race Completed!') {
        this.gameRunning = false;
        const message = `${reason}\n\nFinal Time: ${Math.floor(this.raceTimer)}s\nScore: ${this.score}`;
        alert(message);
        this.quit();
    }
    
    quit() {
        this.gameRunning = false;
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (window.menuSystem) {
            document.getElementById('gameContainer').innerHTML = '';
            document.getElementById('gameContainer').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
            document.getElementById('sparxPage').classList.remove('hidden');
        }
    }
}

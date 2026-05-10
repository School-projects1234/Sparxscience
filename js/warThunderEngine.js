// War Thunder - Complete Game Engine with Multiple Modes
class WarThunderEngine {
    constructor() {
        // Core game state
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gameRunning = false;
        
        // Game flow states
        this.gameState = 'country_select'; // country_select, gamemode_select, playing, game_over, tech_tree
        this.selectedCountry = null;
        this.selectedGameMode = null; // 'air_arcade', 'ground_arcade', 'naval'
        this.selectedVehicleRole = null; // 'fighter', 'bomber', 'tank', 'ship'
        
        // Player stats
        this.playerStats = {
            health: 100,
            ammo: 120,
            fuel: 100,
            score: 0,
            xp: 0,
            level: 1
        };
        
        // Game mechanics
        this.objectiveProgress = {};
        this.teamInfo = {
            teamA: { name: '', destroyed: 0, totalTargets: 10 },
            teamB: { name: '', destroyed: 0, totalTargets: 10 }
        };
        this.controlPoints = [];
        this.gameTimer = 0;
        
        // Vehicles and bots
        this.playerVehicle = null;
        this.bots = [];
        this.botCount = 4;
        
        // UI elements
        this.uiElements = {};
        this.inputBound = false;
        this.keys = {};
        this.touchInput = { x: 0, y: 0, active: false };
        
        // Initialize
        this.initializeUI();
    }
    
    // ===== COUNTRY DATA =====
    getCountriesDatabase() {
        return {
            usa: {
                name: 'United States',
                icon: '🇺🇸',
                color: 0x0052CC,
                aircraft: [
                    { name: 'P-51 Mustang', tier: 1, role: 'fighter', speed: 440, firepower: 8, armor: 6 },
                    { name: 'P-47 Thunderbolt', tier: 2, role: 'fighter', speed: 430, firepower: 9, armor: 8 },
                    { name: 'B-17 Flying Fortress', tier: 3, role: 'bomber', speed: 280, firepower: 6, armor: 9 }
                ],
                tanks: [
                    { name: 'M4 Sherman', tier: 1, speed: 42, firepower: 7, armor: 6 },
                    { name: 'M26 Pershing', tier: 2, speed: 37, firepower: 9, armor: 8 },
                    { name: 'M48 Patton', tier: 3, speed: 50, firepower: 9, armor: 8 }
                ],
                ships: [
                    { name: 'Fletcher-class Destroyer', tier: 1, speed: 36, firepower: 8, armor: 6 },
                    { name: 'Baltimore-class Cruiser', tier: 2, speed: 32, firepower: 9, armor: 8 },
                    { name: 'Iowa-class Battleship', tier: 3, speed: 33, firepower: 10, armor: 9 }
                ]
            },
            germany: {
                name: 'Germany',
                icon: '🇩🇪',
                color: 0xFFCC00,
                aircraft: [
                    { name: 'Bf 109', tier: 1, role: 'fighter', speed: 450, firepower: 8, armor: 5 },
                    { name: 'Fw 190', tier: 2, role: 'fighter', speed: 440, firepower: 9, armor: 7 },
                    { name: 'He 111', tier: 3, role: 'bomber', speed: 300, firepower: 5, armor: 8 }
                ],
                tanks: [
                    { name: 'Panzer IV', tier: 1, speed: 40, firepower: 7, armor: 7 },
                    { name: 'Panther', tier: 2, speed: 46, firepower: 9, armor: 8 },
                    { name: 'Tiger II', tier: 3, speed: 38, firepower: 10, armor: 9 }
                ],
                ships: [
                    { name: 'Z-class Destroyer', tier: 1, speed: 36, firepower: 8, armor: 6 },
                    { name: 'Admiral Hipper-class Cruiser', tier: 2, speed: 32, firepower: 9, armor: 8 },
                    { name: 'Bismarck-class Battleship', tier: 3, speed: 30, firepower: 10, armor: 10 }
                ]
            },
            ussr: {
                name: 'Soviet Union',
                icon: '🇷🇺',
                color: 0xCC0000,
                aircraft: [
                    { name: 'Yak-1', tier: 1, role: 'fighter', speed: 400, firepower: 7, armor: 6 },
                    { name: 'La-7', tier: 2, role: 'fighter', speed: 430, firepower: 8, armor: 7 },
                    { name: 'Ilyushin IL-2', tier: 3, role: 'bomber', speed: 280, firepower: 7, armor: 9 }
                ],
                tanks: [
                    { name: 'T-34', tier: 1, speed: 55, firepower: 8, armor: 7 },
                    { name: 'T-44', tier: 2, speed: 50, firepower: 8, armor: 8 },
                    { name: 'T-54', tier: 3, speed: 50, firepower: 9, armor: 8 }
                ],
                ships: [
                    { name: 'Gnevny-class Destroyer', tier: 1, speed: 36, firepower: 7, armor: 6 },
                    { name: 'Maxim Gorky-class Cruiser', tier: 2, speed: 32, firepower: 8, armor: 8 },
                    { name: 'Sovetskiy Soyuz-class Battleship', tier: 3, speed: 33, firepower: 10, armor: 9 }
                ]
            },
            japan: {
                name: 'Japan',
                icon: '🇯🇵',
                color: 0xFF0000,
                aircraft: [
                    { name: 'Zero', tier: 1, role: 'fighter', speed: 380, firepower: 6, armor: 5 },
                    { name: 'Ki-84 Hayate', tier: 2, role: 'fighter', speed: 420, firepower: 7, armor: 6 },
                    { name: 'B5N "Kate"', tier: 3, role: 'bomber', speed: 240, firepower: 5, armor: 7 }
                ],
                tanks: [
                    { name: 'Type 97', tier: 1, speed: 38, firepower: 6, armor: 5 },
                    { name: 'Type 75', tier: 2, speed: 45, firepower: 7, armor: 6 },
                    { name: 'Type 10', tier: 3, speed: 60, firepower: 9, armor: 8 }
                ],
                ships: [
                    { name: 'Fubuki-class Destroyer', tier: 1, speed: 35, firepower: 8, armor: 6 },
                    { name: 'Mogami-class Cruiser', tier: 2, speed: 34, firepower: 9, armor: 7 },
                    { name: 'Yamato-class Battleship', tier: 3, speed: 27, firepower: 10, armor: 10 }
                ]
            },
            uk: {
                name: 'United Kingdom',
                icon: '🇬🇧',
                color: 0x003DA5,
                aircraft: [
                    { name: 'Spitfire MK V', tier: 1, role: 'fighter', speed: 460, firepower: 7, armor: 5 },
                    { name: 'Spitfire MK XIV', tier: 2, role: 'fighter', speed: 470, firepower: 8, armor: 6 },
                    { name: 'Avro Lancaster', tier: 3, role: 'bomber', speed: 280, firepower: 5, armor: 8 }
                ],
                tanks: [
                    { name: 'Cromwell', tier: 1, speed: 64, firepower: 7, armor: 6 },
                    { name: 'Challenger 2', tier: 2, speed: 56, firepower: 9, armor: 8 },
                    { name: 'Chieftain', tier: 3, speed: 48, firepower: 9, armor: 9 }
                ],
                ships: [
                    { name: 'Daring-class Destroyer', tier: 1, speed: 34, firepower: 8, armor: 6 },
                    { name: 'Town-class Cruiser', tier: 2, speed: 32, firepower: 8, armor: 7 },
                    { name: 'King George V-class Battleship', tier: 3, speed: 28, firepower: 10, armor: 9 }
                ]
            }
        };
    }
    
    // ===== UI INITIALIZATION =====
    initializeUI() {
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error('Game container not found');
            return;
        }
        
        // Create main game UI
        container.innerHTML = `
            <div id="warThunderUI" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
                <!-- Country Selection Screen -->
                <div id="countrySelectScreen" class="war-thunder-screen">
                    <div class="wt-modal">
                        <h1>War Thunder - Select Your Nation</h1>
                        <div id="countryGrid" class="country-grid"></div>
                    </div>
                </div>
                
                <!-- Game Mode Selection Screen -->
                <div id="gameModeScreen" class="war-thunder-screen hidden">
                    <div class="wt-modal">
                        <h1>War Thunder - Select Game Mode</h1>
                        <p>Nation: <strong id="selectedCountryDisplay"></strong></p>
                        <div id="gameModeGrid" class="gamemode-grid"></div>
                        <button id="backToCountryButton" class="btn-secondary" style="margin-top: 20px;">Back</button>
                    </div>
                </div>
                
                <!-- Role Selection Screen -->
                <div id="roleSelectScreen" class="war-thunder-screen hidden">
                    <div class="wt-modal">
                        <h1>War Thunder - Select Your Role</h1>
                        <div id="roleGrid" class="role-grid"></div>
                        <button id="backToGameModeButton" class="btn-secondary" style="margin-top: 20px;">Back</button>
                    </div>
                </div>
                
                <!-- Game Canvas -->
                <div id="gameCanvas" style="display: none; width: 100%; height: 100%;"></div>
                
                <!-- Game HUD -->
                <div id="gameHUD" class="game-hud hidden">
                    <div class="hud-top">
                        <div class="hud-left">
                            <div class="hud-stat">Health: <span id="hudHealth">100</span>%</div>
                            <div class="hud-stat">Ammo: <span id="hudAmmo">120</span></div>
                            <div class="hud-stat">Fuel: <span id="hudFuel">100</span>%</div>
                        </div>
                        <div class="hud-center">
                            <div id="gameModeDisplay" class="mode-display">Air Arcade</div>
                        </div>
                        <div class="hud-right">
                            <div class="hud-stat">Score: <span id="hudScore">0</span></div>
                            <div class="hud-stat">XP: <span id="hudXP">0</span></div>
                            <div class="hud-stat">Level: <span id="hudLevel">1</span></div>
                        </div>
                    </div>
                    
                    <div class="hud-bottom">
                        <div id="objectiveInfo" class="objective-info"></div>
                        <button id="quitGameButton" class="btn-quit">Quit Game</button>
                    </div>
                </div>
                
                <!-- Tech Tree Screen -->
                <div id="techTreeScreen" class="war-thunder-screen hidden">
                    <div class="wt-modal tech-tree-modal">
                        <h1>Tech Tree - <span id="techTreeCountry"></span></h1>
                        <div id="techTreeContent" class="tech-tree-content"></div>
                        <button id="backToMenuButton" class="btn-secondary" style="margin-top: 20px;">Back to Menu</button>
                    </div>
                </div>
            </div>
        `;
        
        // Store references
        this.uiElements = {
            container: container,
            countryScreen: document.getElementById('countrySelectScreen'),
            gameModeScreen: document.getElementById('gameModeScreen'),
            roleScreen: document.getElementById('roleSelectScreen'),
            gameCanvas: document.getElementById('gameCanvas'),
            gameHUD: document.getElementById('gameHUD'),
            techTreeScreen: document.getElementById('techTreeScreen')
        };
        
        // Initialize country selection
        this.initializeCountrySelection();
        
        // Setup event listeners
        document.getElementById('backToCountryButton').addEventListener('click', () => this.goToCountrySelection());
        document.getElementById('backToGameModeButton').addEventListener('click', () => this.goToGameModeSelection());
        document.getElementById('backToMenuButton').addEventListener('click', () => this.returnToMenu());
        document.getElementById('quitGameButton').addEventListener('click', () => this.quitCurrentGame());
    }
    
    initializeCountrySelection() {
        const grid = document.getElementById('countryGrid');
        const countries = this.getCountriesDatabase();
        
        grid.innerHTML = '';
        for (const [countryKey, countryData] of Object.entries(countries)) {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.innerHTML = `
                <div class="country-icon">${countryData.icon}</div>
                <h2>${countryData.name}</h2>
                <p>Aircraft | Tanks | Ships</p>
            `;
            card.addEventListener('click', () => this.selectCountry(countryKey));
            grid.appendChild(card);
        }
    }
    
    selectCountry(countryKey) {
        this.selectedCountry = countryKey;
        const countries = this.getCountriesDatabase();
        document.getElementById('selectedCountryDisplay').textContent = countries[countryKey].name;
        this.goToGameModeSelection();
    }
    
    goToCountrySelection() {
        this.gameState = 'country_select';
        this.uiElements.countryScreen.classList.remove('hidden');
        this.uiElements.gameModeScreen.classList.add('hidden');
        this.uiElements.roleScreen.classList.add('hidden');
    }
    
    goToGameModeSelection() {
        this.gameState = 'gamemode_select';
        this.uiElements.countryScreen.classList.add('hidden');
        this.uiElements.gameModeScreen.classList.remove('hidden');
        this.uiElements.roleScreen.classList.add('hidden');
        
        this.renderGameModeSelection();
    }
    
    renderGameModeSelection() {
        const grid = document.getElementById('gameModeGrid');
        grid.innerHTML = `
            <div class="gamemode-card" data-mode="air_arcade">
                <div class="gamemode-icon">✈️</div>
                <h3>Air Arcade</h3>
                <p>Bomb targets and destroy enemy squadrons</p>
            </div>
            <div class="gamemode-card" data-mode="ground_arcade">
                <div class="gamemode-icon">🚚</div>
                <h3>Ground Arcade</h3>
                <p>Capture control points and hold for 5 minutes</p>
            </div>
            <div class="gamemode-card" data-mode="naval">
                <div class="gamemode-icon">⚓</div>
                <h3>Naval Battle</h3>
                <p>Dominate the seas with historic warships</p>
            </div>
        `;
        
        grid.querySelectorAll('.gamemode-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const mode = card.dataset.mode;
                this.selectGameMode(mode);
            });
        });
    }
    
    selectGameMode(mode) {
        this.selectedGameMode = mode;
        this.goToRoleSelection();
    }
    
    goToRoleSelection() {
        this.uiElements.countryScreen.classList.add('hidden');
        this.uiElements.gameModeScreen.classList.add('hidden');
        this.uiElements.roleScreen.classList.remove('hidden');
        
        this.renderRoleSelection();
    }
    
    renderRoleSelection() {
        const grid = document.getElementById('roleGrid');
        const countries = this.getCountriesDatabase();
        const country = countries[this.selectedCountry];
        
        let roles = [];
        if (this.selectedGameMode === 'air_arcade') {
            roles = [
                { id: 'fighter', name: 'Fighter Pilot', icon: '✈️', desc: 'Air-to-air combat' },
                { id: 'bomber', name: 'Bomber Pilot', icon: '💣', desc: 'Bomb ground targets' }
            ];
        } else if (this.selectedGameMode === 'ground_arcade') {
            roles = [
                { id: 'tank', name: 'Tank Commander', icon: '🚚', desc: 'Heavy armor combat' }
            ];
        } else if (this.selectedGameMode === 'naval') {
            roles = [
                { id: 'ship', name: 'Naval Captain', icon: '⚓', desc: 'Command warships' }
            ];
        }
        
        grid.innerHTML = '';
        roles.forEach(role => {
            const card = document.createElement('div');
            card.className = 'role-card';
            card.innerHTML = `
                <div class="role-icon">${role.icon}</div>
                <h3>${role.name}</h3>
                <p>${role.desc}</p>
                <button class="btn-primary">Select</button>
            `;
            card.addEventListener('click', () => this.startGame(role.id));
            grid.appendChild(card);
        });
    }
    
    startGame(role) {
        this.selectedVehicleRole = role;
        this.gameState = 'playing';
        this.initializeGameEngine();
    }
    
    initializeGameEngine() {
        // Hide menu screens
        this.uiElements.countryScreen.classList.add('hidden');
        this.uiElements.gameModeScreen.classList.add('hidden');
        this.uiElements.roleScreen.classList.add('hidden');
        this.uiElements.gameCanvas.style.display = 'block';
        this.uiElements.gameHUD.classList.remove('hidden');
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        const countries = this.getCountriesDatabase();
        const countryColor = countries[this.selectedCountry].color;
        this.scene.background = new THREE.Color(countryColor).multiplyScalar(0.3);
        this.scene.fog = new THREE.Fog(this.scene.background.getHex(), 1000, 50);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 20, 0);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.uiElements.gameCanvas.appendChild(this.renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Create environment
        this.createGameEnvironment();
        
        // Setup input
        this.setupGameInput();
        
        // Start game loop
        this.gameRunning = true;
        this.gameTimer = 0;
        this.animate();
        
        // Update HUD
        document.getElementById('gameModeDisplay').textContent = 
            this.selectedGameMode === 'air_arcade' ? 'Air Arcade' :
            this.selectedGameMode === 'ground_arcade' ? 'Ground Arcade' : 'Naval Battle';
    }
    
    createGameEnvironment() {
        // Create terrain/water based on game mode
        if (this.selectedGameMode === 'naval') {
            this.createWaterEnvironment();
        } else {
            this.createLandEnvironment();
        }
    }
    
    createLandEnvironment() {
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c59,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Add some terrain features
        for (let i = 0; i < 10; i++) {
            const hillGeometry = new THREE.ConeGeometry(30 + Math.random() * 20, 15, 16);
            const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a2d });
            const hill = new THREE.Mesh(hillGeometry, hillMaterial);
            hill.position.x = (Math.random() - 0.5) * 800;
            hill.position.z = (Math.random() - 0.5) * 800;
            hill.position.y = 0;
            hill.castShadow = true;
            hill.receiveShadow = true;
            this.scene.add(hill);
        }
        
        // Create control points if ground arcade
        if (this.selectedGameMode === 'ground_arcade') {
            this.createControlPoints();
        }
    }
    
    createWaterEnvironment() {
        // Water plane
        const waterGeometry = new THREE.PlaneGeometry(2000, 2000);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a5490,
            roughness: 0.2,
            metalness: 0.3
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.receiveShadow = true;
        this.scene.add(water);
    }
    
    createControlPoints() {
        // Create 3 control points for ground arcade
        const positions = [
            { x: -200, z: 0, name: 'Alpha' },
            { x: 0, z: 0, name: 'Bravo' },
            { x: 200, z: 0, name: 'Charlie' }
        ];
        
        this.controlPoints = positions.map(pos => ({
            x: pos.x,
            z: pos.z,
            name: pos.name,
            owned: null, // null, 'team_a', 'team_b'
            captureProgress: 0,
            timeHeld: 0
        }));
        
        // Visualize control points
        positions.forEach(pos => {
            const geometry = new THREE.CylinderGeometry(30, 30, 1, 32);
            const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(pos.x, 0.5, pos.z);
            this.scene.add(mesh);
        });
    }
    
    setupGameInput() {
        if (this.inputBound) return;
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        window.addEventListener('mousemove', (e) => {
            this.touchInput.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.touchInput.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        
        window.addEventListener('click', (e) => {
            if (this.gameRunning) {
                this.onGameClick();
            }
        });
        
        this.inputBound = true;
    }
    
    onGameClick() {
        // Fire weapon
        this.playerStats.ammo = Math.max(0, this.playerStats.ammo - 10);
        this.playerStats.score += 5;
    }
    
    animate() {
        if (!this.gameRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Update game state
        const deltaTime = 1/60;
        this.gameTimer += deltaTime;
        this.updateGameLogic(deltaTime);
        this.updateHUD();
        
        // Render
        if (this.renderer && this.camera && this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    updateGameLogic(deltaTime) {
        if (!this.gameRunning) return;
        
        // Handle player input
        const moveSpeed = 0.5;
        if (this.keys['w'] || this.keys['arrowup']) this.camera.position.z -= moveSpeed;
        if (this.keys['s'] || this.keys['arrowdown']) this.camera.position.z += moveSpeed;
        if (this.keys['a'] || this.keys['arrowleft']) this.camera.position.x -= moveSpeed;
        if (this.keys['d'] || this.keys['arrowright']) this.camera.position.x += moveSpeed;
        
        // Mode-specific logic
        if (this.selectedGameMode === 'air_arcade') {
            this.updateAirArcadeLogic(deltaTime);
        } else if (this.selectedGameMode === 'ground_arcade') {
            this.updateGroundArcadeLogic(deltaTime);
        } else if (this.selectedGameMode === 'naval') {
            this.updateNavalLogic(deltaTime);
        }
        
        // Natural resource decay
        this.playerStats.fuel = Math.max(0, this.playerStats.fuel - (0.3 * deltaTime));
        
        // Check loss conditions
        if (this.playerStats.fuel === 0) {
            this.endGame('Out of fuel!');
        }
        if (this.playerStats.health <= 0) {
            this.endGame('Your vehicle was destroyed!');
        }
        
        // Random enemy damage
        if (Math.random() > 0.98) {
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 15);
        }
    }
    
    updateAirArcadeLogic(deltaTime) {
        // Air arcade: Bomb targets and destroy enemies
        const mode = this.selectedVehicleRole;
        
        // Simulate target destruction
        if (Math.random() > 0.95) {
            const targetsDestroyed = Math.floor(this.gameTimer / 10);
            this.playerStats.score += 50;
            this.playerStats.xp += 25;
        }
        
        // Simulate enemy encounters
        if (Math.random() > 0.94) {
            this.playerStats.score += 100;
            this.playerStats.xp += 50;
        }
        
        // Fuel management
        const fuel_drain = mode === 'fighter' ? 0.15 : 0.20; // Bombers use more fuel
        this.playerStats.fuel = Math.max(0, this.playerStats.fuel - (fuel_drain * deltaTime));
        
        // Update objective
        const targetInfo = `${this.selectedVehicleRole === 'fighter' ? 'Fighter' : 'Bomber'} - Score: ${Math.round(this.playerStats.score)}`;
        document.getElementById('objectiveInfo').textContent = targetInfo;
    }
    
    updateGroundArcadeLogic(deltaTime) {
        // Ground arcade: Capture and hold control points for 5 minutes
        this.controlPoints.forEach((point, index) => {
            // Simulate capture progress
            if (Math.random() > 0.92) {
                point.captureProgress += deltaTime;
                
                // Point captured (5 minutes = 300 seconds simulated as 30 game seconds)
                if (point.captureProgress >= 30) {
                    this.playerStats.score += 2000;
                    this.playerStats.xp += 200;
                    point.captureProgress = 0;
                    point.owned = 'team_a';
                }
            }
        });
        
        // Simulate incoming fire
        if (Math.random() > 0.96) {
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 20);
        }
        
        const capProgress = this.controlPoints.reduce((sum, p) => sum + p.captureProgress, 0);
        const objectiveText = `Capture & Hold - Captured: ${this.controlPoints.filter(p => p.owned === 'team_a').length}/3 | Score: ${Math.round(this.playerStats.score)}`;
        document.getElementById('objectiveInfo').textContent = objectiveText;
    }
    
    updateNavalLogic(deltaTime) {
        // Naval: Ship combat with objective points
        // Similar to ground but with water mechanics
        
        // Simulate naval engagements
        if (Math.random() > 0.93) {
            this.playerStats.score += 150;
            this.playerStats.xp += 75;
        }
        
        // Simulate incoming fire
        if (Math.random() > 0.95) {
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 25);
        }
        
        const navalText = `Naval Battle - Engaging enemies | Score: ${Math.round(this.playerStats.score)}`;
        document.getElementById('objectiveInfo').textContent = navalText;
    }
    
    updateHUD() {
        document.getElementById('hudHealth').textContent = Math.round(this.playerStats.health);
        document.getElementById('hudAmmo').textContent = Math.round(this.playerStats.ammo);
        document.getElementById('hudFuel').textContent = Math.round(this.playerStats.fuel);
        document.getElementById('hudScore').textContent = Math.round(this.playerStats.score);
        document.getElementById('hudXP').textContent = Math.round(this.playerStats.xp);
        document.getElementById('hudLevel').textContent = Math.round(this.playerStats.level);
    }
    
    endGame(reason) {
        this.gameRunning = false;
        // Calculate XP earned
        const xpEarned = Math.round(this.playerStats.score / 10);
        this.playerStats.xp += xpEarned;
        
        // Calculate new level
        const totalXP = this.playerStats.xp;
        this.playerStats.level = Math.floor(totalXP / 1000) + 1;
        
        // Save stats to localStorage
        this.savePlayerStats();
        
        const message = `Game Over: ${reason}\n\nScore: ${Math.round(this.playerStats.score)}\nXP Earned: ${xpEarned}\nTotal XP: ${totalXP}\nLevel: ${this.playerStats.level}`;
        alert(message);
        this.returnToMenu();
    }
    
    savePlayerStats() {
        const stats = {
            totalXP: this.playerStats.xp,
            level: this.playerStats.level,
            totalScore: this.playerStats.score,
            lastGameDate: new Date().toISOString()
        };
        localStorage.setItem(`warThunderStats_${this.selectedCountry}`, JSON.stringify(stats));
    }
    
    loadPlayerStats() {
        const saved = localStorage.getItem(`warThunderStats_${this.selectedCountry}`);
        if (saved) {
            const stats = JSON.parse(saved);
            this.playerStats.xp = stats.totalXP || 0;
            this.playerStats.level = stats.level || 1;
        }
    }
    
    getUnlockedVehicles() {
        const countries = this.getCountriesDatabase();
        const country = countries[this.selectedCountry];
        const level = this.playerStats.level;
        
        let availableVehicles = [];
        
        if (this.selectedGameMode === 'air_arcade') {
            availableVehicles = this.selectedVehicleRole === 'fighter' 
                ? country.aircraft.filter(v => v.tier <= Math.ceil(level / 3))
                : country.aircraft.filter(v => v.tier <= Math.ceil(level / 3) && v.role === 'bomber');
        } else if (this.selectedGameMode === 'ground_arcade') {
            availableVehicles = country.tanks.filter(v => v.tier <= Math.ceil(level / 3));
        } else if (this.selectedGameMode === 'naval') {
            availableVehicles = country.ships.filter(v => v.tier <= Math.ceil(level / 3));
        }
        
        return availableVehicles;
    }
    
    showTechTree() {
        this.gameRunning = false;
        this.uiElements.gameCanvas.style.display = 'none';
        this.uiElements.gameHUD.classList.add('hidden');
        this.uiElements.techTreeScreen.classList.remove('hidden');
        
        const countries = this.getCountriesDatabase();
        const countryName = countries[this.selectedCountry].name;
        document.getElementById('techTreeCountry').textContent = countryName;
        
        this.renderTechTree();
    }
    
    renderTechTree() {
        const countries = this.getCountriesDatabase();
        const country = countries[this.selectedCountry];
        const level = this.playerStats.level;
        
        const content = document.getElementById('techTreeContent');
        content.innerHTML = `
            <div class="tech-tree-section">
                <h3>🎖️ Your Level: ${level}</h3>
                <p>Total XP: ${this.playerStats.xp} / Next Level: ${(level * 1000)} XP</p>
                <div class="progress-bar" style="background: #333; height: 20px; border-radius: 5px; overflow: hidden; margin: 10px 0;">
                    <div style="background: linear-gradient(90deg, #00ff00, #00ff00); height: 100%; width: ${(((this.playerStats.xp % 1000) / 1000) * 100)}%;"></div>
                </div>
            </div>
        `;
        
        // Aircraft tech tree
        const aircraftDiv = document.createElement('div');
        aircraftDiv.className = 'tech-tree-branch';
        aircraftDiv.innerHTML = `<h3>✈️ Aircraft</h3>`;
        country.aircraft.forEach(vehicle => {
            const unlocked = vehicle.tier <= Math.ceil(level / 3);
            const vehicleEl = document.createElement('div');
            vehicleEl.className = `tech-vehicle ${unlocked ? 'unlocked' : 'locked'}`;
            vehicleEl.innerHTML = `
                <div class="tech-vehicle-name">${vehicle.name}</div>
                <div class="tech-vehicle-stats">
                    <span>Speed: ${vehicle.speed}</span>
                    <span>Firepower: ${vehicle.firepower}/10</span>
                    <span>Armor: ${vehicle.armor}/10</span>
                    <span>Role: ${vehicle.role}</span>
                </div>
                ${unlocked ? '<span style="color: #00ff00; font-size: 0.85rem;">✓ UNLOCKED</span>' : '<span style="color: #ff6666; font-size: 0.85rem;">Tier ' + vehicle.tier + ' - Unlock at Level ' + (vehicle.tier * 3) + '</span>'}
            `;
            aircraftDiv.appendChild(vehicleEl);
        });
        content.appendChild(aircraftDiv);
        
        // Tanks tech tree
        const tanksDiv = document.createElement('div');
        tanksDiv.className = 'tech-tree-branch';
        tanksDiv.innerHTML = `<h3>🚚 Tanks</h3>`;
        country.tanks.forEach(vehicle => {
            const unlocked = vehicle.tier <= Math.ceil(level / 3);
            const vehicleEl = document.createElement('div');
            vehicleEl.className = `tech-vehicle ${unlocked ? 'unlocked' : 'locked'}`;
            vehicleEl.innerHTML = `
                <div class="tech-vehicle-name">${vehicle.name}</div>
                <div class="tech-vehicle-stats">
                    <span>Speed: ${vehicle.speed}</span>
                    <span>Firepower: ${vehicle.firepower}/10</span>
                    <span>Armor: ${vehicle.armor}/10</span>
                </div>
                ${unlocked ? '<span style="color: #00ff00; font-size: 0.85rem;">✓ UNLOCKED</span>' : '<span style="color: #ff6666; font-size: 0.85rem;">Tier ' + vehicle.tier + ' - Unlock at Level ' + (vehicle.tier * 3) + '</span>'}
            `;
            tanksDiv.appendChild(vehicleEl);
        });
        content.appendChild(tanksDiv);
        
        // Ships tech tree
        const shipsDiv = document.createElement('div');
        shipsDiv.className = 'tech-tree-branch';
        shipsDiv.innerHTML = `<h3>⚓ Ships</h3>`;
        country.ships.forEach(vehicle => {
            const unlocked = vehicle.tier <= Math.ceil(level / 3);
            const vehicleEl = document.createElement('div');
            vehicleEl.className = `tech-vehicle ${unlocked ? 'unlocked' : 'locked'}`;
            vehicleEl.innerHTML = `
                <div class="tech-vehicle-name">${vehicle.name}</div>
                <div class="tech-vehicle-stats">
                    <span>Speed: ${vehicle.speed}</span>
                    <span>Firepower: ${vehicle.firepower}/10</span>
                    <span>Armor: ${vehicle.armor}/10</span>
                </div>
                ${unlocked ? '<span style="color: #00ff00; font-size: 0.85rem;">✓ UNLOCKED</span>' : '<span style="color: #ff6666; font-size: 0.85rem;">Tier ' + vehicle.tier + ' - Unlock at Level ' + (vehicle.tier * 3) + '</span>'}
            `;
            shipsDiv.appendChild(vehicleEl);
        });
        content.appendChild(shipsDiv);
    }
    
    quitCurrentGame() {
        this.gameRunning = false;
        if (this.renderer && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.returnToMenu();
    }
    
    returnToMenu() {
        // Clean up
        this.gameRunning = false;
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        
        // Reset UI
        this.uiElements.gameCanvas.style.display = 'none';
        this.uiElements.gameHUD.classList.add('hidden');
        this.goToCountrySelection();
        
        // Return to main menu
        if (window.menuSystem) {
            document.getElementById('mainMenu').classList.remove('hidden');
            document.getElementById('sparxPage').classList.remove('hidden');
            document.getElementById('gameContainer').classList.add('hidden');
        }
    }
}

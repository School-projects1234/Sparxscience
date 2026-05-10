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
        
        // Terrain and effects
        this.terrainTiles = [];
        this.tileSize = 600;
        this.terrainRadius = 2;
        this.smokeEffects = [];
        this.smokeCooldown = 0;
        
        // Vehicle and upgrade systems
        this.playerVehicle = null;
        this.bots = [];
        this.botCount = 4;
        this.selectedShellType = 'AP';
        this.availableShells = ['AP', 'HE', 'Smoke'];
        this.upgrades = {
            engine: 1,
            armor: 1,
            turret: 1
        };
        this.shellInventory = {
            AP: { name: 'Armor Piercing', damage: 30, unlockLevel: 1, description: 'High penetration for armored targets.' },
            HE: { name: 'High Explosive', damage: 40, unlockLevel: 4, description: 'Blast damage for soft targets and structures.' },
            Smoke: { name: 'Smoke Bomb', damage: 0, unlockLevel: 2, description: 'Deploys a smoke screen to hide your vehicle.' }
        };
        
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
                    { name: 'B-17 Flying Fortress', tier: 3, role: 'bomber', speed: 280, firepower: 6, armor: 9 },
                    { name: 'F6F Hellcat', tier: 2, role: 'fighter', speed: 420, firepower: 8, armor: 7 },
                    { name: 'A-20 Havoc', tier: 3, role: 'attack', speed: 330, firepower: 7, armor: 8 }
                ],
                tanks: [
                    { name: 'M24 Chaffee', tier: 1, role: 'light', speed: 55, firepower: 6, armor: 5 },
                    { name: 'M10 Wolverine', tier: 1, role: 'tank_destroyer', speed: 48, firepower: 8, armor: 5 },
                    { name: 'M26 Pershing', tier: 2, role: 'heavy', speed: 37, firepower: 9, armor: 8 },
                    { name: 'M18 Hellcat', tier: 2, role: 'tank_destroyer', speed: 60, firepower: 8, armor: 5 },
                    { name: 'M48 Patton', tier: 3, role: 'heavy', speed: 50, firepower: 9, armor: 8 },
                    { name: 'M551 Sheridan', tier: 3, role: 'sniper', speed: 62, firepower: 8, armor: 5 }
                ],
                ships: [
                    { name: 'Fletcher-class Destroyer', tier: 1, role: 'destroyer', speed: 36, firepower: 8, armor: 6 },
                    { name: 'Baltimore-class Cruiser', tier: 2, role: 'cruiser', speed: 32, firepower: 9, armor: 8 },
                    { name: 'Iowa-class Battleship', tier: 3, role: 'battleship', speed: 33, firepower: 10, armor: 9 },
                    { name: 'Essex-class Carrier', tier: 3, role: 'carrier', speed: 33, firepower: 7, armor: 8 }
                ]
            },
            germany: {
                name: 'Germany',
                icon: '🇩🇪',
                color: 0xFFCC00,
                aircraft: [
                    { name: 'Bf 109', tier: 1, role: 'fighter', speed: 450, firepower: 8, armor: 5 },
                    { name: 'Fw 190', tier: 2, role: 'fighter', speed: 440, firepower: 9, armor: 7 },
                    { name: 'He 111', tier: 3, role: 'bomber', speed: 300, firepower: 5, armor: 8 },
                    { name: 'Ju 87 Stuka', tier: 2, role: 'attack', speed: 330, firepower: 7, armor: 7 },
                    { name: 'Do 217', tier: 3, role: 'bomber', speed: 320, firepower: 7, armor: 8 }
                ],
                tanks: [
                    { name: 'Panzer IV', tier: 1, role: 'medium', speed: 40, firepower: 7, armor: 7 },
                    { name: 'Panther', tier: 2, role: 'heavy', speed: 46, firepower: 9, armor: 8 },
                    { name: 'Tiger II', tier: 3, role: 'heavy', speed: 38, firepower: 10, armor: 9 },
                    { name: 'Jagdpanther', tier: 2, role: 'tank_destroyer', speed: 42, firepower: 10, armor: 7 },
                    { name: 'Flakpanzer', tier: 2, role: 'aa', speed: 40, firepower: 8, armor: 6 },
                    { name: 'Sturer Emil', tier: 3, role: 'sniper', speed: 32, firepower: 10, armor: 7 }
                ],
                ships: [
                    { name: 'Z-class Destroyer', tier: 1, role: 'destroyer', speed: 36, firepower: 8, armor: 6 },
                    { name: 'Admiral Hipper-class Cruiser', tier: 2, role: 'cruiser', speed: 32, firepower: 9, armor: 8 },
                    { name: 'Bismarck-class Battleship', tier: 3, role: 'battleship', speed: 30, firepower: 10, armor: 10 },
                    { name: 'Graf Zeppelin', tier: 3, role: 'carrier', speed: 32, firepower: 7, armor: 8 }
                ]
            },
            ussr: {
                name: 'Soviet Union',
                icon: '🇷🇺',
                color: 0xCC0000,
                aircraft: [
                    { name: 'Yak-1', tier: 1, role: 'fighter', speed: 400, firepower: 7, armor: 6 },
                    { name: 'La-7', tier: 2, role: 'fighter', speed: 430, firepower: 8, armor: 7 },
                    { name: 'Ilyushin IL-2', tier: 3, role: 'bomber', speed: 280, firepower: 7, armor: 9 },
                    { name: 'Su-6', tier: 2, role: 'attack', speed: 340, firepower: 8, armor: 8 },
                    { name: 'Pe-8', tier: 3, role: 'bomber', speed: 300, firepower: 7, armor: 9 }
                ],
                tanks: [
                    { name: 'T-34', tier: 1, role: 'light', speed: 55, firepower: 8, armor: 7 },
                    { name: 'SU-152', tier: 2, role: 'tank_destroyer', speed: 42, firepower: 10, armor: 7 },
                    { name: 'T-44', tier: 2, role: 'medium', speed: 50, firepower: 8, armor: 8 },
                    { name: 'IS-2', tier: 3, role: 'heavy', speed: 37, firepower: 10, armor: 9 },
                    { name: 'ZSU-37', tier: 2, role: 'aa', speed: 40, firepower: 8, armor: 6 }
                ],
                ships: [
                    { name: 'Gnevny-class Destroyer', tier: 1, role: 'destroyer', speed: 36, firepower: 7, armor: 6 },
                    { name: 'Maxim Gorky-class Cruiser', tier: 2, role: 'cruiser', speed: 32, firepower: 8, armor: 8 },
                    { name: 'Sovetskiy Soyuz-class Battleship', tier: 3, role: 'battleship', speed: 33, firepower: 10, armor: 9 },
                    { name: 'Kiev-class Carrier', tier: 3, role: 'carrier', speed: 32, firepower: 7, armor: 8 }
                ]
            },
            japan: {
                name: 'Japan',
                icon: '🇯🇵',
                color: 0xFF0000,
                aircraft: [
                    { name: 'Zero', tier: 1, role: 'fighter', speed: 380, firepower: 6, armor: 5 },
                    { name: 'Ki-84 Hayate', tier: 2, role: 'fighter', speed: 420, firepower: 7, armor: 6 },
                    { name: 'B5N "Kate"', tier: 3, role: 'bomber', speed: 240, firepower: 5, armor: 7 },
                    { name: 'A6M2', tier: 1, role: 'fighter', speed: 390, firepower: 6, armor: 5 },
                    { name: 'G4M Betty', tier: 3, role: 'bomber', speed: 290, firepower: 6, armor: 7 }
                ],
                tanks: [
                    { name: 'Type 97', tier: 1, role: 'light', speed: 38, firepower: 6, armor: 5 },
                    { name: 'Type 75', tier: 2, role: 'aa', speed: 45, firepower: 7, armor: 6 },
                    { name: 'Type 10', tier: 3, role: 'heavy', speed: 60, firepower: 9, armor: 8 },
                    { name: 'Chi-Ha', tier: 1, role: 'tank_destroyer', speed: 35, firepower: 7, armor: 5 },
                    { name: 'Type 3 Chi-Nu', tier: 2, role: 'sniper', speed: 36, firepower: 8, armor: 6 }
                ],
                ships: [
                    { name: 'Fubuki-class Destroyer', tier: 1, role: 'destroyer', speed: 35, firepower: 8, armor: 6 },
                    { name: 'Mogami-class Cruiser', tier: 2, role: 'cruiser', speed: 34, firepower: 9, armor: 7 },
                    { name: 'Yamato-class Battleship', tier: 3, role: 'battleship', speed: 27, firepower: 10, armor: 10 },
                    { name: 'Akagi-class Carrier', tier: 3, role: 'carrier', speed: 28, firepower: 8, armor: 8 }
                ]
            },
            uk: {
                name: 'United Kingdom',
                icon: '🇬🇧',
                color: 0x003DA5,
                aircraft: [
                    { name: 'Spitfire MK V', tier: 1, role: 'fighter', speed: 460, firepower: 7, armor: 5 },
                    { name: 'Spitfire MK XIV', tier: 2, role: 'fighter', speed: 470, firepower: 8, armor: 6 },
                    { name: 'Avro Lancaster', tier: 3, role: 'bomber', speed: 280, firepower: 5, armor: 8 },
                    { name: 'Mosquito', tier: 2, role: 'attack', speed: 410, firepower: 7, armor: 6 },
                    { name: 'Seafire', tier: 1, role: 'fighter', speed: 450, firepower: 7, armor: 5 }
                ],
                tanks: [
                    { name: 'Cromwell', tier: 1, role: 'light', speed: 64, firepower: 7, armor: 6 },
                    { name: 'Archer', tier: 2, role: 'tank_destroyer', speed: 40, firepower: 9, armor: 5 },
                    { name: 'Challenger 2', tier: 2, role: 'heavy', speed: 56, firepower: 9, armor: 8 },
                    { name: 'FV 4005', tier: 3, role: 'sniper', speed: 30, firepower: 10, armor: 7 },
                    { name: 'Chieftain', tier: 3, role: 'heavy', speed: 48, firepower: 9, armor: 9 }
                ],
                ships: [
                    { name: 'Daring-class Destroyer', tier: 1, role: 'destroyer', speed: 34, firepower: 8, armor: 6 },
                    { name: 'Town-class Cruiser', tier: 2, role: 'cruiser', speed: 32, firepower: 8, armor: 7 },
                    { name: 'King George V-class Battleship', tier: 3, role: 'battleship', speed: 28, firepower: 10, armor: 9 },
                    { name: 'Illustrious-class Carrier', tier: 3, role: 'carrier', speed: 30, firepower: 7, armor: 8 }
                ]
            }
        };
    }

    getShellsDatabase() {
        return this.shellInventory;
    }

    getUnlockedShells() {
        const level = this.playerStats.level;
        return Object.entries(this.shellInventory)
            .filter(([, shell]) => level >= shell.unlockLevel)
            .map(([id, shell]) => ({ id, ...shell }));
    }

    getUpgradeCost(part) {
        return 200 * this.upgrades[part];
    }

    upgradePart(part) {
        const cost = this.getUpgradeCost(part);
        if (this.playerStats.xp < cost) return false;
        this.playerStats.xp -= cost;
        this.upgrades[part] = Math.min(5, this.upgrades[part] + 1);
        this.updateHUD();
        return true;
    }

    switchShell(type) {
        if (!this.shellInventory[type]) return;
        if (this.playerStats.level < this.shellInventory[type].unlockLevel) return;
        this.selectedShellType = type;
        document.getElementById('objectiveInfo').textContent = `Shell: ${this.shellInventory[type].name} | Role: ${this.selectedVehicleRole}`;
    }

    deploySmokeBomb() {
        if (this.smokeCooldown > 0 || this.playerStats.level < this.shellInventory.Smoke.unlockLevel) return;
        this.smokeCooldown = 5;
        for (let i = 0; i < 25; i++) {
            this.smokeEffects.push({
                x: this.camera.position.x + (Math.random() - 0.5) * 20,
                y: 3 + Math.random() * 4,
                z: this.camera.position.z + (Math.random() - 0.5) * 20,
                life: 2 + Math.random() * 2,
                size: 5 + Math.random() * 6
            });
        }
    }

    updateSmokeEffects(deltaTime) {
        this.smokeEffects = this.smokeEffects.filter(effect => {
            effect.life -= deltaTime;
            if (effect.life <= 0) {
                if (effect.mesh && effect.mesh.parent) {
                    effect.mesh.parent.remove(effect.mesh);
                }
                return false;
            }
            if (!effect.mesh) {
                const geometry = new THREE.SphereGeometry(effect.size, 8, 8);
                const material = new THREE.MeshStandardMaterial({ color: 0x555555, transparent: true, opacity: 0.5, depthWrite: false });
                effect.mesh = new THREE.Mesh(geometry, material);
                effect.mesh.position.set(effect.x, effect.y, effect.z);
                effect.mesh.receiveShadow = false;
                effect.mesh.castShadow = false;
                this.scene.add(effect.mesh);
            }
            effect.mesh.position.y += deltaTime * 0.3;
            effect.mesh.material.opacity = Math.max(0, effect.life / 2) * 0.5;
            return true;
        });
    }

    createInfiniteTerrain() {
        this.terrainTiles = [];
        const range = this.terrainRadius;
        for (let tx = -range; tx <= range; tx++) {
            for (let tz = -range; tz <= range; tz++) {
                this.addTerrainTile(tx, tz);
            }
        }
    }

    addTerrainTile(tileX, tileZ) {
        const geometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize, 64, 64);
        geometry.rotateX(-Math.PI / 2);
        for (let i = 0; i < geometry.attributes.position.count; i++) {
            const x = geometry.attributes.position.getX(i) + tileX * this.tileSize;
            const z = geometry.attributes.position.getZ(i) + tileZ * this.tileSize;
            const height = this.generateTerrainHeight(x, z);
            geometry.attributes.position.setY(i, height);
        }
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            map: this.generateTerrainTexture(),
            roughness: 0.9,
            metalness: 0.1,
            side: THREE.DoubleSide
        });
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(tileX * this.tileSize, 0, tileZ * this.tileSize);
        tile.receiveShadow = true;
        tile.userData = { tileX, tileZ };
        this.scene.add(tile);
        this.terrainTiles.push(tile);
    }

    generateTerrainHeight(x, z) {
        const noise = Math.sin(x * 0.003) * 8 + Math.cos(z * 0.003) * 10;
        const ripple = Math.sin((x + z) * 0.01) * 3;
        const drift = (Math.random() * 2 - 1) * 0.6;
        return Math.max(0, noise + ripple + drift);
    }

    updateTerrainTiles() {
        if (!this.camera) return;
        const camTileX = Math.floor(this.camera.position.x / this.tileSize);
        const camTileZ = Math.floor(this.camera.position.z / this.tileSize);
        const range = this.terrainRadius;

        this.terrainTiles.forEach(tile => {
            const tx = tile.userData.tileX;
            const tz = tile.userData.tileZ;
            if (Math.abs(tx - camTileX) > range || Math.abs(tz - camTileZ) > range) {
                const newTileX = camTileX + (tx < camTileX ? range : -range);
                const newTileZ = camTileZ + (tz < camTileZ ? range : -range);
                tile.position.set(newTileX * this.tileSize, 0, newTileZ * this.tileSize);
                tile.userData.tileX = newTileX;
                tile.userData.tileZ = newTileZ;
            }
        });
    }

    generateTerrainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#6a8a4f');
        gradient.addColorStop(0.5, '#4a6a38');
        gradient.addColorStop(1, '#3f5a2d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 4 + 1;
            ctx.fillStyle = `rgba(${Math.floor(80 + Math.random() * 40)}, ${Math.floor(110 + Math.random() * 60)}, ${Math.floor(50 + Math.random() * 30)}, ${Math.random() * 0.35})`;
            ctx.fillRect(x, y, size, size);
        }

        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = `rgba(60, 90, 40, ${Math.random() * 0.3 + 0.1})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 40, 10 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        return texture;
    }

    generateWaterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#2c5f8c');
        gradient.addColorStop(1, '#142f56');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        return texture;
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
                        <button id="openTechTreeButton" class="btn-secondary">Tech Tree</button>
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
        document.getElementById('openTechTreeButton').addEventListener('click', () => this.showTechTree());
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
                { id: 'bomber', name: 'Bomber Pilot', icon: '💣', desc: 'Bomb ground targets' },
                { id: 'attack', name: 'Attack Pilot', icon: '🔥', desc: 'Strike vehicles and ground targets' },
                { id: 'recon', name: 'Recon Pilot', icon: '🛰️', desc: 'Spot enemies and support allies' }
            ];
        } else if (this.selectedGameMode === 'ground_arcade') {
            roles = [
                { id: 'tank', name: 'Tank Commander', icon: '🚚', desc: 'All tank classes and upgrades' },
                { id: 'heavy', name: 'Heavy Tank', icon: '🔰', desc: 'Armored front-line firepower' },
                { id: 'light', name: 'Light Tank', icon: '⚡', desc: 'Fast scouting and flanking' },
                { id: 'tank_destroyer', name: 'Tank Destroyer', icon: '🎯', desc: 'Long-range anti-armor strikes' },
                { id: 'aa', name: 'AA Tank', icon: '🎇', desc: 'Protect against aircraft threats' },
                { id: 'aaa', name: 'AAA Tank', icon: '🛡️', desc: 'Heavy anti-aircraft defense' },
                { id: 'sniper', name: 'Sniper Tank', icon: '🎯', desc: 'Precision long-range shots' },
                { id: 'stealth', name: 'Stealth Tank', icon: '🕶️', desc: 'Avoid detection and raid positions' }
            ];
        } else if (this.selectedGameMode === 'naval') {
            roles = [
                { id: 'ship', name: 'Naval Captain', icon: '⚓', desc: 'Command every ship class' },
                { id: 'destroyer', name: 'Destroyer', icon: '🛳️', desc: 'Fast escorts and torpedo strikes' },
                { id: 'cruiser', name: 'Cruiser', icon: '🛥️', desc: 'Balanced firepower and speed' },
                { id: 'battleship', name: 'Battleship', icon: '⚓', desc: 'Heavy guns and armor' },
                { id: 'carrier', name: 'Carrier', icon: '🛩️', desc: 'Launch aircraft and support fleets' }
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
        this.loadPlayerStats();
        this.createGameEnvironment();
        this.updateHUD();
        this.switchShell(this.selectedShellType);
        
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
        this.scene.fog.near = 50;
        this.scene.fog.far = 1200;
        this.createInfiniteTerrain();

        // Add scattered hills and rock outcrops for realism
        for (let i = 0; i < 16; i++) {
            const hillGeometry = new THREE.ConeGeometry(20 + Math.random() * 25, 12 + Math.random() * 12, 16);
            const hillMaterial = new THREE.MeshStandardMaterial({ color: 0x2e5a2f, roughness: 0.9 });
            const hill = new THREE.Mesh(hillGeometry, hillMaterial);
            hill.position.x = (Math.random() - 0.5) * 1400;
            hill.position.z = (Math.random() - 0.5) * 1400;
            hill.position.y = 0;
            hill.castShadow = true;
            hill.receiveShadow = true;
            this.scene.add(hill);
        }

        if (this.selectedGameMode === 'ground_arcade') {
            this.createControlPoints();
        }
    }
    
    createWaterEnvironment() {
        const waterGeometry = new THREE.PlaneGeometry(2000, 2000);
        const waterMaterial = new THREE.MeshStandardMaterial({
            color: 0x17638f,
            roughness: 0.25,
            metalness: 0.4,
            map: this.generateWaterTexture()
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.receiveShadow = true;
        this.scene.add(water);

        // Add islands for naval gameplay and visual variety
        for (let i = 0; i < 5; i++) {
            const islandGeo = new THREE.CylinderGeometry(30 + Math.random() * 40, 70 + Math.random() * 80, 10, 16);
            const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x4a6f39, roughness: 0.9 });
            const island = new THREE.Mesh(islandGeo, islandMaterial);
            island.rotation.x = -Math.PI / 2;
            island.position.set((Math.random() - 0.5) * 1600, 0.1, (Math.random() - 0.5) * 1600);
            island.castShadow = true;
            this.scene.add(island);
        }
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
            if (e.key === '1') this.switchShell('AP');
            if (e.key === '2') this.switchShell('HE');
            if (e.key === '3') this.switchShell('Smoke');
            if (e.key.toLowerCase() === 'b') this.deploySmokeBomb();
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
        const shell = this.shellInventory[this.selectedShellType];
        if (!shell || this.playerStats.level < shell.unlockLevel) return;

        if (this.selectedShellType === 'Smoke') {
            this.deploySmokeBomb();
            return;
        }

        const ammoCost = this.selectedShellType === 'HE' ? 12 : 10;
        this.playerStats.ammo = Math.max(0, this.playerStats.ammo - ammoCost);
        this.playerStats.score += shell.damage * 0.3;
        this.playerStats.xp += shell.damage * 0.2;
        this.updateHUD();
    }
    
    animate() {
        if (!this.gameRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Update game state
        const deltaTime = 1/60;
        this.gameTimer += deltaTime;
        this.updateGameLogic(deltaTime);
        this.updateTerrainTiles();
        this.updateSmokeEffects(deltaTime);
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
        if (this.smokeCooldown > 0) {
            this.smokeCooldown = Math.max(0, this.smokeCooldown - deltaTime);
        }
        
        // Check loss conditions
        if (this.playerStats.fuel === 0) {
            this.endGame('Out of fuel!');
        }
        if (this.playerStats.health <= 0) {
            this.endGame('Your vehicle was destroyed!');
        }
        
        const armorMitigation = 1 - Math.min(0.5, this.upgrades.armor * 0.05);
        const smokeMitigation = this.smokeCooldown > 0 ? 0.5 : 1;
        if (Math.random() > 0.98) {
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 15 * armorMitigation * smokeMitigation);
        }
    }
    
    updateAirArcadeLogic(deltaTime) {
        const mode = this.selectedVehicleRole;
        if (Math.random() > 0.96) {
            this.playerStats.score += 50;
            this.playerStats.xp += mode === 'attack' ? 35 : 25;
        }
        if (Math.random() > 0.94) {
            this.playerStats.score += 100;
            this.playerStats.xp += 50;
        }
        const fuelDrain = mode === 'fighter' ? 0.12 : mode === 'bomber' ? 0.22 : mode === 'attack' ? 0.18 : 0.16;
        this.playerStats.fuel = Math.max(0, this.playerStats.fuel - (fuelDrain * deltaTime));
        const roleNames = { fighter: 'Fighter', bomber: 'Bomber', attack: 'Attack', recon: 'Recon' };
        const targetInfo = `${roleNames[mode] || 'Air'} | Shell: ${this.selectedShellType} | Score: ${Math.round(this.playerStats.score)}`;
        document.getElementById('objectiveInfo').textContent = targetInfo;
    }
    
    updateGroundArcadeLogic(deltaTime) {
        this.controlPoints.forEach((point, index) => {
            if (Math.random() > 0.92) {
                point.captureProgress += deltaTime;
                if (point.captureProgress >= 30) {
                    const scoreBonus = this.selectedVehicleRole === 'tank_destroyer' || this.selectedVehicleRole === 'sniper' ? 2600 : 2000;
                    this.playerStats.score += scoreBonus;
                    this.playerStats.xp += 220;
                    point.captureProgress = 0;
                    point.owned = 'team_a';
                }
            }
        });
        if (Math.random() > 0.96) {
            const stealthFactor = this.selectedVehicleRole === 'stealth' ? 0.45 : 1;
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 20 * stealthFactor);
        }
        const objectiveText = `Ground ${this.selectedVehicleRole ? this.selectedVehicleRole.replace('_', ' ').toUpperCase() : 'Arcade'} | Score: ${Math.round(this.playerStats.score)}`;
        document.getElementById('objectiveInfo').textContent = objectiveText;
    }
    
    updateNavalLogic(deltaTime) {
        if (Math.random() > 0.93) {
            const bonus = this.selectedVehicleRole === 'battleship' ? 200 : this.selectedVehicleRole === 'carrier' ? 170 : 150;
            this.playerStats.score += bonus;
            this.playerStats.xp += this.selectedVehicleRole === 'carrier' ? 90 : 75;
        }
        if (Math.random() > 0.95) {
            const shipArmor = this.selectedVehicleRole === 'battleship' ? 0.7 : 1;
            this.playerStats.health = Math.max(0, this.playerStats.health - Math.random() * 25 * shipArmor);
        }
        const navalText = `${this.selectedVehicleRole ? this.selectedVehicleRole.toUpperCase() : 'Naval'} Battle | Score: ${Math.round(this.playerStats.score)}`;
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
            upgrades: this.upgrades,
            selectedShellType: this.selectedShellType,
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
            this.upgrades = stats.upgrades || this.upgrades;
            this.selectedShellType = stats.selectedShellType || this.selectedShellType;
        }
    }
    
    getUnlockedVehicles() {
        const countries = this.getCountriesDatabase();
        const country = countries[this.selectedCountry];
        const level = this.playerStats.level;
        const role = this.selectedVehicleRole;
        const threshold = Math.ceil(level / 3);

        const matchesRole = (vehicleRole, type) => {
            if (!role || role === 'tank' || role === 'ship') return true;
            if (type === 'aircraft') return vehicleRole === role;
            if (type === 'tanks') return vehicleRole === role;
            if (type === 'ships') return vehicleRole === role;
            return false;
        };

        let availableVehicles = [];
        if (this.selectedGameMode === 'air_arcade') {
            availableVehicles = country.aircraft.filter(v => v.tier <= threshold && matchesRole(v.role, 'aircraft'));
        } else if (this.selectedGameMode === 'ground_arcade') {
            availableVehicles = country.tanks.filter(v => v.tier <= threshold && matchesRole(v.role, 'tanks'));
        } else if (this.selectedGameMode === 'naval') {
            availableVehicles = country.ships.filter(v => v.tier <= threshold && matchesRole(v.role, 'ships'));
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
                    <span>Role: ${vehicle.role || 'Unknown'}</span>
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
                    <span>Role: ${vehicle.role || 'Unknown'}</span>
                </div>
                ${unlocked ? '<span style="color: #00ff00; font-size: 0.85rem;">✓ UNLOCKED</span>' : '<span style="color: #ff6666; font-size: 0.85rem;">Tier ' + vehicle.tier + ' - Unlock at Level ' + (vehicle.tier * 3) + '</span>'}
            `;
            shipsDiv.appendChild(vehicleEl);
        });
        content.appendChild(shipsDiv);

        const shellDiv = document.createElement('div');
        shellDiv.className = 'tech-tree-branch';
        shellDiv.innerHTML = `<h3>💣 Shells & Smoke</h3>`;
        this.getUnlockedShells().forEach(shell => {
            const shellEl = document.createElement('div');
            shellEl.className = 'tech-vehicle unlocked';
            shellEl.innerHTML = `
                <div class="tech-vehicle-name">${shell.name}</div>
                <div class="tech-vehicle-stats">
                    <span>Damage: ${shell.damage}</span>
                    <span>Unlock Level: ${shell.unlockLevel}</span>
                </div>
                <div style="font-size:0.85rem; color:#ddd; margin-top:4px;">${shell.description}</div>
            `;
            shellDiv.appendChild(shellEl);
        });
        content.appendChild(shellDiv);

        const upgradesDiv = document.createElement('div');
        upgradesDiv.className = 'tech-tree-branch';
        upgradesDiv.innerHTML = `<h3>🔧 Upgrades</h3>`;
        ['engine', 'armor', 'turret'].forEach(part => {
            const level = this.upgrades[part];
            const cost = this.getUpgradeCost(part);
            const upgradeEl = document.createElement('div');
            upgradeEl.className = 'tech-vehicle unlocked';
            upgradeEl.innerHTML = `
                <div class="tech-vehicle-name">${part.charAt(0).toUpperCase() + part.slice(1)} Upgrade</div>
                <div class="tech-vehicle-stats">
                    <span>Level: ${level}</span>
                    <span>Next Cost: ${cost} XP</span>
                </div>
                <button class="upgrade-button" data-part="${part}" style="margin-top: 8px;">Upgrade</button>
            `;
            upgradesDiv.appendChild(upgradeEl);
        });
        content.appendChild(upgradesDiv);

        content.querySelectorAll('.upgrade-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const part = e.target.dataset.part;
                if (this.upgradePart(part)) {
                    this.renderTechTree();
                } else {
                    alert('Not enough XP to upgrade ' + part + '.');
                }
            });
        });
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

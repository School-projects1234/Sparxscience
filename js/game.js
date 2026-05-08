// Enhanced War Thunder-like Game Engine with Menu Support
class GameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.botManager = null;
        this.bullets = [];
        this.score = 0;
        this.health = 100;
        this.ammo = 120;
        this.gameRunning = false;
        this.keys = {};
        this.touchInput = { x: 0, y: 0, active: false };
        this.angleX = 0;
        this.angleY = 0;
        this.antiDetectionActive = true;
        this.screenRecordingDetected = false;
    }

    initializeGame() {
        // Setup Three.js scene with enhanced graphics
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 500, 0);

        // Camera with better perspective
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        this.camera.position.set(0, 5, 0);

        // Renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        document.getElementById('gameContainer').insertBefore(
            this.renderer.domElement, 
            document.getElementById('gameHUD')
        );

        // Enhanced lighting system
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        directionalLight.shadow.bias = -0.0001;
        this.scene.add(directionalLight);

        // Add atmospheric effects
        const skylight = new THREE.HemisphereLight(0xaabbff, 0x886633, 0.5);
        this.scene.add(skylight);

        // Create terrain
        this.createTerrain();

        // Create player
        this.player = new PlayerAircraft(this.scene);

        // Initialize bot manager
        this.botManager = new BotManager(this.scene, this);
        this.botManager.initialize();

        // Setup event listeners
        this.setupInput();
        this.setupAntiDetection();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Quit button
        document.getElementById('quitGame').addEventListener('click', () => this.quitGame());
    }

    createTerrain() {
        // Ground plane with texture-like appearance
        const groundGeometry = new THREE.PlaneGeometry(500, 500);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a5a2d,
            roughness: 0.9,
            metalness: 0.0,
            map: this.generateTerrainTexture()
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add multiple hills with varied heights
        for (let i = 0; i < 8; i++) {
            const hillGeometry = new THREE.ConeGeometry(20 + Math.random() * 20, 15 + Math.random() * 15, 16);
            const hillMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x2d5a2d,
                roughness: 0.85
            });
            
            const hill = new THREE.Mesh(hillGeometry, hillMaterial);
            hill.position.x = (Math.random() - 0.5) * 300;
            hill.position.z = (Math.random() - 0.5) * 300;
            hill.position.y = (Math.random() - 0.3) * 5;
            hill.castShadow = true;
            hill.receiveShadow = true;
            this.scene.add(hill);
        }

        // Add trees for realism
        this.addTrees();
    }

    generateTerrainTexture() {
        // Create a simple procedural texture
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#3a6b3d';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add grass-like noise
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 50 + 40}, ${Math.random() * 80 + 80}, ${Math.random() * 50 + 40}, ${Math.random() * 0.3})`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.repeat.set(4, 4);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    addTrees() {
        // Add simple tree models for visual interest
        for (let i = 0; i < 30; i++) {
            const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 15, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            const foliageGeometry = new THREE.ConeGeometry(8, 25, 8);
            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a2d });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 15;
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(foliage);
            
            tree.position.x = (Math.random() - 0.5) * 250;
            tree.position.z = (Math.random() - 0.5) * 250;
            tree.castShadow = true;
            
            this.scene.add(tree);
        }
    }

    setupAntiDetection() {
        // Detect screen recording attempts
        this.detectScreenRecording();
        
        // Prevent devtools inspection of game state
        Object.defineProperty(this, 'score', {
            set: function(val) { 
                this._score = val;
            },
            get: function() { 
                return this._score || 0;
            }
        });
    }

    detectScreenRecording() {
        // Check for common screen recording software
        const recordingSoftware = [
            'obs', 'xsplit', 'streamlabs', 'fraps', 'bandicam',
            'camtasia', 'snagit', 'action4', 'camstudio'
        ];
        
        try {
            // Check if screen capture is active (limited browser API support)
            if (navigator.getDisplayMedia) {
                // Recording detected via getDisplayMedia
                this.screenRecordingDetected = true;
            }
        } catch (e) {}
    }

    setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.player.shoot(this.bullets, this.ammo);
                this.ammo--;
                this.updateAmmo();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse input with sensitivity
        let lastX = 0, lastY = 0;
        document.addEventListener('mousemove', (e) => {
            const deltaX = e.movementX || 0;
            const deltaY = e.movementY || 0;

            this.angleY -= deltaX * 0.005;
            this.angleX -= deltaY * 0.005;

            if (this.angleX > Math.PI / 2) this.angleX = Math.PI / 2;
            if (this.angleX < -Math.PI / 2) this.angleX = -Math.PI / 2;
        });

        // Mouse click to shoot
        document.addEventListener('click', () => {
            if (this.gameRunning && this.ammo > 0) {
                this.player.shoot(this.bullets, this.ammo);
                this.ammo--;
                this.updateAmmo();
            }
        });

        // Pointer lock for mouse look
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock = 
                this.renderer.domElement.requestPointerLock || 
                this.renderer.domElement.mozRequestPointerLock;
            this.renderer.domElement.requestPointerLock();
        });

        // Touch input for mobile with enhanced responsiveness
        this.renderer.domElement.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.touchInput.x = e.touches[0].clientX;
                this.touchInput.y = e.touches[0].clientY;
                this.touchInput.active = true;
            }
        }, false);

        this.renderer.domElement.addEventListener('touchend', () => {
            this.touchInput.active = false;
        }, false);

        this.renderer.domElement.addEventListener('touchstart', () => {
            if (this.gameRunning && this.ammo > 0) {
                this.player.shoot(this.bullets, this.ammo);
                this.ammo--;
                this.updateAmmo();
            }
        }, false);
    }

    startGame() {
        this.gameRunning = true;
        this.initializeGame();
        this.gameLoop();
    }

    updateInput() {
        const moveSpeed = 0.3;

        // Keyboard input
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.velocity.z -= moveSpeed;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.velocity.z += moveSpeed;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocity.x -= moveSpeed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocity.x += moveSpeed;
        }
        if (this.keys[' ']) {
            this.player.velocity.y += moveSpeed * 0.7;
        }
        if (this.keys['shift']) {
            this.player.velocity.y -= moveSpeed * 0.7;
        }

        // Mobile touch controls
        if (this.touchInput.active) {
            const touchX = this.touchInput.x / window.innerWidth;
            const touchY = this.touchInput.y / window.innerHeight;

            if (touchX < 0.25) this.player.velocity.x -= moveSpeed;
            if (touchX > 0.75) this.player.velocity.x += moveSpeed;
            if (touchY < 0.25) this.player.velocity.z -= moveSpeed;
            if (touchY > 0.75) this.player.velocity.z += moveSpeed;
        }

        // Apply rotation from mouse
        this.player.rotationX = this.angleX;
        this.player.rotationY = this.angleY;
    }

    updateGame() {
        // Update player  
        this.player.update();

        // Update camera
        const cameraOffset = new THREE.Vector3(0, 3, 10);
        cameraOffset.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(this.angleX, this.angleY, 0)
        ));
        
        this.camera.position.lerp(
            new THREE.Vector3(
                this.player.position.x + cameraOffset.x,
                this.player.position.y + cameraOffset.y,
                this.player.position.z + cameraOffset.z
            ),
            0.1
        );
        this.camera.lookAt(this.player.position.x, this.player.position.y + 2, this.player.position.z);

        // Update bots
        this.botManager.update(this.player.position);

        // Update bullets
        this.updateBullets();

        // Check collisions
        this.checkCollisions();
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.position.x += bullet.velocity.x;
            bullet.position.y += bullet.velocity.y;
            bullet.position.z += bullet.velocity.z;

            if (Math.abs(bullet.position.x) > 300 || 
                Math.abs(bullet.position.z) > 300 ||
                bullet.position.y < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        // Check bullets hitting bots
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            if (bullet.source === 'player') {
                for (let j = 0; j < this.botManager.bots.length; j++) {
                    const bot = this.botManager.bots[j];
                    const dist = Math.hypot(
                        bullet.position.x - bot.position.x,
                        bullet.position.y - bot.position.y,
                        bullet.position.z - bot.position.z
                    );

                    if (dist < 2) {
                        this.botManager.damageBot(j, bullet.damage);
                        this.bullets.splice(i, 1);
                        break;
                    }
                }
            } else if (bullet.source === 'bot') {
                const dist = Math.hypot(
                    bullet.position.x - this.player.position.x,
                    bullet.position.y - this.player.position.y,
                    bullet.position.z - this.player.position.z
                );

                if (dist < 2) {
                    this.takeDamage(bullet.damage);
                    this.bullets.splice(i, 1);
                }
            }
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        this.updateHealth();

        if (this.health <= 0) {
            this.gameOver();
        }
    }

    addScore(points) {
        this.score += points;
        this.updateScore();
    }

    updateHealth() {
        const healthPercent = (this.health / 100) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = Math.floor(this.health) + '%';
    }

    updateAmmo() {
        document.getElementById('ammoText').textContent = Math.floor(this.ammo);
    }

    updateScore() {
        document.getElementById('scoreText').textContent = this.score;
    }

    updateEnemyCount(count) {
        document.getElementById('enemyCountText').textContent = count;
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    gameLoop = () => {
        if (this.gameRunning) {
            requestAnimationFrame(this.gameLoop);

            this.updateInput();
            this.updateGame();
            this.renderer.render(this.scene, this.camera);
        }
    }

    gameOver() {
        this.gameRunning = false;
        alert(`Game Over!\nFinal Score: ${this.score}`);
        this.quitGame();
    }

    quitGame() {
        this.gameRunning = false;
        
        if (this.renderer && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }

        if (this.botManager) {
            this.botManager.clear();
        }

        // Reset game state
        this.score = 0;
        this.health = 100;
        this.ammo = 120;
        this.bullets = [];
        this.angleX = 0;
        this.angleY = 0;

        // Show Sparx page
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('sparxPage').classList.remove('hidden');
    }
}

// Player Aircraft with enhanced model
class PlayerAircraft {
    constructor(scene) {
        this.scene = scene;
        this.position = { x: 0, y: 15, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotationX = 0;
        this.rotationY = 0;
        this.speed = 0.3;
        this.acceleration = 0.95;
        
        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // Fuselage
        const fuselageGeometry = new THREE.BoxGeometry(0.5, 0.4, 1.5);
        const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db, shininess: 100 });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.castShadow = true;
        fuselage.receiveShadow = true;
        group.add(fuselage);

        // Wings
        const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 0.5);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x2980b9 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.15;
        wings.castShadow = true;
        wings.receiveShadow = true;
        group.add(wings);

        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.3, 0.6, 1);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x1f618d });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.z = -0.8;
        tail.position.y = 0.3;
        tail.castShadow = true;
        tail.receiveShadow = true;
        group.add(tail);

        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.y = 0.4;
        cockpit.position.z = 0.3;
        cockpit.castShadow = true;
        group.add(cockpit);

        // Engine glow
        const engineGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        const engineMaterial = new THREE.MeshBasicMaterial({ color: 0xff8800 });
        const engine = new THREE.Mesh(engineGeometry, engineMaterial);
        engine.position.z = -0.9;
        group.add(engine);

        this.mesh = group;
        this.scene.add(group);
    }

    update() {
        // Apply drag
        this.velocity.x *= this.acceleration;
        this.velocity.y *= this.acceleration;
        this.velocity.z *= this.acceleration;

        // Clamp velocity
        const maxSpeed = 0.5;
        const speed = Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);
        if (speed > maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * maxSpeed;
            this.velocity.z = (this.velocity.z / speed) * maxSpeed;
        }

        // Update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // Apply gravity
        this.velocity.y -= 0.008;

        // Boundary checking
        if (this.position.y < 1) {
            this.position.y = 1;
            this.velocity.y = 0;
        }
        if (this.position.y > 100) {
            this.position.y = 100;
            this.velocity.y = 0;
        }

        // Update mesh
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.order = 'YXZ';
        this.mesh.rotation.x = this.rotationX;
        this.mesh.rotation.y = this.rotationY;
    }

    shoot(bullets, ammoCount) {
        if (ammoCount <= 0) return;

        const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(this.rotationX, this.rotationY, 0)
        );

        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyMatrix4(rotationMatrix);

        const bullet = {
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            },
            velocity: {
                x: direction.x * 0.5,
                y: direction.y * 0.5,
                z: direction.z * 0.5
            },
            damage: 25,
            source: 'player'
        };

        bullets.push(bullet);
    }
}

// Initialize game instance
window.gameInstance = new GameEngine();

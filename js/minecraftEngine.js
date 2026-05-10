// Minecraft Game Engine (Individual/Standalone)
class MinecraftGameEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gameRunning = false;
        this.blocks = [];
        this.selectedBlock = 'dirt';
        this.inventory = { dirt: 64, stone: 32, wood: 16, sand: 8 };
        this.playerPosition = { x: 0, y: 0, z: 0 };
        this.gameTimer = 0;
        this.keys = {};
        
        this.initGame();
    }
    
    initGame() {
        const container = document.getElementById('gameContainer');
        container.innerHTML = `
            <div id="minecraftUI" style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
                <canvas id="minecraftCanvas"></canvas>
                <div id="minecraftHUD" class="minecraft-hud">
                    <div class="minecraft-inventory">
                        <h3>Inventory</h3>
                        <div id="inventoryDisplay" class="inventory-slots"></div>
                    </div>
                    <div class="minecraft-controls">
                        <p>WASD: Move | Space: Jump | Click: Break/Build | Shift: Sneak</p>
                        <button id="quitMinecraft" class="btn-secondary">Quit</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 300, 50);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.getElementById('minecraftCanvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Create terrain
        this.createTerrain();
        
        // Setup input
        this.setupInput();
        
        // Update inventory display
        this.updateInventoryDisplay();
        
        // Setup quit button
        document.getElementById('quitMinecraft').addEventListener('click', () => this.quit());
        
        // Start game loop
        this.gameRunning = true;
        this.animate();
    }
    
    createTerrain() {
        // Create a simple blocky terrain
        const blockSize = 2;
        const terrainWidth = 20;
        const terrainDepth = 20;
        const terrainHeight = 5;
        
        const blockMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8 });
        
        for (let x = 0; x < terrainWidth; x++) {
            for (let z = 0; z < terrainDepth; z++) {
                const height = Math.floor(Math.random() * terrainHeight) + 1;
                
                for (let y = 0; y < height; y++) {
                    const geometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
                    
                    // Alternate colors for terrain
                    let color = 0x8B7355; // dirt
                    if (y === height - 1) color = 0x228B22; // grass on top
                    else if (y > height - 3) color = 0x8B6914; // dirt
                    else color = 0x696969; // stone
                    
                    const material = blockMaterial.clone();
                    material.color.setHex(color);
                    
                    const block = new THREE.Mesh(geometry, material);
                    block.position.set((x - terrainWidth/2) * blockSize, y * blockSize, (z - terrainDepth/2) * blockSize);
                    block.castShadow = true;
                    block.receiveShadow = true;
                    
                    this.scene.add(block);
                    this.blocks.push(block);
                }
            }
        }
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.addEventListener('click', () => {
            // Click action - would break/place blocks in real game
            this.performBlockAction();
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    performBlockAction() {
        // Simple block breaking/placing simulation
        if (this.inventory[this.selectedBlock] > 0) {
            this.inventory[this.selectedBlock]--;
            this.updateInventoryDisplay();
        }
    }
    
    updateInventoryDisplay() {
        const display = document.getElementById('inventoryDisplay');
        display.innerHTML = '';
        
        for (const [block, count] of Object.entries(this.inventory)) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            if (block === this.selectedBlock) slot.classList.add('selected');
            
            const icon = block === 'dirt' ? '🟫' : 
                         block === 'stone' ? '⬛' :
                         block === 'wood' ? '🟪' : '🟨';
            
            slot.innerHTML = `<span>${icon}</span><span>${count}</span>`;
            slot.addEventListener('click', () => this.selectedBlock = block);
            display.appendChild(slot);
        }
    }
    
    animate() {
        if (!this.gameRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.gameTimer += 1/60;
        this.updateGameLogic();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateGameLogic() {
        const moveSpeed = 0.5;
        
        if (this.keys['w']) this.camera.position.z -= moveSpeed;
        if (this.keys['s']) this.camera.position.z += moveSpeed;
        if (this.keys['a']) this.camera.position.x -= moveSpeed;
        if (this.keys['d']) this.camera.position.x += moveSpeed;
        if (this.keys[' ']) this.camera.position.y += moveSpeed * 0.5;
        if (this.keys['shift']) this.camera.position.y -= moveSpeed * 0.5;
    }
    
    quit() {
        this.gameRunning = false;
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Return to menu
        if (window.menuSystem) {
            document.getElementById('gameContainer').innerHTML = '';
            document.getElementById('gameContainer').classList.add('hidden');
            document.getElementById('mainMenu').classList.remove('hidden');
            document.getElementById('sparxPage').classList.remove('hidden');
        }
    }
}

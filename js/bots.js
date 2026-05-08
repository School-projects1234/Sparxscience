// Bot AI System
class Bot {
    constructor(id, x, y, z, scene, gameInstance) {
        this.id = id;
        this.position = { x, y, z };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.health = 100;
        this.maxHealth = 100;
        this.scene = scene;
        this.gameInstance = gameInstance;
        this.speed = 0.01;
        this.angularSpeed = 0.05;
        this.shootCooldown = 0;
        this.pathWaypoints = this.generatePath();
        this.currentWaypoint = 0;
        this.targetPlayer = false;
        this.lastSawPlayer = null;
        this.searchTimer = 0;
        
        this.createMesh();
    }

    createMesh() {
        // Create bot geometry (simple aircraft)
        const group = new THREE.Group();
        
        // Fuselage
        const fuselageGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.2);
        const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        group.add(fuselage);
        
        // Wings
        const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.4);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xff5252 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = 0.1;
        group.add(wings);
        
        // Tail
        const tailGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.8);
        const tailMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.z = -0.6;
        tail.position.y = 0.2;
        group.add(tail);
        
        // Cockpit
        const cockpitGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x333 });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.y = 0.3;
        cockpit.position.z = 0.2;
        group.add(cockpit);
        
        group.position.set(this.position.x, this.position.y, this.position.z);
        group.rotation.order = 'YXZ';
        this.mesh = group;
        this.scene.add(group);
    }

    update(playerPosition) {
        // Check if player is visible
        const distToPlayer = Math.sqrt(
            Math.pow(playerPosition.x - this.position.x, 2) +
            Math.pow(playerPosition.y - this.position.y, 2) +
            Math.pow(playerPosition.z - this.position.z, 2)
        );

        if (distToPlayer < 30) {
            this.targetPlayer = true;
            this.lastSawPlayer = Date.now();
            this.searchTimer = 0;
        } else if (this.lastSawPlayer && Date.now() - this.lastSawPlayer > 5000) {
            this.targetPlayer = false;
            this.searchTimer = 0;
        }

        if (this.targetPlayer) {
            this.chasePlayer(playerPosition);
        } else {
            this.patrolPath();
        }

        // Update physics
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // Apply gravity
        this.velocity.y -= 0.0005;

        // Bound checking
        if (this.position.y < 1) {
            this.position.y = 1;
            this.velocity.y = 0;
        }
        if (this.position.y > 50) {
            this.position.y = 50;
            this.velocity.y = 0;
        }

        // Update mesh
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);

        // Handle shooting cooldown
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Try to shoot if targeting player
        if (this.targetPlayer && this.shootCooldown <= 0 && distToPlayer < 40) {
            this.shoot(playerPosition);
            this.shootCooldown = 30;
        }
    }

    chasePlayer(playerPosition) {
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const dz = playerPosition.z - this.position.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (distance > 0.1) {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed * 0.5;
            this.velocity.z = (dz / distance) * this.speed;

            this.rotation.x = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz));
            this.rotation.y = Math.atan2(dx, dz);
        }
    }

    patrolPath() {
        if (this.currentWaypoint >= this.pathWaypoints.length) {
            this.currentWaypoint = 0;
        }

        const waypoint = this.pathWaypoints[this.currentWaypoint];
        const dx = waypoint.x - this.position.x;
        const dy = waypoint.y - this.position.y;
        const dz = waypoint.z - this.position.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (distance < 2) {
            this.currentWaypoint++;
        } else {
            this.velocity.x = (dx / distance) * this.speed * 0.5;
            this.velocity.y = (dy / distance) * this.speed * 0.3;
            this.velocity.z = (dz / distance) * this.speed * 0.5;

            this.rotation.x = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz)) * 0.5;
            this.rotation.y = Math.atan2(dx, dz);
        }
    }

    generatePath() {
        const waypoints = [];
        for (let i = 0; i < 10; i++) {
            waypoints.push({
                x: (Math.random() - 0.5) * 100,
                y: 10 + Math.random() * 20,
                z: (Math.random() - 0.5) * 100
            });
        }
        return waypoints;
    }

    shoot(targetPosition) {
        // Create projectile
        const projectile = {
            position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            },
            velocity: {
                x: (targetPosition.x - this.position.x) * 0.3,
                y: (targetPosition.y - this.position.y) * 0.3,
                z: (targetPosition.z - this.position.z) * 0.3
            },
            damage: 5,
            source: 'bot'
        };
        
        this.gameInstance.bullets.push(projectile);
    }

    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }

    dispose() {
        this.scene.remove(this.mesh);
    }
}

// Bot Manager
class BotManager {
    constructor(scene, gameInstance) {
        this.bots = [];
        this.scene = scene;
        this.gameInstance = gameInstance;
        this.botCount = 5;
    }

    initialize() {
        for (let i = 0; i < this.botCount; i++) {
            this.spawnBot();
        }
    }

    spawnBot() {
        const x = (Math.random() - 0.5) * 80;
        const y = 10 + Math.random() * 20;
        const z = (Math.random() - 0.5) * 80;
        
        const bot = new Bot(this.bots.length, x, y, z, this.scene, this.gameInstance);
        this.bots.push(bot);
    }

    update(playerPosition) {
        for (let i = this.bots.length - 1; i >= 0; i--) {
            this.bots[i].update(playerPosition);
            
            // Remove dead bots
            if (this.bots[i].health <= 0) {
                this.bots[i].dispose();
                this.bots.splice(i, 1);
            }
        }

        // Respawn bots if all are dead
        if (this.bots.length === 0) {
            for (let i = 0; i < this.botCount; i++) {
                this.spawnBot();
            }
        }

        this.gameInstance.updateEnemyCount(this.bots.length);
    }

    damageBot(index, damage) {
        if (this.bots[index]) {
            if (this.bots[index].takeDamage(damage)) {
                this.gameInstance.addScore(100);
                this.bots[index].dispose();
                this.bots.splice(index, 1);
            }
        }
    }

    clear() {
        for (let bot of this.bots) {
            bot.dispose();
        }
        this.bots = [];
    }
}

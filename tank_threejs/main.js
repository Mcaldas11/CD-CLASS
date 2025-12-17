import * as THREE from 'three';

let scene, camera, renderer, tank, base, tower, cannonPivot;
let obstacles = [];
const keys = {};

// Variáveis para Drag, Drop e Criação
let selectedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const worldPosition = new THREE.Vector3();
let floorMesh;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 60);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Luzes
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(20, 50, 20);
    light.castShadow = true;
    scene.add(light);

    // Chão
    floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshPhongMaterial({ color: 0x222222 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // --- CONSTRUÇÃO DO TANQUE ---
    createTank();

    
    

    // Eventos
    window.addEventListener('keydown', (e) => keys[e.code] = true);
    window.addEventListener('keyup', (e) => keys[e.code] = false);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', () => selectedObject = null);

    animate();
}

let tankBoxHelper;
function createTank() {
    tank = new THREE.Group();
    
    // Base: BoxGeometry(6, 2, 4)
    base = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 4), new THREE.MeshPhongMaterial({ color: 0x3e5d33 }));
    base.position.y = 1;
    base.castShadow = true;
    tank.add(base);

    // Torre
    tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 16), new THREE.MeshPhongMaterial({ color: 0x2a4322 }));
    tower.position.y = 2.6;
    tank.add(tower);

    // Canhão e Pivot da Mira (W/S)
    cannonPivot = new THREE.Group();
    cannonPivot.position.y = 2.6;
    
    const cannon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 4, 16), 
        new THREE.MeshPhongMaterial({ color: 0x000000 })
    );
    cannon.position.z = -2; // Estende o canhão para a frente
    cannon.rotation.x = -Math.PI / 2;
    
    cannonPivot.add(cannon);
    tank.add(cannonPivot);
    
    tank.position.set(0, 0, 20);
    scene.add(tank);

    // Adiciona BoxHelper para visualizar bounding box do tanque inteiro
    tankBoxHelper = new THREE.BoxHelper(tank, 0xff0000);
    scene.add(tankBoxHelper);
}

// Função para criar Paredes e Cubos
function createWall(x, y, z, w=4, h=4, d=4) {
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMat = new THREE.MeshPhongMaterial({ color: 0x777777 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, y, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    obstacles.push(wall); // Adiciona ao array de colisão
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(obstacles);
    if (intersects.length > 0) {
        selectedObject = intersects[0].object;
    } else {
        const floorIntersects = raycaster.intersectObject(floorMesh);
        if (floorIntersects.length > 0) {
            const p = floorIntersects[0].point;
            createWall(p.x, 2, p.z); // Cria cubo ao clicar no chão
        }
    }
}

function onMouseMove(event) {
    if (!selectedObject) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    if (raycaster.ray.intersectPlane(dragPlane, worldPosition)) {
        selectedObject.position.x = worldPosition.x;
        selectedObject.position.z = worldPosition.z;
    }
}

// Deteção de Colisões por Vértices 
function checkCollisions(nextPos) {
    // Salva posição original
    const originalPosition = tank.position.clone();
    tank.position.copy(nextPos);
    tank.updateMatrixWorld();

    const tankBox = new THREE.Box3().setFromObject(base);

    for (let i = 0; i < obstacles.length; i++) {
        const obsBox = new THREE.Box3().setFromObject(obstacles[i]);
        if (tankBox.intersectsBox(obsBox)) {
            tank.position.copy(originalPosition);
            return true;
        }
    }
    tank.position.copy(originalPosition);
    return false;
}

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.4;
    const rotSpeed = 0.05;
    let nextPos = tank.position.clone();

    // Movimento do Corpo (Setas)
    if (keys['ArrowLeft']) tank.rotation.y += rotSpeed;
    if (keys['ArrowRight']) tank.rotation.y -= rotSpeed;
    if (keys['ArrowUp']) {
        nextPos.x -= Math.sin(tank.rotation.y) * speed;
        nextPos.z -= Math.cos(tank.rotation.y) * speed;
    }
    if (keys['ArrowDown']) {
        nextPos.x += Math.sin(tank.rotation.y) * speed;
        nextPos.z += Math.cos(tank.rotation.y) * speed;
    }

    if (!checkCollisions(nextPos)) {
        tank.position.copy(nextPos);
    }

    // Rotação da Torre (A e D)
    if (keys['KeyA']) tower.rotation.y += rotSpeed;
    if (keys['KeyD']) tower.rotation.y -= rotSpeed;

    // Inclinação do Canhão/Mira (W e S)
    if (keys['KeyW'] && cannonPivot.rotation.x < 0.5) cannonPivot.rotation.x += 0.02;
    if (keys['KeyS'] && cannonPivot.rotation.x > -0.2) cannonPivot.rotation.x -= 0.02;

    if (tankBoxHelper) tankBoxHelper.update();

    renderer.render(scene, camera);
}

init();
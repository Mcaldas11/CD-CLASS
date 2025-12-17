import * as THREE from 'three';

let scene, camera, renderer, tank, base, tower, cannon;
let obstacles = [];
const keys = {};

// Variáveis para Drag and Drop e Criação
let selectedObject = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const worldPosition = new THREE.Vector3();
let floorMesh;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 25, 50);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(20, 40, 20);
    light.castShadow = true;
    scene.add(light);

    // Chão - Importante guardar na variável floorMesh para o clique funcionar
    floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshPhongMaterial({ color: 0x404040 })
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    createTank();
    createObstacle(15, 2, 0); // Obstáculo inicial

    window.addEventListener('keydown', (e) => keys[e.code] = true);
    window.addEventListener('keyup', (e) => keys[e.code] = false);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', () => selectedObject = null);

    animate();
}

function createTank() {
    tank = new THREE.Group();
    
    // Base
    base = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 4), new THREE.MeshPhongMaterial({ color: 0x2e4d23 }));
    base.position.y = 1;
    base.castShadow = true;
    tank.add(base);

    // Torre
    tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.2, 16), new THREE.MeshPhongMaterial({ color: 0x1a3312 }));
    tower.position.y = 2.6;
    tank.add(tower);

    // Canhão (Mira)
    const cannonGeo = new THREE.CylinderGeometry(0.2, 0.2, 4, 16);
    // Pivot para o canhão girar na base da torre
    const cannonPivot = new THREE.Group();
    cannonPivot.position.y = 2.6; 
    
    cannon = new THREE.Mesh(cannonGeo, new THREE.MeshPhongMaterial({ color: 0x000000 }));
    cannon.position.z = -2; // Estende para a frente
    cannon.rotation.x = -Math.PI / 2;
    
    cannonPivot.add(cannon);
    tank.add(cannonPivot);
    
    tank.position.set(0, 0, 20);
    scene.add(tank);
}

function createObstacle(x, y, z) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 4),
        new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    );
    cube.position.set(x, y, z);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);
    obstacles.push(cube);
}

function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    const intersectObstacles = raycaster.intersectObjects(obstacles);
    if (intersectObstacles.length > 0) {
        selectedObject = intersectObstacles[0].object;
    } else {
        const intersectFloor = raycaster.intersectObject(floorMesh);
        if (intersectFloor.length > 0) {
            const p = intersectFloor[0].point;
            createObstacle(p.x, 2, p.z);
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

function checkCollisions(nextPos) {
    const colRaycaster = new THREE.Raycaster();
    const posAttr = base.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const localVertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);
        // Aplica a rotação e posição atual para obter o vértice no mundo
        const globalVertex = localVertex.clone().applyMatrix4(base.matrixWorld);
        const directionVector = globalVertex.clone().sub(tank.position);

        colRaycaster.set(nextPos, directionVector.clone().normalize());
        const intersects = colRaycaster.intersectObjects(obstacles);
        if (intersects.length > 0 && intersects[0].distance < directionVector.length()) return true;
    }
    return false;
}

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.3;
    const rotSpeed = 0.04;
    let nextPos = tank.position.clone();

    // Movimento do Tanque (Setas)
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

    if (!checkCollisions(nextPos)) tank.position.copy(nextPos);

    // Torre (A e D)
    if (keys['KeyA']) tower.rotation.y += rotSpeed;
    if (keys['KeyD']) tower.rotation.y -= rotSpeed;

    // Mira/Canhão (W e S)
    // O canhão é o segundo filho do tank (índice 2), ou usamos a referência direta
    const pivot = tank.children[2]; 
    if (keys['KeyW'] && pivot.rotation.x < 0.5) pivot.rotation.x += 0.02;
    if (keys['KeyS'] && pivot.rotation.x > -0.2) pivot.rotation.x -= 0.02;

    renderer.render(scene, camera);
}

init();
// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let scene, camera, renderer;
let particles = [];
let planets = [];
let lights = [];
let spacecraft = [];
let astronauts = [];
let time = 0;
let mouseX = 0, mouseY = 0;
let cameraPos = { x: 0, y: 30, z: 80 };
let cameraVel = { x: 0, y: 0, z: 0 };
const keysPressed = {};
let matrixActive = false;
let nebulaActive = false;
let radarActive = false;
let laserActive = false;
let followAstronaut = false;
let currentSpacecraft = 0;
let selectedAstronaut = -1;
let selectedObjects = [];
let matrixObjects = [];
let nebulaClouds = [];
let audioContext = null;
let oscillators = [];
let musicActive = false;
let lasers = [];
let raycaster;
let mouse;

// ===== 10 NOVAS FEATURES =====
let asteroidField = [];
let wormholes = [];
let spaceStations = [];
let energyBeams = [];
let forceFields = [];
let satellites = [];
let spaceDust = [];
let timeWarpZones = [];
let asteroidTrail = [];
let soundVisualizerActive = false;

// ===== SISTEMA SOLAR =====
let solarSystem = {
    sun: null,
    planets: [],
    moons: []
};
let solarSystemVisible = true;

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    scene.fog = new THREE.Fog(0x0a0e27, 200, 500);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);

    renderer = new THREE.WebGLRenderer({ antialias: true, precision: 'highp' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    document.body.appendChild(renderer.domElement);

    // Raycaster para seleção
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Criar UI
    createUI();

    // Criar ambiente
    createLights();
    createPlanets();
    createSolarSystem();        // ===== NOVO: Sistema Solar Completo =====
    createSpacecraft();
    createAstronauts();
    createParticleField();
    createRingStructures();
    createFloatingObjects();
    createWaveField();
    createNebulaClouds();
    createPortals();
    createBlackHole();
    createShockwaves();
    
    // ===== 10 NOVAS FEATURES =====
    createAsteroidField();          // 1. Campo de asteroides com física
    createWormholes();              // 2. Buracos de minhoca pulsantes
    createSpaceStations();          // 3. Estações espaciais orbitantes
    createEnergyBeams();            // 4. Feixes de energia entre objetos
    createForceFields();            // 5. Campos de força energéticos
    createSatelliteNetwork();       // 6. Rede de satélites em órbita
    createSpaceDustClouds();        // 7. Nuvens de poeira cósmica interativa
    createTimeWarpZones();          // 8. Zonas de distorção temporal
    createAsteroidTrails();         // 9. Trilhos coloridos para asteroides
    setupSoundVisualizer();         // 10. Visualizador de som com música

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onWindowResize);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    document.getElementById('radarToggle').addEventListener('click', toggleRadar);
    window.addEventListener('click', onMouseClick);

    animate();
}

// ============================================
// UI
// ============================================
function createUI() {
    const infoDiv = document.createElement('div');
    infoDiv.id = 'info';
    infoDiv.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        color: #0ff;
        font-size: 13px;
        text-shadow: 0 0 10px #0ff;
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        border: 2px solid #0ff;
        border-radius: 8px;
        max-width: 450px;
        font-family: monospace;
        line-height: 1.6;
    `;
    infoDiv.innerHTML = `
        <h2 style="margin: 0 0 15px 0; color: #0ff; font-size: 18px; text-align: center;">🌌 ESPAÇO 3D</h2>
        
        <div style="color: #00ff00; margin-bottom: 15px; border-bottom: 1px solid #0ff; padding-bottom: 10px;">
            <strong>MOVIMENTO:</strong> ⬆️⬇️⬅️➡️ (Setas)
        </div>
        
        <div style="color: #ffff00; margin-bottom: 15px; border-bottom: 1px solid #0ff; padding-bottom: 10px;">
            <strong>SELEÇÃO:</strong><br>
            1-6: Naves | 7-9, 0: Astronautas<br>
            Q/E: Mudar entre astronautas | Clica: Selecionar
        </div>
        
        <div style="color: #ff00ff; margin-bottom: 15px; border-bottom: 1px solid #0ff; padding-bottom: 10px;">
            <strong>EFEITOS:</strong><br>
            T: Seguir astronauta | L: Lasers<br>
            M: Matriz verde | N: Nebulosa | Espaço: Reset
        </div>
        
        <div style="color: #00ff88; margin-bottom: 15px; border-bottom: 1px solid #0ff; padding-bottom: 10px;">
            <strong>SISTEMA SOLAR & FEATURES:</strong><br>
            P: Sistema Solar | A: Asteroides | W: Wormholes<br>
            S: Estações | E: Feixes | F: Campos<br>
            U: Satélites | D: Poeira | Z: Distorção | V: Som
        </div>
        
        <div style="color: #88ccff; text-align: center; font-size: 12px;">
            Clica nos botões abaixo →
        </div>
    `;
    document.body.appendChild(infoDiv);

    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicToggle';
    musicBtn.textContent = '🎵';
    musicBtn.title = 'Música';
    musicBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ff0080, #0088ff);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        font-weight: bold;
        transition: all 0.3s;
        box-shadow: 0 0 20px rgba(0, 136, 255, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    document.body.appendChild(musicBtn);

    const radarBtn = document.createElement('button');
    radarBtn.id = 'radarToggle';
    radarBtn.textContent = '📡';
    radarBtn.title = 'Radar';
    radarBtn.style.cssText = `
        position: fixed;
        top: 85px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #00ff88, #00ccff);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        font-weight: bold;
        transition: all 0.3s;
        box-shadow: 0 0 20px rgba(0, 200, 136, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    document.body.appendChild(radarBtn);

    const statsDiv = document.createElement('div');
    statsDiv.id = 'stats';
    statsDiv.style.cssText = `
        position: fixed;
        bottom: 15px;
        left: 15px;
        color: #0f0;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.9);
        padding: 15px;
        border: 2px solid #0f0;
        border-radius: 8px;
        font-family: monospace;
        max-width: 300px;
    `;
    document.body.appendChild(statsDiv);
}

// ============================================
// 1. CAMPO DE ASTEROIDES COM FÍSICA
// ============================================
function createAsteroidField() {
    for (let i = 0; i < 50; i++) {
        const asteroidGeometry = new THREE.IcosahedronGeometry(
            Math.random() * 3 + 1,
            Math.floor(Math.random() * 3)
        );
        const asteroidMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.05, 0.6, 0.4),
            metalness: Math.random() * 0.5 + 0.3,
            roughness: Math.random() * 0.5 + 0.5
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        asteroid.position.set(
            (Math.random() - 0.5) * 250,
            (Math.random() - 0.5) * 250,
            (Math.random() - 0.5) * 250
        );
        
        asteroid.castShadow = true;
        asteroid.receiveShadow = true;
        scene.add(asteroid);
        
        asteroidField.push({
            mesh: asteroid,
            velocity: {
                x: (Math.random() - 0.5) * 0.2,
                y: (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.2
            },
            rotationSpeed: Math.random() * 0.01,
            size: asteroid.scale.x
        });
    }
}

// ============================================
// 2. BURACOS DE MINHOCA PULSANTES
// ============================================
function createWormholes() {
    for (let i = 0; i < 3; i++) {
        const wormholeGroup = new THREE.Group();
        const torusGeometry = new THREE.TorusGeometry(12, 3, 16, 256);
        const torMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.7 + i * 0.1, 1, 0.5),
            metalness: 1,
            roughness: 0,
            emissive: new THREE.Color().setHSL(0.7 + i * 0.1, 1, 0.6)
        });
        const torus = new THREE.Mesh(torusGeometry, torMaterial);
        wormholeGroup.add(torus);
        
        wormholeGroup.position.set(
            Math.cos((i / 3) * Math.PI * 2) * 120,
            Math.sin((i / 3) * Math.PI * 2) * 60,
            Math.cos((i / 3) * Math.PI * 2 + Math.PI) * 120
        );
        
        scene.add(wormholeGroup);
        wormholes.push({
            mesh: wormholeGroup,
            pulseSpeed: 0.005 + Math.random() * 0.003,
            rotationSpeed: 0.02 + Math.random() * 0.01,
            baseScale: 1,
            angle: (i / 3) * Math.PI * 2
        });
    }
}

// ============================================
// 3. ESTAÇÕES ESPACIAIS ORBITANTES
// ============================================
function createSpaceStations() {
    for (let i = 0; i < 4; i++) {
        const stationGroup = new THREE.Group();
        
        // Centro da estação
        const centerGeometry = new THREE.SphereGeometry(4, 16, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x444444
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        stationGroup.add(center);
        
        // Painéis solares
        for (let j = 0; j < 4; j++) {
            const panelGeometry = new THREE.BoxGeometry(8, 0.3, 8);
            const panelMaterial = new THREE.MeshStandardMaterial({
                color: 0x0099ff,
                metalness: 0.8,
                emissive: 0x0055aa
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.rotation.z = (j / 4) * Math.PI;
            panel.position.z = 8;
            stationGroup.add(panel);
        }
        
        stationGroup.position.set(
            Math.cos((i / 4) * Math.PI * 2) * 100,
            Math.sin((i / 4) * Math.PI * 2) * 30,
            Math.sin((i / 4) * Math.PI * 2) * 100
        );
        
        scene.add(stationGroup);
        spaceStations.push({
            mesh: stationGroup,
            orbitRadius: 100,
            orbitSpeed: 0.001 + Math.random() * 0.0005,
            orbitAngle: (i / 4) * Math.PI * 2,
            rotationSpeed: 0.003
        });
    }
}

// ============================================
// 4. FEIXES DE ENERGIA ENTRE OBJETOS
// ============================================
function createEnergyBeams() {
    // Os feixes serão criados dinamicamente no loop de atualização
    // Aqui apenas inicializamos o array
}

function updateEnergyBeams() {
    // Remover feixes antigos
    energyBeams.forEach(beam => scene.remove(beam.line));
    energyBeams = [];
    
    // Criar novos feixes conectando estações a naves aleatoriamente
    if (spaceStations.length > 0 && spacecraft.length > 0) {
        for (let i = 0; i < Math.min(3, spaceStations.length); i++) {
            const station = spaceStations[i];
            const ship = spacecraft[Math.floor(Math.random() * spacecraft.length)];
            
            const points = [
                station.mesh.position.clone(),
                ship.mesh.position.clone()
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                linewidth: 2,
                transparent: true,
                opacity: 0.6
            });
            
            const line = new THREE.Line(geometry, material);
            scene.add(line);
            energyBeams.push({ line: line, life: 1 });
        }
    }
}

// ============================================
// 5. CAMPOS DE FORÇA ENERGÉTICOS
// ============================================
function createForceFields() {
    for (let i = 0; i < 5; i++) {
        const torusGeometry = new THREE.TorusGeometry(20 + i * 5, 1, 32, 256);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.3 + i * 0.1, 1, 0.5),
            metalness: 0.7,
            roughness: 0.3,
            emissive: new THREE.Color().setHSL(0.3 + i * 0.1, 1, 0.3),
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        
        torus.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 150
        );
        
        torus.rotation.x = Math.random() * Math.PI;
        torus.rotation.y = Math.random() * Math.PI;
        
        scene.add(torus);
        forceFields.push({
            mesh: torus,
            rotationSpeed: Math.random() * 0.003,
            pulseSpeed: Math.random() * 0.01,
            baseOpacity: 0.4
        });
    }
}

// ============================================
// 6. REDE DE SATÉLITES EM ÓRBITA
// ============================================
function createSatelliteNetwork() {
    for (let i = 0; i < 12; i++) {
        const satGroup = new THREE.Group();
        
        // Corpo do satélite
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddd00,
            metalness: 0.8,
            emissive: 0xffaa00
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        satGroup.add(body);
        
        // Antena
        const antennaGeometry = new THREE.ConeGeometry(0.3, 3, 8);
        const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 2;
        satGroup.add(antenna);
        
        scene.add(satGroup);
        satellites.push({
            mesh: satGroup,
            orbitRadius: 70 + Math.random() * 30,
            orbitSpeed: 0.003 + Math.random() * 0.002,
            orbitAngle: (i / 12) * Math.PI * 2,
            rotationSpeed: Math.random() * 0.02,
            orbitPlane: Math.random() * Math.PI
        });
    }
}

// ============================================
// 7. NUVENS DE POEIRA CÓSMICA INTERATIVA
// ============================================
function createSpaceDustClouds() {
    for (let i = 0; i < 8; i++) {
        const dustGeometry = new THREE.BufferGeometry();
        const dustCount = 500;
        const dustPositions = new Float32Array(dustCount * 3);
        
        for (let j = 0; j < dustCount * 3; j += 3) {
            dustPositions[j] = (Math.random() - 0.5) * 100;
            dustPositions[j + 1] = (Math.random() - 0.5) * 100;
            dustPositions[j + 2] = (Math.random() - 0.5) * 100;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.3,
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.5
        });
        
        const dustCloud = new THREE.Points(dustGeometry, dustMaterial);
        dustCloud.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        
        scene.add(dustCloud);
        spaceDust.push({
            mesh: dustCloud,
            rotationSpeed: Math.random() * 0.001,
            movementSpeed: Math.random() * 0.2
        });
    }
}

// ============================================
// 8. ZONAS DE DISTORÇÃO TEMPORAL
// ============================================
function createTimeWarpZones() {
    for (let i = 0; i < 3; i++) {
        const warpGeometry = new THREE.IcosahedronGeometry(15, 4);
        const warpMaterial = new THREE.MeshStandardMaterial({
            color: 0x9900ff,
            metalness: 0.5,
            roughness: 0.5,
            emissive: 0x6600ff,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide,
            wireframe: false
        });
        
        const warp = new THREE.Mesh(warpGeometry, warpMaterial);
        warp.position.set(
            Math.cos((i / 3) * Math.PI * 2) * 140,
            Math.sin((i / 3) * Math.PI * 2) * 50,
            Math.sin((i / 3) * Math.PI * 2) * 140
        );
        
        scene.add(warp);
        timeWarpZones.push({
            mesh: warp,
            rotationSpeed: 0.0005,
            pulseSpeed: 0.003,
            baseScale: 1,
            angle: (i / 3) * Math.PI * 2
        });
    }
}

// ============================================
// 9. TRILHOS COLORIDOS PARA ASTEROIDES
// ============================================
function createAsteroidTrails() {
    // Os trilhos serão criados dinamicamente no loop de atualização
}

function updateAsteroidTrails() {
    // Criar trilhos a partir dos asteroides em movimento
    asteroidField.forEach(asteroid => {
        if (asteroidTrail.length < 200) {
            const trailGeometry = new THREE.SphereGeometry(0.2, 8, 8);
            const trailMaterial = new THREE.MeshStandardMaterial({
                color: asteroid.mesh.material.color,
                emissive: asteroid.mesh.material.color,
                transparent: true,
                opacity: 0.4
            });
            const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            trail.position.copy(asteroid.mesh.position);
            trail.scale.set(0.5, 0.5, 0.5);
            scene.add(trail);
            
            asteroidTrail.push({
                mesh: trail,
                life: 30,
                maxLife: 30
            });
        }
    });
    
    // Atualizar e remover trilhos antigos
    for (let i = asteroidTrail.length - 1; i >= 0; i--) {
        const trail = asteroidTrail[i];
        trail.life--;
        trail.mesh.material.opacity = (trail.life / trail.maxLife) * 0.4;
        
        if (trail.life <= 0) {
            scene.remove(trail.mesh);
            asteroidTrail.splice(i, 1);
        }
    }
}

// ============================================
// 10. VISUALIZADOR DE SOM COM MÚSICA
// ============================================
function setupSoundVisualizer() {
    // Visualizador será criado dinamicamente quando a música ativar
}

function updateSoundVisualizer() {
    if (!soundVisualizerActive || !audioContext) return;
    
    // Criar esferas que reagem ao som
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // Animar objetos baseado na frequência
    spacecraft.forEach((ship, index) => {
        const frequency = dataArray[index % dataArray.length] / 255;
        ship.mesh.scale.set(1 + frequency * 0.2, 1 + frequency * 0.2, 1 + frequency * 0.2);
    });
}

// ============================================
// ILUMINAÇÃO
// ============================================
function createLights() {
    const ambientLight = new THREE.AmbientLight(0x4488ff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff6600, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const colors = [0xff0080, 0x00ff88, 0x0088ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
        const pointLight = new THREE.PointLight(colors[i], 1, 150);
        const angle = (i / 5) * Math.PI * 2;
        pointLight.position.set(
            Math.cos(angle) * 60,
            Math.sin(angle * 0.5) * 60,
            Math.sin(angle) * 60
        );
        scene.add(pointLight);
        lights.push({
            light: pointLight,
            angle: angle,
            baseDistance: 60
        });
    }
}

// ============================================
// SISTEMA SOLAR COMPLETO
// ============================================
function createSolarSystem() {
    // SOL (Star)
    const sunGeometry = new THREE.SphereGeometry(20, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        metalness: 0,
        roughness: 0.5,
        emissive: 0xffaa00,
        emissiveIntensity: 2
    });
    solarSystem.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    solarSystem.sun.position.set(-500, 0, 0);
    scene.add(solarSystem.sun);

    // Dados dos planetas: [nome, tamanho, cor, distância orbital, velocidade, moons]
    const planetsData = [
        { name: 'Mercúrio', size: 3.8, color: 0x8c7853, distance: 60, speed: 0.04, moons: 0 },
        { name: 'Vénus', size: 9.5, color: 0xffc649, distance: 100, speed: 0.015, moons: 0 },
        { name: 'Terra', size: 10, color: 0x4488ff, distance: 140, speed: 0.01, moons: 1 },
        { name: 'Marte', size: 5.3, color: 0xff6633, distance: 180, speed: 0.008, moons: 2 },
        { name: 'Júpiter', size: 25, color: 0xcc9966, distance: 260, speed: 0.002, moons: 79 },
        { name: 'Saturno', size: 21, color: 0xffdd99, distance: 340, speed: 0.0009, moons: 83 },
        { name: 'Urano', size: 15, color: 0x00ccff, distance: 400, speed: 0.0004, moons: 27 },
        { name: 'Neptuno', size: 14, color: 0x0044ff, distance: 460, speed: 0.0001, moons: 14 }
    ];

    // Criar cada planeta com seus satélites
    planetsData.forEach((data, index) => {
        // Planeta
        const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            color: data.color,
            metalness: 0.3,
            roughness: 0.7,
            emissive: new THREE.Color(data.color).multiplyScalar(0.2)
        });
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        scene.add(planet);
        solarSystem.planets.push({
            mesh: planet,
            name: data.name,
            size: data.size,
            orbitRadius: data.distance,
            orbitSpeed: data.speed,
            orbitAngle: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.005 + 0.001,
            moons: []
        });

        // Órbita visual
        const orbitGeometry = new THREE.BufferGeometry();
        const points = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * data.distance,
                    0,
                    Math.sin(angle) * data.distance
                )
            );
        }
        orbitGeometry.setFromPoints(points);
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color(data.color).multiplyScalar(0.5),
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        orbit.position.set(-500, 0, 0);
        scene.add(orbit);

        // Criar satélites (moons)
        const moonCountLimit = Math.min(data.moons, 3); // Limitar a 3 moons por planeta para performance
        for (let m = 0; m < moonCountLimit; m++) {
            const moonGeometry = new THREE.SphereGeometry(data.size * 0.25, 16, 16);
            const moonMaterial = new THREE.MeshStandardMaterial({
                color: 0xaaaaaa,
                metalness: 0.5,
                roughness: 0.8
            });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            
            scene.add(moon);
            solarSystem.planets[index].moons.push({
                mesh: moon,
                orbitRadius: data.size + 10 + m * 8,
                orbitSpeed: 0.02 + m * 0.01,
                orbitAngle: (m / moonCountLimit) * Math.PI * 2,
                rotationSpeed: Math.random() * 0.01
            });
        }
    });

    // Cintura de asteroides entre Marte e Júpiter
    createAsteroidBelt();
}

// ===== CINTURA DE ASTEROIDES =====
function createAsteroidBelt() {
    for (let i = 0; i < 100; i++) {
        const asteroidGeometry = new THREE.IcosahedronGeometry(
            Math.random() * 4 + 1,
            Math.floor(Math.random() * 3)
        );
        const asteroidMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random() * 0.15 + 0.05, 0.6, 0.35),
            metalness: 0.4,
            roughness: 0.8
        });
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 220 + Math.random() * 80;
        
        asteroid.position.set(
            -500 + Math.cos(angle) * distance,
            (Math.random() - 0.5) * 20,
            Math.sin(angle) * distance
        );
        
        asteroid.castShadow = true;
        scene.add(asteroid);
        
        asteroidField.push({
            mesh: asteroid,
            velocity: {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.1
            },
            rotationSpeed: Math.random() * 0.01,
            beltAsteroid: true
        });
    }
}

// ============================================
// NAVES ESPACIAIS
// ============================================
function createSpacecraft() {
    const designs = [
        createFighterJet, createCargoShip, createExplorer,
        createWarship, createColony, createScout
    ];

    for (let i = 0; i < 6; i++) {
        const ship = designs[i]();
        ship.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 100 + 30,
            (Math.random() - 0.5) * 150
        );
        ship.castShadow = true;
        scene.add(ship);
        spacecraft.push({
            mesh: ship,
            basePos: ship.position.clone(),
            orbitRadius: Math.random() * 30 + 20,
            orbitSpeed: Math.random() * 0.005 + 0.001,
            orbitAngle: Math.random() * Math.PI * 2,
            type: i
        });
    }
}

function createFighterJet() {
    const group = new THREE.Group();
    const fuselage = new THREE.ConeGeometry(2, 12, 8);
    const fuselageMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600, metalness: 0.8, roughness: 0.2, emissive: 0xaa3300
    });
    const fuselageMesh = new THREE.Mesh(fuselage, fuselageMaterial);
    fuselageMesh.castShadow = true;
    group.add(fuselageMesh);

    const wingGeometry = new THREE.BoxGeometry(8, 0.5, 3);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.7 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.castShadow = true;
    group.add(wings);

    for (let i = -1; i <= 1; i += 2) {
        const engine = new THREE.CylinderGeometry(1, 1, 3, 8);
        const engineMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff6600 });
        const engineMesh = new THREE.Mesh(engine, engineMaterial);
        engineMesh.position.set(i * 3, -3, 0);
        engineMesh.castShadow = true;
        group.add(engineMesh);
    }
    return group;
}

function createCargoShip() {
    const group = new THREE.Group();
    const main = new THREE.BoxGeometry(6, 4, 15);
    const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x4488ff, metalness: 0.6, roughness: 0.4 });
    const mainMesh = new THREE.Mesh(main, mainMaterial);
    mainMesh.castShadow = true;
    group.add(mainMesh);

    const cabin = new THREE.BoxGeometry(3, 2, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff, metalness: 0.8, emissive: 0x0055aa });
    const cabinMesh = new THREE.Mesh(cabin, cabinMaterial);
    cabinMesh.position.z = 6;
    cabinMesh.castShadow = true;
    group.add(cabinMesh);
    return group;
}

function createExplorer() {
    const group = new THREE.Group();
    const body = new THREE.SphereGeometry(2.5, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00dd00, metalness: 0.7, emissive: 0x00aa00 });
    const bodyMesh = new THREE.Mesh(body, bodyMaterial);
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    const antenna = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.9 });
    const antennaMesh = new THREE.Mesh(antenna, antennaMaterial);
    antennaMesh.position.z = 4;
    group.add(antennaMesh);
    return group;
}

function createWarship() {
    const group = new THREE.Group();
    const hull = new THREE.BoxGeometry(8, 6, 20);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.8, emissive: 0x880000 });
    const hullMesh = new THREE.Mesh(hull, hullMaterial);
    hullMesh.castShadow = true;
    group.add(hullMesh);

    for (let i = -1; i <= 1; i += 2) {
        const cannon = new THREE.CylinderGeometry(0.6, 0.6, 4, 8);
        const cannonMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const cannonMesh = new THREE.Mesh(cannon, cannonMaterial);
        cannonMesh.position.set(i * 3, 2, 8);
        cannonMesh.rotation.z = Math.PI / 2;
        group.add(cannonMesh);
    }
    return group;
}

function createColony() {
    const group = new THREE.Group();
    const structure = new THREE.BoxGeometry(12, 10, 12);
    const structureMaterial = new THREE.MeshStandardMaterial({ color: 0x8844ff, metalness: 0.5, roughness: 0.6 });
    const structureMesh = new THREE.Mesh(structure, structureMaterial);
    structureMesh.castShadow = true;
    group.add(structureMesh);

    for (let i = 0; i < 4; i++) {
        const panel = new THREE.BoxGeometry(6, 0.4, 8);
        const panelMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, metalness: 0.7, emissive: 0xffaa00 });
        const panelMesh = new THREE.Mesh(panel, panelMaterial);
        panelMesh.position.x = (i % 2 === 0 ? 1 : -1) * 8;
        panelMesh.position.y = (i < 2 ? 1 : -1) * 6;
        group.add(panelMesh);
    }
    return group;
}

function createScout() {
    const group = new THREE.Group();
    const core = new THREE.DodecahedronGeometry(1.5, 0);
    const coreMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.8, emissive: 0xaa00aa });
    const coreMesh = new THREE.Mesh(core, coreMaterial);
    coreMesh.castShadow = true;
    group.add(coreMesh);

    const wings = new THREE.OctahedronGeometry(2.5, 1);
    const wingsMaterial = new THREE.MeshStandardMaterial({ color: 0xff44ff, metalness: 0.6 });
    const wingsMesh = new THREE.Mesh(wings, wingsMaterial);
    wingsMesh.castShadow = true;
    group.add(wingsMesh);
    return group;
}

// ============================================
// ASTRONAUTAS
// ============================================
function createAstronauts() {
    for (let i = 0; i < 10; i++) {
        const astro = createAstronautModel();
        astro.position.set(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60 + 15,
            (Math.random() - 0.5) * 80
        );
        scene.add(astro);
        astronauts.push({
            mesh: astro,
            velocity: { x: (Math.random() - 0.5) * 0.3, y: (Math.random() - 0.5) * 0.3, z: (Math.random() - 0.5) * 0.3 }
        });
    }
}

function createAstronautModel() {
    const group = new THREE.Group();

    const helmetGeometry = new THREE.SphereGeometry(1, 16, 16);
    const helmetMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaff, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 1.5;
    helmet.castShadow = true;
    group.add(helmet);

    const visorGeometry = new THREE.SphereGeometry(0.7, 8, 8);
    const visorMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00, metalness: 1 });
    const visor = new THREE.Mesh(visorGeometry, visorMaterial);
    visor.position.set(0, 1.8, 0.8);
    visor.scale.set(0.7, 0.5, 0.25);
    group.add(visor);

    const suitGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.6);
    const suitMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.6, emissive: 0xaa3300 });
    const suit = new THREE.Mesh(suitGeometry, suitMaterial);
    suit.position.y = 0;
    suit.castShadow = true;
    group.add(suit);

    for (let i = -1; i <= 1; i += 2) {
        const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.5 });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(i * 0.6, 0.3, 0);
        arm.castShadow = true;
        group.add(arm);
    }

    const jetpackGeometry = new THREE.BoxGeometry(0.7, 1, 0.4);
    const jetpackMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff6600, metalness: 0.8 });
    const jetpack = new THREE.Mesh(jetpackGeometry, jetpackMaterial);
    jetpack.position.set(0, 0, -0.6);
    jetpack.castShadow = true;
    group.add(jetpack);

    return group;
}

// ============================================
// PLANETAS
// ============================================
function createPlanets() {
    const mainGeometry = new THREE.IcosahedronGeometry(15, 32);
    const mainMaterial = new THREE.MeshStandardMaterial({
        color: 0x4488ff, metalness: 0.5, roughness: 0.5, emissive: 0x001155
    });
    const mainPlanet = new THREE.Mesh(mainGeometry, mainMaterial);
    mainPlanet.castShadow = true;
    mainPlanet.receiveShadow = true;
    mainPlanet.position.set(0, 0, 0);
    scene.add(mainPlanet);
    planets.push({ mesh: mainPlanet, rotationSpeed: 0.001, orbitSpeed: 0, type: 'main' });

    const ringGeometry = new THREE.TorusGeometry(25, 2, 16, 256);
    const ringMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0088, metalness: 0.8, roughness: 0.2, emissive: 0x330044
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI * 0.3;
    ring.position.set(0, 0, 0);
    ring.castShadow = true;
    scene.add(ring);

    for (let i = 0; i < 3; i++) {
        const satelliteGeometry = new THREE.OctahedronGeometry(3, 3);
        const satelliteMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(i / 3, 1, 0.6), metalness: 0.7, roughness: 0.3
        });
        const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
        satellite.castShadow = true;
        satellite.receiveShadow = true;
        scene.add(satellite);
        planets.push({
            mesh: satellite,
            rotationSpeed: 0.01 + i * 0.005,
            orbitSpeed: 0.002 + i * 0.001,
            orbitRadius: 40 + i * 15,
            orbitAngle: (i / 3) * Math.PI * 2,
            type: 'satellite'
        });
    }
}

// ============================================
// PARTÍCULAS
// ============================================
function createParticleField() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 300;
        positions[i + 1] = (Math.random() - 0.5) * 300;
        positions[i + 2] = (Math.random() - 0.5) * 300;

        const hsl = new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
        colors[i] = hsl.r;
        colors[i + 1] = hsl.g;
        colors[i + 2] = hsl.b;

        velocities[i] = (Math.random() - 0.5) * 0.5;
        velocities[i + 1] = (Math.random() - 0.5) * 0.5;
        velocities[i + 2] = (Math.random() - 0.5) * 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5, vertexColors: true, transparent: true, opacity: 0.6, sizeAttenuation: true
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(points);

    particles = { mesh: points, velocities: velocities, positions: positions };
}

// ============================================
// ESTRUTURAS
// ============================================
function createRingStructures() {
    for (let i = 0; i < 3; i++) {
        const torusGeometry = new THREE.TorusGeometry(60 + i * 20, 1.5, 16, 256);
        const torusMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.5 + i * 0.15, 1, 0.5),
            metalness: 0.6, roughness: 0.4,
            emissive: new THREE.Color().setHSL(0.5 + i * 0.15, 1, 0.3)
        });
        const torus = new THREE.Mesh(torusGeometry, torusMaterial);
        torus.rotation.x = Math.PI * (0.2 + i * 0.15);
        torus.rotation.y = Math.PI * (i * 0.25);
        scene.add(torus);
    }
}

function createFloatingObjects() {
    const shapes = [
        () => new THREE.BoxGeometry(2, 2, 2),
        () => new THREE.TetrahedronGeometry(2),
        () => new THREE.DodecahedronGeometry(2),
        () => new THREE.IcosahedronGeometry(2, 1),
    ];

    for (let i = 0; i < 15; i++) {
        const geometry = shapes[Math.floor(Math.random() * shapes.length)]();
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
            metalness: 0.8, roughness: 0.2,
            emissive: new THREE.Color().setHSL(Math.random(), 1, 0.2)
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        planets.push({
            mesh: mesh,
            rotationSpeed: Math.random() * 0.01,
            type: 'floating',
            floatAmplitude: Math.random() * 10 + 5,
            floatSpeed: Math.random() * 0.01 + 0.005,
            baseY: mesh.position.y
        });
    }
}

function createWaveField() {
    const geometry = new THREE.PlaneGeometry(200, 200, 64, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0x0088ff, metalness: 0.3, roughness: 0.7, side: THREE.DoubleSide, emissive: 0x001155
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2.5;
    plane.position.y = -60;
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add(plane);

    scene.waveField = { mesh: plane, geometry: geometry };
}

function createNebulaClouds() {
    for (let i = 0; i < 8; i++) {
        const geometry = new THREE.IcosahedronGeometry(30 + Math.random() * 20, 3);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.4),
            metalness: 0, roughness: 1,
            emissive: new THREE.Color().setHSL(Math.random(), 1, 0.3),
            transparent: true, opacity: 0.2, side: THREE.BackSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 300,
            (Math.random() - 0.5) * 300
        );
        scene.add(mesh);
        nebulaClouds.push({
            mesh: mesh,
            rotationSpeed: Math.random() * 0.0001,
            originalOpacity: 0.2
        });
    }
}

function createPortals() {
    for (let i = 0; i < 3; i++) {
        const portalGeometry = new THREE.RingGeometry(10, 15, 32);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.7 + i * 0.1, 1, 0.5),
            metalness: 0.9, roughness: 0.1,
            emissive: new THREE.Color().setHSL(0.7 + i * 0.1, 1, 0.6),
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(
            Math.cos((i / 3) * Math.PI * 2) * 80,
            Math.sin((i / 3) * Math.PI * 2) * 20,
            Math.sin((i / 3) * Math.PI * 2) * 80
        );
        portal.rotation.y = Math.random() * Math.PI;
        scene.add(portal);
        planets.push({
            mesh: portal,
            rotationSpeed: 0.02,
            type: 'portal'
        });
    }
}

function createBlackHole() {
    const blackHoleGeometry = new THREE.SphereGeometry(8, 32, 32);
    const blackHoleMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000, metalness: 1, roughness: 0, emissive: 0x330033
    });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    blackHole.position.set(-80, 40, -80);
    scene.add(blackHole);

    const accretionGeometry = new THREE.TorusGeometry(15, 2, 16, 256);
    const accretionMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6600, metalness: 0.8, roughness: 0.2, emissive: 0xffaa00
    });
    const accretion = new THREE.Mesh(accretionGeometry, accretionMaterial);
    accretion.position.copy(blackHole.position);
    accretion.rotation.x = Math.PI * 0.4;
    scene.add(accretion);

    planets.push({
        mesh: blackHole,
        type: 'blackhole',
        accretion: accretion,
        rotationSpeed: 0.015
    });
}

function createShockwaves() {
    for (let i = 0; i < 5; i++) {
        const shockGeometry = new THREE.RingGeometry(0.1, 5, 32);
        const shockMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88, metalness: 0.5, roughness: 0.5,
            emissive: 0x00ffaa, transparent: true, opacity: 0.8, side: THREE.DoubleSide
        });
        const shock = new THREE.Mesh(shockGeometry, shockMaterial);
        shock.position.set(80, 0, 80);
        scene.add(shock);
        planets.push({
            mesh: shock,
            type: 'shockwave',
            scale: 0.1,
            maxScale: 50,
            expandSpeed: 0.8 + i * 0.2
        });
    }
}

// ============================================
// ATUALIZAÇÃO
// ============================================
function updateCamera() {
    const moveSpeed = 0.5;

    if (keysPressed['ArrowUp']) cameraVel.z -= moveSpeed;
    if (keysPressed['ArrowDown']) cameraVel.z += moveSpeed;
    if (keysPressed['ArrowLeft']) cameraVel.x -= moveSpeed;
    if (keysPressed['ArrowRight']) cameraVel.x += moveSpeed;

    cameraVel.x *= 0.9;
    cameraVel.y *= 0.9;
    cameraVel.z *= 0.9;

    cameraPos.x += cameraVel.x;
    cameraPos.y += cameraVel.y;
    cameraPos.z += cameraVel.z;

    if (followAstronaut && astronauts.length > 0 && selectedAstronaut >= 0) {
        const astro = astronauts[selectedAstronaut];
        camera.position.lerp(
            new THREE.Vector3(
                astro.mesh.position.x + 20,
                astro.mesh.position.y + 15,
                astro.mesh.position.z + 25
            ),
            0.05
        );
        camera.lookAt(astro.mesh.position);
    } else {
        camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
        camera.lookAt(0, 0, 0);
    }
}

function updateParticles() {
    const positions = particles.positions;
    const positionAttribute = particles.mesh.geometry.getAttribute('position');

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += particles.velocities[i];
        positions[i + 1] += particles.velocities[i + 1];
        positions[i + 2] += particles.velocities[i + 2];

        if (Math.abs(positions[i]) > 150) particles.velocities[i] *= -1;
        if (Math.abs(positions[i + 1]) > 150) particles.velocities[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 150) particles.velocities[i + 2] *= -1;
    }

    positionAttribute.needsUpdate = true;
}

function updatePlanets() {
    planets.forEach(planet => {
        planet.mesh.rotation.x += planet.rotationSpeed || 0;
        planet.mesh.rotation.y += planet.rotationSpeed || 0;

        if (planet.type === 'satellite') {
            planet.orbitAngle += planet.orbitSpeed;
            planet.mesh.position.x = Math.cos(planet.orbitAngle) * planet.orbitRadius;
            planet.mesh.position.z = Math.sin(planet.orbitAngle) * planet.orbitRadius;
            planet.mesh.position.y = Math.sin(planet.orbitAngle * 0.5) * 15;
        }

        if (planet.type === 'floating') {
            planet.mesh.position.y = planet.baseY + Math.sin(time * planet.floatSpeed) * planet.floatAmplitude;
            planet.mesh.rotation.x += planet.rotationSpeed;
            planet.mesh.rotation.y += planet.rotationSpeed * 1.5;
        }

        if (planet.type === 'portal') {
            planet.mesh.rotation.z += planet.rotationSpeed;
            planet.mesh.scale.x = 1 + Math.sin(time * 0.005) * 0.2;
            planet.mesh.scale.y = 1 + Math.sin(time * 0.005) * 0.2;
        }

        if (planet.type === 'blackhole') {
            planet.mesh.rotation.y += planet.rotationSpeed;
            planet.accretion.rotation.z += 0.008;
            planet.accretion.rotation.x += 0.002;
        }

        if (planet.type === 'shockwave') {
            planet.scale += planet.expandSpeed;
            if (planet.scale > planet.maxScale) {
                planet.scale = 0.1;
            }
            planet.mesh.scale.x = planet.scale;
            planet.mesh.scale.y = planet.scale;
            planet.mesh.material.opacity = 1 - (planet.scale / planet.maxScale);
        }
    });
}

function updateLights() {
    lights.forEach((light, index) => {
        light.light.position.x = Math.cos(time * 0.0005 + light.angle) * light.baseDistance;
        light.light.position.z = Math.sin(time * 0.0005 + light.angle) * light.baseDistance;
        light.light.position.y = Math.sin(time * 0.0003 + light.angle * 2) * light.baseDistance * 0.5;

        light.light.intensity = 0.7 + Math.sin(time * 0.002 + index) * 0.5;
    });
}

function updateWaveField() {
    const positionAttribute = scene.waveField.geometry.getAttribute('position');
    const positions = positionAttribute.array;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];

        const wave1 = Math.sin(x * 0.05 + time * 0.003) * 2;
        const wave2 = Math.sin(z * 0.03 - time * 0.002) * 2;
        const wave3 = Math.cos((x + z) * 0.02 + time * 0.004) * 3;

        positions[i + 1] = wave1 + wave2 + wave3;
    }

    positionAttribute.needsUpdate = true;
}

function updateSpacecraft() {
    spacecraft.forEach((ship, index) => {
        ship.orbitAngle += ship.orbitSpeed;
        const offsetX = Math.cos(ship.orbitAngle) * ship.orbitRadius;
        const offsetZ = Math.sin(ship.orbitAngle) * ship.orbitRadius;

        ship.mesh.position.x = ship.basePos.x + offsetX;
        ship.mesh.position.y = ship.basePos.y + Math.sin(time * 0.002) * 5;
        ship.mesh.position.z = ship.basePos.z + offsetZ;

        ship.mesh.rotation.y += 0.01;
        ship.mesh.rotation.x += 0.003;

        const isSelected = index === currentSpacecraft;
        ship.mesh.children.forEach(child => {
            if (child.material) {
                if (isSelected) {
                    child.material.emissive = new THREE.Color(0xffff00);
                    child.material.emissiveIntensity = 1;
                } else {
                    child.material.emissive = new THREE.Color(child.material.color);
                    child.material.emissiveIntensity = 0.3;
                }
            }
        });
    });
}

function updateAstronauts() {
    astronauts.forEach((astro, index) => {
        astro.velocity.x += (Math.random() - 0.5) * 0.05;
        astro.velocity.y += (Math.random() - 0.5) * 0.05;
        astro.velocity.z += (Math.random() - 0.5) * 0.05;

        astro.mesh.position.x += astro.velocity.x;
        astro.mesh.position.y += astro.velocity.y;
        astro.mesh.position.z += astro.velocity.z;

        const boundary = 150;
        if (Math.abs(astro.mesh.position.x) > boundary) astro.velocity.x *= -1;
        if (Math.abs(astro.mesh.position.y) > boundary) astro.velocity.y *= -1;
        if (Math.abs(astro.mesh.position.z) > boundary) astro.velocity.z *= -1;

        astro.mesh.rotation.y += 0.02;
        astro.mesh.rotation.z += Math.sin(time * 0.002 + index) * 0.01;

        if (index === selectedAstronaut) {
            astro.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.emissive = new THREE.Color(0xff00ff);
                    child.material.emissiveIntensity = 1;
                }
            });
        } else {
            astro.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.emissiveIntensity = 0.3;
                }
            });
        }

        const speed = Math.sqrt(astro.velocity.x ** 2 + astro.velocity.y ** 2 + astro.velocity.z ** 2);
        if (speed > 1) {
            astro.velocity.x *= 0.95;
            astro.velocity.y *= 0.95;
            astro.velocity.z *= 0.95;
        }
    });
}

function updateLasers() {
    lasers = lasers.filter(laser => {
        laser.life--;
        laser.mesh.material.opacity = laser.life / 10;

        if (laser.life <= 0) {
            scene.remove(laser.mesh);
            return false;
        }
        return true;
    });
}

function updateStats() {
    const stats = document.getElementById('stats');
    const shipInfo = spacecraft[currentSpacecraft]
        ? `🚀 Nave ${currentSpacecraft + 1}`
        : '🚀 --';
    const astroInfo = selectedAstronaut >= 0 ? `👨‍🚀 #${selectedAstronaut + 1}` : '👨‍🚀 --';

    stats.innerHTML = `
        <strong style="color: #00ff88;">📊 STATUS:</strong><br>
        ${shipInfo}<br>
        ${astroInfo}<br>
        <br>
        <strong style="color: #ffff00;">📡 OBJETOS:</strong><br>
        Naves: ${spacecraft.length} | Astro: ${astronauts.length}<br>
        Lasers: ${lasers.length} | Pó: ${asteroidTrail.length}
    `;
}

function updateMatrixEffect() {
    matrixObjects.forEach((obj, index) => {
        obj.mesh.position.y = obj.baseY + Math.sin(time * obj.speed + index) * 30;
        obj.mesh.rotation.x += 0.005;
        obj.mesh.rotation.y += 0.003;
        obj.mesh.material.opacity = Math.sin(time * 0.003 + index) * 0.5 + 0.5;
    });
}

function createMatrixEffect() {
    const matrixGeometry = new THREE.PlaneGeometry(1, 1);
    const matrixMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00, metalness: 0, roughness: 1, emissive: 0x00aa00, transparent: true, opacity: 0.6
    });

    for (let x = -150; x < 150; x += 10) {
        for (let z = -150; z < 150; z += 10) {
            const plane = new THREE.Mesh(matrixGeometry, matrixMaterial.clone());
            plane.position.set(x, 80 + Math.random() * 40, z);
            plane.rotation.x = Math.random() * Math.PI;
            scene.add(plane);
            matrixObjects.push({
                mesh: plane,
                baseY: plane.position.y,
                speed: Math.random() * 0.01 + 0.003
            });
        }
    }
}

function removeMatrixEffect() {
    matrixObjects.forEach(obj => scene.remove(obj.mesh));
    matrixObjects = [];
}

function fireLaser() {
    if (spacecraft[currentSpacecraft] && selectedAstronaut >= 0) {
        const ship = spacecraft[currentSpacecraft];
        const target = astronauts[selectedAstronaut];

        const laserGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            ship.mesh.position.x, ship.mesh.position.y, ship.mesh.position.z,
            target.mesh.position.x, target.mesh.position.y, target.mesh.position.z
        ]);
        laserGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const laserMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const laser = new THREE.Line(laserGeometry, laserMaterial);
        scene.add(laser);

        lasers.push({ mesh: laser, life: 10 });
    }
}

function updateRadar() {
    if (!radarActive) return;

    let radar = document.getElementById('radar');
    if (!radar) {
        createRadarOverlay();
        radar = document.getElementById('radar');
    }

    const ctx = radar.getContext('2d');
    ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
    ctx.fillRect(0, 0, 200, 200);

    ctx.strokeStyle = '#00ff00';
    ctx.globalAlpha = 0.3;
    for (let i = 1; i < 5; i++) {
        const size = i * 40;
        ctx.beginPath();
        ctx.arc(100, 100, size, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    spacecraft.forEach((ship, index) => {
        const x = 100 + (ship.mesh.position.x / 120) * 80;
        const y = 100 + (ship.mesh.position.z / 120) * 80;
        if (x > 10 && x < 190 && y > 10 && y < 190) {
            ctx.fillStyle = index === currentSpacecraft ? '#ffff00' : '#00ff88';
            ctx.fillRect(x - 4, y - 4, 8, 8);
            ctx.strokeStyle = ctx.fillStyle;
            ctx.strokeRect(x - 4, y - 4, 8, 8);
        }
    });

    astronauts.forEach(astro => {
        const x = 100 + (astro.mesh.position.x / 120) * 80;
        const y = 100 + (astro.mesh.position.z / 120) * 80;
        if (x > 10 && x < 190 && y > 10 && y < 190) {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });

    ctx.fillStyle = '#0088ff';
    ctx.beginPath();
    ctx.arc(100, 100, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function createRadarOverlay() {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.position = 'absolute';
    canvas.style.top = '20px';
    canvas.style.right = '200px';
    canvas.style.border = '2px solid #0f0';
    canvas.style.backgroundColor = 'rgba(0, 20, 0, 0.9)';
    canvas.style.display = 'block';
    canvas.id = 'radar';
    document.body.appendChild(canvas);

    const legend = document.createElement('div');
    legend.id = 'radarLegend';
    legend.style.position = 'absolute';
    legend.style.top = '230px';
    legend.style.right = '200px';
    legend.style.backgroundColor = 'rgba(0, 30, 0, 0.9)';
    legend.style.border = '2px solid #0f0';
    legend.style.color = '#0f0';
    legend.style.padding = '8px';
    legend.style.fontSize = '11px';
    legend.style.fontFamily = 'monospace';
    legend.style.borderRadius = '3px';
    legend.innerHTML = `
        <strong>📡 LEGENDA RADAR</strong><br>
        <span style="color: #ffff00">█</span> Naves<br>
        <span style="color: #ff6600">●</span> Astronautas<br>
        <span style="color: #0088ff">●</span> Câmara (Centro)<br>
        <hr style="border: 1px solid #0f0; margin: 5px 0">
        <span style="color: #ffff00">✓</span> Nave Ativa<br>
        <span style="color: #ff00ff">✓</span> Astro Selecionado
    `;
    document.body.appendChild(legend);
}

function toggleMusic() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const button = document.getElementById('musicToggle');

    if (musicActive) {
        musicActive = false;
        oscillators.forEach(osc => {
            try { osc.stop(); } catch(e) {}
        });
        oscillators = [];
        button.textContent = '🎵 Música';
    } else {
        musicActive = true;
        button.textContent = '🔊 Ativa';
        playAmbienceMusic();
    }
}

function playAmbienceMusic() {
    if (!audioContext || !musicActive) return;

    const notes = [220, 247, 277, 330, 370, 415, 466];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomNote, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(randomNote * 0.5, audioContext.currentTime + 1.5);

    gain.gain.setValueAtTime(0.08, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 1.5);

    oscillators.push(osc);

    if (musicActive) {
        setTimeout(() => playAmbienceMusic(), 1200);
    }
}

function toggleRadar() {
    radarActive = !radarActive;
    const radar = document.getElementById('radar');
    const legend = document.getElementById('radarLegend');

    if (radar && legend) {
        radar.style.display = radarActive ? 'block' : 'none';
        legend.style.display = radarActive ? 'block' : 'none';
    } else if (radarActive) {
        createRadarOverlay();
    }
    document.getElementById('radarToggle').textContent = radarActive ? '📡 ATIVO' : '📡 Radar';
}

// ============================================
// EVENT HANDLERS
// ============================================
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouse.x = mouseX;
    mouse.y = mouseY;
}

function onKeyDown(event) {
    keysPressed[event.key] = true;
    keysPressed[event.code] = true;

    if (selectedAstronaut >= 0) {
        if (event.key === 'e' || event.key === 'E') {
            selectedAstronaut = (selectedAstronaut + 1) % astronauts.length;
            console.log(`👨‍🚀 Próximo: Astronauta ${selectedAstronaut + 1}`);
            return;
        }
        if (event.key === 'q' || event.key === 'Q') {
            selectedAstronaut = (selectedAstronaut - 1 + astronauts.length) % astronauts.length;
            console.log(`👨‍🚀 Anterior: Astronauta ${selectedAstronaut + 1}`);
            return;
        }
    }

    if (event.key >= '7' && event.key <= '9') {
        const astroNum = parseInt(event.key) - 7;
        if (astroNum < astronauts.length) {
            selectedAstronaut = astroNum;
            console.log(`👨‍🚀 Astronauta ${selectedAstronaut + 1} selecionado! Usa Q/E para trocar.`);
            return;
        }
    }
    if (event.key === '0') {
        if (9 < astronauts.length) {
            selectedAstronaut = 9;
            console.log(`👨‍🚀 Astronauta ${selectedAstronaut + 1} selecionado! Usa Q/E para trocar.`);
            return;
        }
    }

    if (event.code === 'Space') {
        cameraPos = { x: 0, y: 30, z: 80 };
        cameraVel = { x: 0, y: 0, z: 0 };
        followAstronaut = false;
        selectedAstronaut = -1;
    }

    if (event.key >= '1' && event.key <= '6') {
        currentSpacecraft = parseInt(event.key) - 1;
    }

    if (event.key.toLowerCase() === 'm') {
        matrixActive = !matrixActive;
        if (matrixActive) {
            createMatrixEffect();
        } else {
            removeMatrixEffect();
        }
    }

    if (event.key.toLowerCase() === 'n') {
        nebulaActive = !nebulaActive;
        nebulaClouds.forEach(cloud => {
            cloud.mesh.visible = nebulaActive;
        });
    }

    if (event.key.toLowerCase() === 't') {
        followAstronaut = !followAstronaut;
    }

    if (event.key.toLowerCase() === 'l') {
        laserActive = !laserActive;
        console.log('⚡ Lasers ' + (laserActive ? 'ativados' : 'desativados'));
    }

    // ===== CONTROLES DAS 10 NOVAS FEATURES =====
    
    if (event.key.toLowerCase() === 'a') {
        // A: Mostrar/Ocultar asteroides
        asteroidField.forEach(asteroid => {
            asteroid.mesh.visible = !asteroid.mesh.visible;
        });
        console.log('🪨 Asteroides ' + (asteroidField[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'w') {
        // W: Mostrar/Ocultar wormholes
        wormholes.forEach(wormhole => {
            wormhole.mesh.visible = !wormhole.mesh.visible;
        });
        console.log('🌀 Wormholes ' + (wormholes[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 's') {
        // S: Mostrar/Ocultar estações
        spaceStations.forEach(station => {
            station.mesh.visible = !station.mesh.visible;
        });
        console.log('🛰️ Estações ' + (spaceStations[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'e') {
        // E: Mostrar/Ocultar feixes (colisão com Q/E, então verificamos)
        energyBeams.forEach(beam => {
            beam.line.visible = !beam.line.visible;
        });
        console.log('⚡ Feixes ' + (energyBeams[0]?.line.visible !== false ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'f') {
        // F: Mostrar/Ocultar campos de força
        forceFields.forEach(field => {
            field.mesh.visible = !field.mesh.visible;
        });
        console.log('🛡️ Campos ' + (forceFields[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'u') {
        // U: Mostrar/Ocultar satélites
        satellites.forEach(sat => {
            sat.mesh.visible = !sat.mesh.visible;
        });
        console.log('📡 Satélites ' + (satellites[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'd') {
        // D: Mostrar/Ocultar poeira
        spaceDust.forEach(dust => {
            dust.mesh.visible = !dust.mesh.visible;
        });
        console.log('✨ Poeira ' + (spaceDust[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'z') {
        // Z: Mostrar/Ocultar zonas de distorção
        timeWarpZones.forEach(zone => {
            zone.mesh.visible = !zone.mesh.visible;
        });
        console.log('⏰ Time Warp ' + (timeWarpZones[0]?.mesh.visible ? 'visível' : 'oculto'));
    }

    if (event.key.toLowerCase() === 'v') {
        // V: Ativar visualizador de som
        soundVisualizerActive = !soundVisualizerActive;
        console.log('🎵 Visualizador ' + (soundVisualizerActive ? 'ativo' : 'inativo'));
    }

    if (event.key.toLowerCase() === 'p') {
        // P: Mostrar/Ocultar Sistema Solar
        solarSystemVisible = !solarSystemVisible;
        if (solarSystem.sun) solarSystem.sun.visible = solarSystemVisible;
        solarSystem.planets.forEach(planet => {
            planet.mesh.visible = solarSystemVisible;
            planet.moons.forEach(moon => {
                moon.mesh.visible = solarSystemVisible;
            });
        });
        console.log('🪐 Sistema Solar ' + (solarSystemVisible ? 'visível' : 'oculto'));
    }
}

function onKeyUp(event) {
    keysPressed[event.key] = false;
    keysPressed[event.code] = false;
}

function onMouseClick(event) {
    if (event.target.tagName === 'BUTTON' || event.target.id === 'radar') return;

    raycaster.setFromCamera(mouse, camera);

    const shipMeshes = spacecraft.map(s => s.mesh);
    const shipIntersects = raycaster.intersectObjects(shipMeshes, true);

    if (shipIntersects.length > 0) {
        const selectedShip = shipIntersects[0].object;
        const shipIndex = spacecraft.findIndex(s => s.mesh === selectedShip || s.mesh.children.includes(selectedShip));

        if (shipIndex !== -1) {
            currentSpacecraft = shipIndex;
            selectedAstronaut = -1;
            console.log(`🚀 Nave ${shipIndex + 1} selecionada!`);
            return;
        }
    }

    const astronautMeshes = astronauts.map(a => a.mesh);
    const astronautIntersects = raycaster.intersectObjects(astronautMeshes, true);

    if (astronautIntersects.length > 0) {
        const selectedAstro = astronautIntersects[0].object;
        const astroIndex = astronauts.findIndex(a => a.mesh === selectedAstro || a.mesh.children.includes(selectedAstro));

        if (astroIndex !== -1) {
            if (selectedAstronaut === astroIndex) {
                selectedAstronaut = -1;
                console.log('👨‍🚀 Astronauta deselecionado');
            } else {
                selectedAstronaut = astroIndex;
                console.log(`👨‍🚀 Astronauta ${astroIndex + 1} selecionado! Usa Q/E para trocar.`);
            }
            return;
        }
    }

    selectedAstronaut = -1;
    console.log('⭕ Nada selecionado');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// ATUALIZAÇÃO DO SISTEMA SOLAR
// ============================================
function updateSolarSystem() {
    // Atualizar o Sol
    if (solarSystem.sun) {
        solarSystem.sun.rotation.y += 0.0005;
    }

    // Atualizar cada planeta
    solarSystem.planets.forEach(planet => {
        // Órbita do planeta ao redor do Sol
        planet.orbitAngle += planet.orbitSpeed;
        planet.mesh.position.x = -500 + Math.cos(planet.orbitAngle) * planet.orbitRadius;
        planet.mesh.position.z = Math.sin(planet.orbitAngle) * planet.orbitRadius;
        
        // Rotação do planeta
        planet.mesh.rotation.y += planet.rotationSpeed;
        
        // Atualizar satélites (moons) do planeta
        planet.moons.forEach(moon => {
            moon.orbitAngle += moon.orbitSpeed;
            
            // Órbita do satélite ao redor do planeta
            const moonOffsetX = Math.cos(moon.orbitAngle) * moon.orbitRadius;
            const moonOffsetZ = Math.sin(moon.orbitAngle) * moon.orbitRadius;
            
            moon.mesh.position.x = planet.mesh.position.x + moonOffsetX;
            moon.mesh.position.y = planet.mesh.position.y + (Math.sin(moon.orbitAngle) * 5);
            moon.mesh.position.z = planet.mesh.position.z + moonOffsetZ;
            
            // Rotação do satélite
            moon.mesh.rotation.y += moon.rotationSpeed;
        });
    });
    
    // Atualizar cintura de asteroides
    asteroidField.forEach(asteroid => {
        if (asteroid.beltAsteroid) {
            asteroid.mesh.rotation.x += asteroid.rotationSpeed;
            asteroid.mesh.rotation.y += asteroid.rotationSpeed * 0.7;
        }
    });
}

// ============================================
// ANIMAÇÃO LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    updateCamera();
    updateParticles();
    updatePlanets();
    updateLights();
    updateWaveField();
    updateSpacecraft();
    updateAstronauts();
    updateLasers();
    
    // Disparar lasers se ativado
    if (laserActive && Math.random() > 0.7) {
        fireLaser();
    }
    
    updateRadar();

    // ===== ATUALIZAR SISTEMA SOLAR =====
    updateSolarSystem();

    // ===== ATUALIZAR AS 10 NOVAS FEATURES =====
    
    // 1. Atualizar asteroides
    asteroidField.forEach(asteroid => {
        asteroid.mesh.position.x += asteroid.velocity.x;
        asteroid.mesh.position.y += asteroid.velocity.y;
        asteroid.mesh.position.z += asteroid.velocity.z;
        
        // Bouncing nos limites
        if (Math.abs(asteroid.mesh.position.x) > 150) asteroid.velocity.x *= -1;
        if (Math.abs(asteroid.mesh.position.y) > 150) asteroid.velocity.y *= -1;
        if (Math.abs(asteroid.mesh.position.z) > 150) asteroid.velocity.z *= -1;
        
        asteroid.mesh.rotation.x += asteroid.rotationSpeed;
        asteroid.mesh.rotation.y += asteroid.rotationSpeed * 0.7;
    });
    
    // 2. Atualizar wormholes
    wormholes.forEach(wormhole => {
        wormhole.mesh.rotation.y += wormhole.rotationSpeed;
        wormhole.mesh.rotation.x += wormhole.rotationSpeed * 0.5;
        
        // Pulsação
        const pulse = 1 + Math.sin(time * wormhole.pulseSpeed) * 0.3;
        wormhole.mesh.scale.set(pulse, pulse, pulse);
        
        // Órbita
        wormhole.mesh.position.x = Math.cos(time * 0.0003 + wormhole.angle) * 120;
        wormhole.mesh.position.z = Math.sin(time * 0.0003 + wormhole.angle) * 120;
    });
    
    // 3. Atualizar estações
    spaceStations.forEach(station => {
        station.orbitAngle += station.orbitSpeed;
        station.mesh.position.x = Math.cos(station.orbitAngle) * station.orbitRadius;
        station.mesh.position.z = Math.sin(station.orbitAngle) * station.orbitRadius;
        station.mesh.rotation.y += station.rotationSpeed;
    });
    
    // 4. Atualizar feixes de energia
    updateEnergyBeams();
    
    // 5. Atualizar campos de força
    forceFields.forEach(field => {
        field.mesh.rotation.x += field.rotationSpeed;
        field.mesh.rotation.y += field.rotationSpeed * 0.7;
        field.mesh.material.opacity = field.baseOpacity + Math.sin(time * field.pulseSpeed) * 0.1;
    });
    
    // 6. Atualizar satélites
    satellites.forEach(sat => {
        sat.orbitAngle += sat.orbitSpeed;
        sat.mesh.position.x = Math.cos(sat.orbitAngle) * sat.orbitRadius;
        sat.mesh.position.z = Math.sin(sat.orbitAngle) * sat.orbitRadius;
        sat.mesh.position.y = Math.sin(sat.orbitAngle * sat.orbitPlane) * 30;
        sat.mesh.rotation.x += sat.rotationSpeed;
        sat.mesh.rotation.y += sat.rotationSpeed * 0.5;
    });
    
    // 7. Atualizar nuvens de poeira
    spaceDust.forEach(dust => {
        dust.mesh.rotation.x += dust.rotationSpeed;
        dust.mesh.rotation.y += dust.rotationSpeed * 0.5;
        dust.mesh.position.x += Math.sin(time * dust.movementSpeed) * 0.1;
        dust.mesh.position.y += Math.cos(time * dust.movementSpeed * 0.7) * 0.1;
    });
    
    // 8. Atualizar zonas de distorção temporal
    timeWarpZones.forEach(zone => {
        zone.mesh.rotation.x += zone.rotationSpeed;
        zone.mesh.rotation.y += zone.rotationSpeed * 0.8;
        
        // Pulsação e orbit
        const warpPulse = 1 + Math.sin(time * zone.pulseSpeed) * 0.2;
        zone.mesh.scale.set(warpPulse, warpPulse, warpPulse);
        
        zone.mesh.position.x = Math.cos(time * 0.0002 + zone.angle) * 140;
        zone.mesh.position.z = Math.sin(time * 0.0002 + zone.angle) * 140;
    });
    
    // 9. Atualizar trilhos de asteroides
    updateAsteroidTrails();
    
    // 10. Atualizar visualizador de som
    if (soundVisualizerActive) {
        updateSoundVisualizer();
    }

    nebulaClouds.forEach(cloud => {
        cloud.mesh.rotation.x += cloud.rotationSpeed;
        cloud.mesh.rotation.y += cloud.rotationSpeed * 0.7;
        cloud.mesh.material.opacity = cloud.originalOpacity + Math.sin(time * 0.001) * 0.05;
    });

    if (matrixActive) {
        updateMatrixEffect();
    }

    scene.children.forEach(child => {
        if (child.type === 'Mesh' && child.geometry && child.geometry.type === 'TorusGeometry') {
            child.rotation.y += 0.0005;
            child.rotation.x += 0.0002;
        }
    });

    renderer.render(scene, camera);
    updateStats();
}

// ============================================
// INICIAR
// ============================================
init();

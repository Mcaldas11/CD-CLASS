import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/*********************
 * SCENE
 * *******************/
// create an empty scene, that will hold all our elements such as objects, cameras and lights
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,1000);

camera.position.z = 5; // move the camera to the world position (0,0,5)
camera.position.y = 5;
camera.position.x = 5;

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("#006400"); // background color
document.body.appendChild(renderer.domElement);

// cubo
const geometry = new THREE.BoxGeometry(2,2,2);
const material = new THREE.MeshNormalMaterial({ wireframe: true});
const cube = new THREE.Mesh(geometry, material);
cube.rotation.x = 0.5; 
cube.rotation.y = 0.5; 
scene.add(cube); 

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// set the animation function
renderer.setAnimationLoop( animate);

function animate() {
    cube.rotation.x += 0.01; 
    cube.rotation.y += 0.01; 
    renderer.render(scene, camera); 
}

// render the scene 
renderer.render(scene, camera);
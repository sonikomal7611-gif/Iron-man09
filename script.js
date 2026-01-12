import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import * as dat from 'dat.gui';

// --- Configuration & State ---
const state = {
  template: 'heart',
  color: '#ff0055',
  expansion: 1,
  particleCount: 5000
};

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Particle System ---
let geometry = new THREE.BufferGeometry();
let material = new THREE.PointsMaterial({
  size: 0.05,
  color: state.color,
  transparent: true,
  blending: THREE.AdditiveBlending
});
let particles = new THREE.Points(geometry, material);
scene.add(particles);

// --- Shape Templates ---
function createShape(type) {
  const positions = new Float32Array(state.particleCount * 3);
  for (let i = 0; i < state.particleCount; i++) {
    let x, y, z;
    if (type === 'heart') {
      const t = Math.random() * Math.PI * 2;
      x = 16 * Math.pow(Math.sin(t), 3);
      y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      z = (Math.random() - 0.5) * 5;
    } else if (type === 'saturn') {
      // Ring logic...
    }
    positions.set([x * 0.1, y * 0.1, z * 0.1], i * 3);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
}

// --- MediaPipe Hand Tracking ---
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.onResults((results) => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    // Calculate distance between thumb and index for "tension"
    const landmarks = results.multiHandLandmarks[0];
    const dx = landmarks[4].x - landmarks[8].x;
    const dy = landmarks[4].y - landmarks[8].y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    // Smoothly scale particles based on hand tension
    state.expansion = THREE.MathUtils.lerp(state.expansion, distance * 10, 0.1);
    particles.scale.set(state.expansion, state.expansion, state.expansion);
  }
});

// --- UI Panel ---
const gui = new dat.GUI();
gui.add(state, 'template', ['heart', 'flowers', 'saturn', 'buddha', 'fireworks']).onChange(createShape);
gui.addColor(state, 'color').onChange(val => material.color.set(val));

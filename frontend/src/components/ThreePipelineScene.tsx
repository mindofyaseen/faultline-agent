import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PipelineStage } from '../types';

interface ThreePipelineSceneProps {
  stages: PipelineStage[];
  state: 'BASELINE' | 'FAULT_INJECTED' | 'REMEDIATED';
  scenarioTitle: string;
}

function createTextSprite(line1: string, line2: string, colorHex: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 128);

    // Pill background
    ctx.fillStyle = 'rgba(12, 19, 36, 0.85)';
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 108, 16);
    ctx.fill();
    ctx.stroke();

    // Line 1: Stage tag
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(line1.toUpperCase(), 128, 48);

    // Line 2: Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(line2.length > 15 ? line2.slice(0, 13) + '..' : line2, 128, 88);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.4, 1.2, 1);
  return sprite;
}

export const ThreePipelineScene: React.FC<ThreePipelineSceneProps> = ({
  stages,
  state,
  scenarioTitle,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 390;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, 9.2);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 3.5);
    dirLight.position.set(5, 12, 10);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 2.5);
    rimLight.position.set(-8, -4, -4);
    scene.add(rimLight);

    // 4. Background Holographic Cyber-Grid
    const gridHelper = new THREE.GridHelper(30, 24, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -2.6;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    (gridHelper.material as THREE.Material).transparent = true;
    scene.add(gridHelper);

    // State Colors
    const isFault = state === 'FAULT_INJECTED';
    const isRemediated = state === 'REMEDIATED';

    const normalHex = '#06b6d4';
    const faultHex = '#ef4444';
    const remediatedHex = '#10b981';

    const normalColor = 0x06b6d4;
    const faultColor = 0xef4444;
    const remediatedColor = 0x10b981;

    // 5. Build 3D Stage Nodes
    const stageNodes: {
      mesh: THREE.Mesh;
      cage: THREE.LineSegments;
      ring: THREE.Mesh;
      sprite: THREE.Sprite;
      stage: PipelineStage;
      initialY: number;
    }[] = [];

    const nodeSpacing = 3.6;
    const totalWidth = (stages.length - 1) * nodeSpacing;
    const startX = -totalWidth / 2;

    stages.forEach((stage, idx) => {
      const posX = startX + idx * nodeSpacing;
      const posY = Math.sin(idx * 0.9) * 0.35;
      const posZ = 0;

      let nodeColor = normalColor;
      let nodeHex = normalHex;
      if (isFault && (idx === 1 || idx === 2)) {
        nodeColor = faultColor;
        nodeHex = faultHex;
      } else if (isRemediated) {
        nodeColor = remediatedColor;
        nodeHex = remediatedHex;
      }

      // Inner Core Mesh
      const coreGeo = new THREE.IcosahedronGeometry(0.95, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        roughness: 0.15,
        metalness: 0.8,
        emissive: nodeColor,
        emissiveIntensity: 0.8,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(posX, posY, posZ);
      scene.add(coreMesh);

      // Outer Wireframe Cage
      const cageGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.3, 1));
      const cageMat = new THREE.LineBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.7,
      });
      const cage = new THREE.LineSegments(cageGeo, cageMat);
      cage.position.set(posX, posY, posZ);
      scene.add(cage);

      // Orbiting Torus Ring
      const ringGeo = new THREE.TorusGeometry(1.6, 0.035, 8, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(posX, posY, posZ);
      ring.rotation.x = Math.PI / 2.5;
      scene.add(ring);

      // Point Light at node
      const pointLight = new THREE.PointLight(nodeColor, 2.5, 6);
      pointLight.position.set(posX, posY, posZ);
      scene.add(pointLight);

      // 3D Canvas Label Sprite above Node
      const sprite = createTextSprite(`Stage ${idx + 1}`, stage.name, nodeHex);
      sprite.position.set(posX, posY + 1.45, posZ);
      scene.add(sprite);

      stageNodes.push({
        mesh: coreMesh,
        cage,
        ring,
        sprite,
        stage,
        initialY: posY,
      });
    });

    // 6. Connective Cyber-Data Highways (Curves + Moving Particles)
    const curvePoints: THREE.Vector3[] = stageNodes.map((n) => n.mesh.position.clone());
    const curve = new THREE.CatmullRomCurve3(curvePoints);

    // Glowing Cyber Tube
    const tubeGeo = new THREE.TubeGeometry(curve, 72, 0.09, 10, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: isFault ? 0xef4444 : isRemediated ? 0x10b981 : 0x0284c7,
      emissive: isFault ? 0x7f1d1d : isRemediated ? 0x064e3b : 0x0369a1,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
      metalness: 0.9,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);

    // Flowing Data Stream Particles
    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleOffsets: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      particleOffsets.push(i / particleCount);
      const pt = curve.getPoint(particleOffsets[i]);
      particlePositions[i * 3] = pt.x;
      particlePositions[i * 3 + 1] = pt.y;
      particlePositions[i * 3 + 2] = pt.z;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: isFault ? 0xfca5a5 : isRemediated ? 0x6ee7b7 : 0x7dd3fc,
      size: 0.32,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Floating Ambient Starlight Particles
    const dustCount = 180;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 35;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // 7. Interactive Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(stageNodes.map((n) => n.mesh));

      if (intersects.length > 0) {
        const hit = stageNodes.find((n) => n.mesh === intersects[0].object);
        if (hit) {
          setSelectedStage(hit.stage);
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);

    // Mouse Parallax
    let targetCameraX = 0;
    let targetCameraY = 0.4;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetCameraX = x * 1.8;
      targetCameraY = 0.4 + y * 0.6;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let speedMultiplier = isFault ? 1.8 : 0.9;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Camera lerp
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate Stage Nodes
      stageNodes.forEach((node, idx) => {
        // Bobbing motion
        const bob = Math.sin(elapsedTime * 2 + idx) * 0.12;
        node.mesh.position.y = node.initialY + bob;
        node.cage.position.y = node.mesh.position.y;
        node.ring.position.y = node.mesh.position.y;
        node.sprite.position.y = node.initialY + 1.45 + bob;

        // Rotations
        node.mesh.rotation.x += 0.012;
        node.mesh.rotation.y += 0.018;
        node.cage.rotation.x -= 0.009;
        node.cage.rotation.y -= 0.014;
        node.ring.rotation.z += 0.025;

        // Jitter corrupted node if fault active
        if (isFault && (idx === 1 || idx === 2)) {
          node.mesh.position.x += (Math.random() - 0.5) * 0.04;
        }
      });

      // Flowing Stream Particles along Curve
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleOffsets[i] = (particleOffsets[i] + 0.0035 * speedMultiplier) % 1.0;
        const pt = curve.getPoint(particleOffsets[i]);
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Dust slow drift
      dust.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 390;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stages, state]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '410px',
        backgroundColor: '#040711',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.7), inset 0 0 50px rgba(6, 182, 212, 0.08)',
        marginBottom: '20px',
      }}
    >
      {/* Three.js Container Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Futuristic HUD Top Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                state === 'FAULT_INJECTED'
                  ? '#ef4444'
                  : state === 'REMEDIATED'
                  ? '#10b981'
                  : '#06b6d4',
              boxShadow: `0 0 12px ${
                state === 'FAULT_INJECTED'
                  ? '#ef4444'
                  : state === 'REMEDIATED'
                  ? '#10b981'
                  : '#06b6d4'
              }`,
            }}
          />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              color: '#38bdf8',
              textTransform: 'uppercase',
            }}
          >
            Holographic 3D Pipeline Topology
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {scenarioTitle} • Move Cursor to Parallax Tilt • Click 3D Node to Inspect
        </div>
      </div>

      {/* Status Pill on top right */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '20px',
          pointerEvents: 'none',
          background: 'rgba(10, 15, 29, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          padding: '4px 14px',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          color:
            state === 'FAULT_INJECTED'
              ? '#fca5a5'
              : state === 'REMEDIATED'
              ? '#6ee7b7'
              : '#93c5fd',
        }}
      >
        STATE: {state}
      </div>

      {/* Selected Node HUD Modal / Card */}
      {selectedStage && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            right: '20px',
            background: 'rgba(12, 19, 36, 0.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(6, 182, 212, 0.5)',
            borderRadius: '10px',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.2)',
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🔮</span>
              <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>
                {selectedStage.name}
              </strong>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(6, 182, 212, 0.2)',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                }}
              >
                {selectedStage.status}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              {selectedStage.description}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Runtime</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#a78bfa' }}>
                {selectedStage.runtime_ms} ms
              </div>
            </div>
            <button
              onClick={() => setSelectedStage(null)}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

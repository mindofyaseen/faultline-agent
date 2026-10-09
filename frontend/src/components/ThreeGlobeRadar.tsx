import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeGlobeRadarProps {
  awsRegion?: string;
  isHealthy?: boolean;
}

export const ThreeGlobeRadar: React.FC<ThreeGlobeRadarProps> = ({
  awsRegion = 'us-east-1',
  isHealthy = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const size = 56;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.8;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.domElement.style.width = '56px';
    renderer.domElement.style.height = '56px';
    renderer.domElement.style.display = 'block';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(1.6, 18, 18);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: isHealthy ? 0x06b6d4 : 0xef4444,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(globe);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(1.1, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isHealthy ? 0x0284c7 : 0x991b1b,
      transparent: true,
      opacity: 0.35,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // Telemetry Beacons (Points on sphere)
    const beaconCount = 6;
    const beacons: THREE.Mesh[] = [];
    const beaconMat = new THREE.MeshBasicMaterial({
      color: isHealthy ? 0x38bdf8 : 0xfca5a5,
    });

    for (let i = 0; i < beaconCount; i++) {
      const bGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const bMesh = new THREE.Mesh(bGeo, beaconMat);
      const phi = Math.acos(-1 + (2 * i) / beaconCount);
      const theta = Math.sqrt(beaconCount * Math.PI) * phi;
      bMesh.position.setFromSphericalCoords(1.62, phi, theta);
      globeGroup.add(bMesh);
      beacons.push(bMesh);
    }

    // Outer Orbiting Hologram Ring
    const ringGeo = new THREE.TorusGeometry(2.1, 0.02, 6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    globeGroup.add(ring);

    // 4. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      globeGroup.rotation.y = elapsed * 0.4;
      globeGroup.rotation.x = Math.sin(elapsed * 0.3) * 0.15;
      ring.rotation.z = -elapsed * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isHealthy]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(6, 10, 20, 0.65)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '12px',
        padding: '6px 14px 6px 8px',
      }}
    >
      <div ref={mountRef} style={{ width: '64px', height: '64px' }} />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isHealthy ? '#10b981' : '#ef4444',
              boxShadow: `0 0 8px ${isHealthy ? '#10b981' : '#ef4444'}`,
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: '#38bdf8',
              letterSpacing: '0.05em',
            }}
          >
            AWS REGION: {awsRegion.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Cloud Resilience Mesh Active
        </div>
      </div>
    </div>
  );
};

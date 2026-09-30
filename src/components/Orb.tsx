"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import type { Mesh } from "three";

function OrbMesh() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.25;
    mesh.current.rotation.x += delta * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={mesh}>
        <sphereGeometry args={[1.4, 128, 128]} />
        <MeshDistortMaterial
          color="#bfca8d"
          emissive="#bfca8d"
          emissiveIntensity={0.15}
          roughness={0.45}
          metalness={0.2}
          distort={0.35}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export default function Orb() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.8} color="#d4b9b6" />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#fff8f0" />
      <pointLight position={[-5, -3, -5]} intensity={2} color="#d4b9b6" />
      <OrbMesh />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

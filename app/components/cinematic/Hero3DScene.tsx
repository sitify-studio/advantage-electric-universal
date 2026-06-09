'use client';

import type { MutableRefObject } from 'react';
import { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles, ContactShadows, Environment, Line } from '@react-three/drei';
import * as THREE from 'three';

function CameraRig({ mouse }: { mouse: MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const tx = mouse.current.x * 2.2;
    const ty = 1.85 + mouse.current.y * 1.1;
    const tz = 7.5 + mouse.current.y * -0.45;
    vec.set(tx, ty, tz);
    camera.position.lerp(vec, 0.045);
    camera.lookAt(0, 0.55, 0);
  });
  return null;
}

function AbstractHouse() {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.08, 0]} scale={[2.4, 0.18, 1.75]}>
        <boxGeometry />
        <meshStandardMaterial color="#12141a" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh castShadow position={[-0.85, 0.75, 0.78]} scale={[0.08, 1.25, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color="#12141a" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh castShadow position={[0.85, 0.75, 0.78]} scale={[0.08, 1.25, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color="#12141a" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh castShadow position={[0, 0.75, -0.78]} scale={[2.05, 1.25, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial color="#12141a" metalness={0.88} roughness={0.22} />
      </mesh>
      <mesh castShadow position={[0, 0.75, 0.78]} scale={[2.05, 1.25, 0.08]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.75}
          roughness={0.28}
          emissive="#ff9f43"
          emissiveIntensity={0.04}
        />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1.85, 0.12, 1.85]}>
        <boxGeometry />
        <meshStandardMaterial color="#12141a" metalness={0.88} roughness={0.22} />
      </mesh>
    </group>
  );
}

function FloatingTools() {
  return (
    <>
      <Float speed={2.4} rotationIntensity={0.85} floatIntensity={0.45}>
        <mesh castShadow position={[-2.35, 1.05, 0.9]} rotation={[Math.PI / 3, 0, 0.4]}>
          <torusGeometry args={[0.32, 0.09, 20, 64]} />
          <meshStandardMaterial color="#ffb347" metalness={0.92} roughness={0.12} emissive="#ff8c42" emissiveIntensity={0.12} />
        </mesh>
      </Float>
      <Float speed={1.9} rotationIntensity={0.55} floatIntensity={0.35}>
        <mesh castShadow position={[2.15, 1.2, -0.6]} rotation={[0.2, 0.8, 0.1]}>
          <coneGeometry args={[0.28, 0.65, 5]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.55} roughness={0.25} emissive="#0ea5e9" emissiveIntensity={0.08} />
        </mesh>
      </Float>
      <Float speed={2.1} rotationIntensity={0.4} floatIntensity={0.3}>
        <mesh castShadow position={[1.1, 0.45, 1.35]} rotation={[0.1, 0.3, 0.5]}>
          <boxGeometry args={[0.45, 0.12, 0.28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.35} />
        </mesh>
      </Float>
    </>
  );
}

function RoofWireframe() {
  const pts: [number, number, number][] = [
    [-1.15, 1.28, 0.2],
    [0, 2.05, 0.2],
    [1.15, 1.28, 0.2],
    [-1.15, 1.28, 0.2],
  ];
  return <Line points={pts} color="#38bdf8" lineWidth={1.2} transparent opacity={0.55} />;
}

function WellnessComposition() {
  return (
    <group position={[0, 0.15, 0]}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.95, 48, 48]} />
        <meshStandardMaterial color="#d4e6d7" metalness={0.15} roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0.35, 0]} scale={[1.02, 0.92, 1.02]}>
        <sphereGeometry args={[0.98, 32, 32]} />
        <meshStandardMaterial color="#7A9A5C" wireframe transparent opacity={0.22} />
      </mesh>
      <Float speed={2.2} rotationIntensity={0.35} floatIntensity={0.4}>
        <mesh castShadow position={[-1.45, 1.1, 0.35]} rotation={[0.6, 0.2, 0.5]}>
          <torusGeometry args={[0.38, 0.1, 24, 64]} />
          <meshStandardMaterial color="#5D6939" metalness={0.35} roughness={0.4} emissive="#7A9A5C" emissiveIntensity={0.08} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={0.35}>
        <mesh castShadow position={[1.35, 0.85, -0.25]} rotation={[0.2, 0.6, 0.15]}>
          <sphereGeometry args={[0.28, 32, 32]} />
          <meshStandardMaterial color="#8B9A7A" metalness={0.2} roughness={0.45} />
        </mesh>
      </Float>
      <Float speed={2.5} rotationIntensity={0.65} floatIntensity={0.3}>
        <mesh castShadow position={[0.55, 1.35, 0.85]} rotation={[0.1, 0.3, 0.8]}>
          <boxGeometry args={[0.55, 0.08, 0.22]} />
          <meshStandardMaterial color="#7A9A5C" metalness={0.25} roughness={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function WellnessAccents() {
  const ring: [number, number, number][] = [
    [-1.1, 1.05, 0.15],
    [0, 1.65, 0.15],
    [1.1, 1.05, 0.15],
    [-1.1, 1.05, 0.15],
  ];
  return <Line points={ring} color="#7A9A5C" lineWidth={1} transparent opacity={0.45} />;
}

function Scene({
  mouse,
  variant = 'construction',
}: {
  mouse: MutableRefObject<{ x: number; y: number }>;
  variant?: 'construction' | 'wellness';
}) {
  const isWellness = variant === 'wellness';

  return (
    <>
      {!isWellness && <color attach="background" args={['#030306']} />}
      <fog attach="fog" args={[isWellness ? '#e8f0ea' : '#030306', 12, 38]} />
      <ambientLight intensity={isWellness ? 0.65 : 0.22} />
      <spotLight
        castShadow
        position={[9, 14, 11]}
        angle={0.28}
        penumbra={0.9}
        intensity={isWellness ? 55 : 95}
        color={isWellness ? '#f8f8f5' : '#ffb86b'}
      />
      <pointLight position={[-7, 3.5, -5]} intensity={isWellness ? 28 : 55} color={isWellness ? '#7A9A5C' : '#38bdf8'} />
      <directionalLight position={[-4, 10, 6]} intensity={isWellness ? 0.55 : 0.35} color="#ffffff" />

      <CameraRig mouse={mouse} />

      <Suspense fallback={null}>
        <Environment preset={isWellness ? 'apartment' : 'night'} />
      </Suspense>

      {isWellness ? (
        <>
          <Float rotationIntensity={0.22} floatIntensity={0.35}>
            <WellnessComposition />
          </Float>
          <WellnessAccents />
        </>
      ) : (
        <>
          <Float rotationIntensity={0.22} floatIntensity={0.35}>
            <AbstractHouse />
          </Float>
          <RoofWireframe />
          <FloatingTools />
        </>
      )}

      <Sparkles
        count={isWellness ? 80 : 120}
        scale={[14, 6, 10]}
        size={1.8}
        speed={0.35}
        opacity={isWellness ? 0.35 : 0.45}
        color={isWellness ? '#7A9A5C' : '#ffb347'}
      />

      <mesh rotation-x={Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[48, 48]} />
        <meshStandardMaterial
          color={isWellness ? '#e8f0ea' : '#050508'}
          metalness={isWellness ? 0.1 : 0.55}
          roughness={isWellness ? 0.75 : 0.42}
        />
      </mesh>
      <ContactShadows
        opacity={isWellness ? 0.25 : 0.45}
        scale={18}
        blur={2.8}
        far={9}
        color={isWellness ? '#5D6939' : '#000000'}
      />
    </>
  );
}

export default function Hero3DScene({
  mouse,
  className,
  variant = 'construction',
}: {
  mouse: MutableRefObject<{ x: number; y: number }>;
  className?: string;
  variant?: 'construction' | 'wellness';
}) {
  const isWellness = variant === 'wellness';

  return (
    <div className={className ?? 'absolute inset-0 z-0'}>
      <Canvas
        shadows
        camera={{ position: [0, 1.85, 7.5], fov: 40, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: isWellness ? 'transparent' : undefined }}
      >
        <Scene mouse={mouse} variant={variant} />
      </Canvas>
      {!isWellness && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/75"
          aria-hidden
        />
      )}
    </div>
  );
}

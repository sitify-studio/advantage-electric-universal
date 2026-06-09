'use client';

import type { MutableRefObject } from 'react';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uTime;
  uniform float uReveal;
  uniform float uZoom;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5);
    vec2 uv = (vUv - center) / uZoom + center;
    float revealMask = smoothstep(0.0, 1.0, uReveal);
    vec2 toCenter = uv - center;
    uv = center + toCenter * mix(1.35, 1.0, revealMask);

    float dist = distance(vUv, uMouse * 0.5 + 0.5);
    float influence = smoothstep(0.65, 0.0, dist);
    vec2 ripple = vec2(
      sin(vUv.y * 18.0 + uTime * 0.35) * 0.0015,
      cos(vUv.x * 14.0 + uTime * 0.28) * 0.0012
    );
    vec2 offset = (uMouse * 0.022 * influence + ripple) * revealMask;
    vec4 color = texture2D(uTexture, uv + offset);

    float vig = smoothstep(0.92, 0.38, distance(vUv, center));
    color.rgb *= mix(0.55, 1.0, vig);
    color.a *= revealMask;
    gl_FragColor = color;
  }
`;

function ImageMesh({
  imageUrl,
  mouse,
  reveal,
  zoom,
}: {
  imageUrl: string;
  mouse: MutableRefObject<{ x: number; y: number }>;
  reveal: MutableRefObject<number>;
  zoom: MutableRefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [imageUrl]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uZoom: { value: 1.08 },
    }),
    [texture]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uMouse.value.set(mouse.current.x, mouse.current.y);
    u.uReveal.value = THREE.MathUtils.lerp(u.uReveal.value, reveal.current, 0.06);
    u.uZoom.value = THREE.MathUtils.lerp(u.uZoom.value, zoom.current, 0.04);
  });

  const { viewport } = useThree();
  const aspect = viewport.width / viewport.height;

  return (
    <mesh scale={[aspect * 2.2, 2.2, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

function AmbientScene({
  mouse,
  reveal,
}: {
  mouse: MutableRefObject<{ x: number; y: number }>;
  reveal: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.y = mouse.current.x * 0.12 + Math.sin(t * 0.15) * 0.02;
    group.current.rotation.x = mouse.current.y * 0.08;
    group.current.scale.setScalar(
      THREE.MathUtils.lerp(group.current.scale.x, 0.85 + reveal.current * 0.15, 0.04)
    );
  });

  return (
  <group ref={group}>
    <ambientLight intensity={0.18} />
    <spotLight position={[4, 8, 6]} intensity={42} angle={0.35} penumbra={1} color="#e8d5c4" />
    <pointLight position={[-5, 2, 3]} intensity={18} color="#a8b4c4" />
    <mesh position={[0, 0.2, 0]} castShadow>
      <boxGeometry args={[1.6, 0.9, 1.2]} />
      <meshStandardMaterial color="#1a1a1e" metalness={0.92} roughness={0.18} />
    </mesh>
    <mesh position={[0.9, 0.55, 0.4]} rotation={[0, 0.4, 0]}>
      <boxGeometry args={[0.35, 0.55, 0.35]} />
      <meshStandardMaterial color="#2a2a30" metalness={0.75} roughness={0.28} />
    </mesh>
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.35, 0]} receiveShadow>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#08080a" metalness={0.4} roughness={0.85} />
    </mesh>
  </group>
  );
}

export default function HeroCinematicPlane({
  imageUrl,
  mouse,
  reveal,
  zoom,
  className,
  useImage = true,
}: {
  imageUrl?: string;
  mouse: MutableRefObject<{ x: number; y: number }>;
  reveal: MutableRefObject<number>;
  zoom: MutableRefObject<number>;
  className?: string;
  useImage?: boolean;
}) {
  return (
    <div className={className ?? 'absolute inset-0 z-0'}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          {useImage && imageUrl ? (
            <ImageMesh imageUrl={imageUrl} mouse={mouse} reveal={reveal} zoom={zoom} />
          ) : (
            <AmbientScene mouse={mouse} reveal={reveal} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
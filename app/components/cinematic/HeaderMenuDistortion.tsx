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
  varying vec2 vUv;

  void main() {
    float dist = distance(vUv, uMouse * 0.5 + 0.5);
    float influence = smoothstep(0.55, 0.0, dist);
    vec2 ripple = vec2(
      sin(vUv.y * 16.0 + uTime * 0.5) * 0.003,
      cos(vUv.x * 12.0 + uTime * 0.4) * 0.0025
    );
    vec2 offset = uMouse * 0.028 * influence + ripple;
    vec4 color = texture2D(uTexture, vUv + offset);
    color.rgb *= 0.85;
    gl_FragColor = color;
  }
`;

function DistortPlane({
  imageUrl,
  mouse,
}: {
  imageUrl: string;
  mouse: MutableRefObject<{ x: number; y: number }>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useMemo(() => {
    const tex = new THREE.TextureLoader().load(imageUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageUrl]);

  useEffect(() => () => texture.dispose(), [texture]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
    }),
    [texture]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uMouse.value.lerp(
      new THREE.Vector2(mouse.current.x, mouse.current.y),
      0.08
    );
  });

  const { viewport } = useThree();
  const aspect = viewport.width / viewport.height;

  return (
    <mesh scale={[aspect * 2.4, 2.4, 1]}>
      <planeGeometry args={[1, 1, 24, 24]} />
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

export default function HeaderMenuDistortion({
  imageUrl,
  mouse,
  className,
}: {
  imageUrl: string;
  mouse: MutableRefObject<{ x: number; y: number }>;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.25]}
        camera={{ position: [0, 0, 2.6], fov: 48 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <DistortPlane imageUrl={imageUrl} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}

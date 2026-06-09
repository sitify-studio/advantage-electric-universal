'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export type EtherealOrbPalette = {
  orbBase: string;
  orbGlow: string;
  particle: string;
  spark: string;
  sparkHighlight: string;
  ambientLight: string;
};

const ORB_RADIUS = 2.4;

const FROSTED_ORB_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FROSTED_ORB_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uGlow;
  uniform vec3 uRim;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.8);
    float topGlow = smoothstep(-0.15, 0.95, n.y);
    float breathe = 0.5 + 0.5 * sin(uTime * 0.35);

    vec3 col = mix(uColor, uGlow, topGlow * 0.65);
    col = mix(col, uRim, fresnel * 0.82);
    col += uGlow * topGlow * 0.18 * breathe;

    float alpha = mix(0.42, 0.9, fresnel) + topGlow * 0.12;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

function useStarTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,240,0.95)');
    gradient.addColorStop(0.45, 'rgba(255,220,160,0.5)');
    gradient.addColorStop(1, 'rgba(255,200,120,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Cross sparkle arms
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx, size - 4);
    ctx.moveTo(4, cy);
    ctx.lineTo(size - 4, cy);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function InternalGlitter({ color, glowColor }: { color: string; glowColor: string }) {
  const coreRef = useRef<THREE.Points>(null);
  const mistRef = useRef<THREE.Points>(null);
  const starTexture = useStarTexture();

  const { corePositions, coreSizes, mistPositions, mistSizes } = useMemo(() => {
    const coreCount = 2400;
    const mistCount = 900;
    const corePos = new Float32Array(coreCount * 3);
    const coreSz = new Float32Array(coreCount);
    const mistPos = new Float32Array(mistCount * 3);
    const mistSz = new Float32Array(mistCount);
    const maxR = ORB_RADIUS * 0.72;

    for (let i = 0; i < coreCount; i++) {
      // Dense cluster in upper-center of the sphere
      const r = Math.pow(Math.random(), 2.2) * maxR;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - Math.random() * 0.55); // upper hemisphere bias
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.cos(phi);
      let z = r * Math.sin(phi) * Math.sin(theta);
      // Pull toward top-center
      y = y * 0.55 + ORB_RADIUS * 0.22;
      x *= 0.75;
      z *= 0.75;
      corePos[i * 3] = x;
      corePos[i * 3 + 1] = y;
      corePos[i * 3 + 2] = z;
      coreSz[i] = 0.025 + Math.random() * 0.06;
    }

    for (let i = 0; i < mistCount; i++) {
      const r = Math.pow(Math.random(), 0.7) * maxR * 1.05;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - Math.random() * 0.8);
      mistPos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.9;
      mistPos[i * 3 + 1] = r * Math.cos(phi) * 0.65 + ORB_RADIUS * 0.08;
      mistPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      mistSz[i] = 0.04 + Math.random() * 0.07;
    }

    return {
      corePositions: corePos,
      coreSizes: coreSz,
      mistPositions: mistPos,
      mistSizes: mistSz,
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.04;
      coreRef.current.rotation.z = Math.sin(t * 0.25) * 0.03;
    }
    if (mistRef.current) {
      mistRef.current.rotation.y = -t * 0.03;
    }
  });

  return (
    <>
      <points ref={coreRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[corePositions, 3]} />
          <bufferAttribute attach="attributes-size" args={[coreSizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          map={starTexture}
          color={color}
          size={0.05}
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      <points ref={mistRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[mistPositions, 3]} />
          <bufferAttribute attach="attributes-size" args={[mistSizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          color={glowColor}
          size={0.06}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function OrbEdgeGlitter({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);
  const starTexture = useStarTexture();

  const { positions, sizes } = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      // Bias toward lower hemisphere and sides
      const phi = Math.acos(1 - Math.random() * 0.75);
      const r = ORB_RADIUS * (1.01 + Math.random() * 0.12);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - ORB_RADIUS * 0.05;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sz[i] = 0.03 + Math.random() * 0.08;
    }

    return { positions: pos, sizes: sz };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={starTexture}
        color={color}
        size={0.055}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function CrownHalo({ spark, sparkHighlight }: { spark: string; sparkHighlight: string }) {
  const sprayRef = useRef<THREE.Points>(null);
  const starTexture = useStarTexture();

  const { positions, sizes, speeds } = useMemo(() => {
    const count = 750;
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const spd = new Float32Array(count);
    const rimY = ORB_RADIUS * 0.92;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 0.15 + Math.random() * 0.85;
      const radius = ORB_RADIUS * (0.88 + Math.random() * 0.18);
      pos[i * 3] = Math.cos(angle) * radius * spread;
      pos[i * 3 + 1] = rimY + Math.random() * 1.6;
      pos[i * 3 + 2] = Math.sin(angle) * radius * spread;
      sz[i] = 0.06 + Math.random() * 0.14;
      spd[i] = 0.15 + Math.random() * 0.45;
    }

    return { positions: pos, sizes: sz, speeds: spd };
  }, []);

  useFrame((state) => {
    if (!sprayRef.current) return;
    const posAttr = sprayRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < arr.length / 3; i++) {
      const baseY = ORB_RADIUS * 0.92 + (i % 7) * 0.05;
      arr[i * 3 + 1] = baseY + ((t * speeds[i]) % 1.8);
      // Soft horizontal shimmer
      arr[i * 3] += Math.sin(t * 1.2 + i) * 0.0008;
      arr[i * 3 + 2] += Math.cos(t * 1.1 + i) * 0.0008;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <>
      {/* Tight golden rim ring */}
      <Sparkles
        count={520}
        scale={[ORB_RADIUS * 1.75, 0.45, ORB_RADIUS * 1.75]}
        position={[0, ORB_RADIUS * 0.95, 0]}
        size={5}
        speed={0.2}
        opacity={1}
        color={sparkHighlight}
      />
      {/* Mid halo burst */}
      <Sparkles
        count={420}
        scale={[ORB_RADIUS * 2.1, 1.1, ORB_RADIUS * 2.1]}
        position={[0, ORB_RADIUS * 1.05, 0]}
        size={7}
        speed={0.12}
        opacity={0.9}
        color={spark}
      />
      {/* Upward radiating star spray */}
      <points ref={sprayRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          map={starTexture}
          color={sparkHighlight}
          size={0.12}
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}

function FrostedOrbShell({ palette }: { palette: EtherealOrbPalette }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(palette.orbBase) },
      uGlow: { value: new THREE.Color(palette.orbGlow) },
      uRim: { value: new THREE.Color('#ffffff') },
      uTime: { value: 0 },
    }),
    [palette.orbBase, palette.orbGlow]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[ORB_RADIUS, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={FROSTED_ORB_VERTEX}
        fragmentShader={FROSTED_ORB_FRAGMENT}
      />
    </mesh>
  );
}

function EtherealOrbScene({ palette }: { palette: EtherealOrbPalette }) {
  const groupRef = useRef<THREE.Group>(null);
  const rise = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    rise.current = Math.min(1, rise.current + delta * 0.45);
    const bob = Math.sin(state.clock.elapsedTime * 0.35) * 0.02;
    groupRef.current.position.y =
      THREE.MathUtils.lerp(-2.6, -1.75, 1 - Math.pow(1 - rise.current, 3)) + bob;
  });

  return (
    <>
      <ambientLight intensity={2.2} color={palette.ambientLight} />
      <hemisphereLight args={[palette.ambientLight, palette.orbGlow, 1.4]} />
      <pointLight position={[0, 3, 1]} intensity={2.2} color={palette.sparkHighlight} distance={20} />
      <pointLight position={[0, 1.5, 3]} intensity={1.0} color={palette.orbGlow} distance={14} />

      <group ref={groupRef} position={[0, -1.75, 0]}>
        <Float speed={0.4} rotationIntensity={0.01} floatIntensity={0.02}>
          <InternalGlitter color={palette.particle} glowColor={palette.orbGlow} />
          <OrbEdgeGlitter color={palette.sparkHighlight} />

          <FrostedOrbShell palette={palette} />

          {/* Bright top rim catch-light */}
          <mesh scale={1.004}>
            <sphereGeometry args={[ORB_RADIUS, 72, 72]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.14}
              side={THREE.BackSide}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </Float>

        <CrownHalo spark={palette.spark} sparkHighlight={palette.sparkHighlight} />
      </group>
    </>
  );
}

export function HeroEtherealOrb({
  palette,
  className,
}: {
  palette: EtherealOrbPalette;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      {/* Soft peach bloom behind orb */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[140%] h-[90%] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 85%, ${palette.orbGlow}66 0%, ${palette.orbBase}33 35%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[90%] h-[35%] pointer-events-none mix-blend-screen opacity-50"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${palette.sparkHighlight}33 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <Canvas
        camera={{ position: [0, 0.25, 5.4], fov: 40, near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <EtherealOrbScene palette={palette} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HeroEtherealOrb;

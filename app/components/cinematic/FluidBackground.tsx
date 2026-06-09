'use client';

import { useEffect, useRef } from 'react';
import { useFluidAmbientOptional } from '@/app/providers/FluidAmbientProvider';

const VS_SOURCE = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
      + i.x + vec3(0.0, i1.x, 1.0) );
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x * x0.x  + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    vec2 layer1 = vec2(snoise(st * 1.5 + u_time * 0.02), snoise(st * 1.2 - u_time * 0.015));
    vec2 layer2 = vec2(snoise(st * 3.0 + layer1 * 2.0 + u_time * 0.01), snoise(st * 2.5 + layer1 * 1.5));

    float finalNoise = snoise(st * 1.0 + layer2 * 1.8);
    finalNoise = (finalNoise + 1.0) * 0.5;

    vec3 colorBase = vec3(0.97, 0.97, 0.98);
    vec3 colorShadow = vec3(0.88, 0.88, 0.90);
    vec3 colorHighlight = vec3(1.0, 1.0, 1.0);

    vec3 finalColor = mix(colorShadow, colorBase, finalNoise);
    finalColor = mix(finalColor, colorHighlight, layer2.x * 0.15);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { timeScaleRef, reducedMotion } = useFluidAmbientOptional();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');

    let elapsed = 0;
    let lastFrame = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      elapsed += dt * timeScaleRef.current;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [reducedMotion, timeScaleRef]);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-canvas"
      aria-hidden
      className="fixed inset-0 h-screen w-screen pointer-events-none -z-10 bg-[#F9F9FB]"
    />
  );
}

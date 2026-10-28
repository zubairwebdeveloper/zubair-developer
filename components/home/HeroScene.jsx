"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeToVisibility(callback) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getPageVisible() {
  return document.visibilityState === "visible";
}

function getServerPageVisible() {
  return false;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function SpinningShape({ children, speed = 0.2 }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current || speed === 0) return;
    ref.current.rotation.x += delta * speed;
    ref.current.rotation.y += delta * speed * 1.3;
  });

  return <group ref={ref}>{children}</group>;
}

function Panel({ position, size, color, rotation = [0, 0, 0], opacity = 0.18 }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.25}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function Bubble({ position, size, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={size} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

export default function HeroScene({ active, colors, activeTab }) {
  const reduced = usePrefersReducedMotion();
  const pageVisible = useSyncExternalStore(
    subscribeToVisibility,
    getPageVisible,
    getServerPageVisible,
  );
  const palette = colors;
  const tabIndex = ["frontend", "backend", "chatbot", "automation"].indexOf(
    activeTab,
  );
  const rotationOffset = tabIndex < 0 ? 0 : tabIndex * 0.045;
  const activeAccent =
    activeTab === "backend" || activeTab === "automation"
      ? palette.accent
      : palette.primary;
  const frameloop =
    !active || !pageVisible ? "never" : reduced ? "demand" : "always";
  const spin = reduced ? 0 : 1;
  const floatScale = reduced ? 0 : 1;

  return (
    <Canvas
      aria-hidden="true"
      frameloop={frameloop}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 38 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      className="pointer-events-none"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-2, 1, 5]} color={activeAccent} intensity={24} />
      <pointLight position={[2, -1, 3]} color={palette.secondary} intensity={18} />

      <Float speed={1.4 * floatScale} rotationIntensity={0.25 * floatScale} floatIntensity={0.9 * floatScale}>
        <group rotation={[0.4, 0.7 + rotationOffset, 0]}>
          <Panel position={[0, 0.2, 0]} size={[2.4, 1.6, 0.15]} color={palette.secondary} opacity={0.18} />
          <Panel position={[-0.22, 0.15, 0.12]} size={[2.1, 1.3, 0.08]} color={palette.surface} opacity={0.08} />
          <Bubble position={[0.6, 0.1, 0.25]} size={[0.22, 0.22, 0.22]} color={palette.primary} />
          <Bubble position={[-0.7, 0.45, 0.26]} size={[0.18, 0.18, 0.18]} color={palette.accent} />
          <Bubble position={[0.8, -0.35, 0.26]} size={[0.14, 0.14, 0.14]} color={palette.secondary} />
        </group>
      </Float>

      <Float speed={1.9 * floatScale} rotationIntensity={0.5 * floatScale} floatIntensity={1.2 * floatScale}>
        <group position={[2.1, -1.2, -0.5]} rotation={[0.8, 0.6, 0]}>
          <SpinningShape speed={0.28 * spin}>
            <mesh>
              <icosahedronGeometry args={[0.9, 0]} />
              <meshStandardMaterial color={palette.primary} roughness={0.3} metalness={0.2} />
            </mesh>
          </SpinningShape>
          <Panel position={[0.1, 0.15, 0.08]} size={[1.1, 0.7, 0.08]} color={palette.surface} opacity={0.12} />
        </group>
      </Float>

      <Float speed={1.6 * floatScale} floatIntensity={0.8 * floatScale}>
        <mesh position={[-2.2, 1.3, -0.7]} rotation={[0.5, 0.8, 0.2]}>
          <octahedronGeometry args={[0.52, 0]} />
          <meshStandardMaterial color={palette.accent} wireframe opacity={0.9} transparent />
        </mesh>
      </Float>

      {[[-1.5, -1.4, -0.9], [1.9, 1.2, -0.8], [-2.5, 0.3, -1.2], [2.6, -0.6, -1.1]].map((pos, index) => (
        <mesh key={index} position={pos}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? palette.primary : palette.secondary}
            emissive={index % 2 === 0 ? palette.primary : palette.secondary}
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
    </Canvas>
  );
}

"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

/**
 * Default colors match your original scene.
 * To match an electric blue brand instead, pass:
 *   colors={{ primary: "#4F8CFF", secondary: "#8DCBFF", accent: "#8DCBFF" }}
 */
const DEFAULT_COLORS = {
  primary: "#facc15",
  secondary: "#7c3aed",
  accent: "#a78bfa",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
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

/**
 * HeroScene
 *
 * @param {boolean} active   Draws the scene while true and pauses it when false.
 * @param {object}  [colors] Optional { primary, secondary, accent } color strings.
 *
 * People who prefer reduced motion get a still image of the scene: it draws one
 * frame and does not spin or float.
 */
export default function HeroScene({ active, colors }) {
  const reduced = usePrefersReducedMotion();
  const palette = { ...DEFAULT_COLORS, ...colors };

  // "demand" draws a frame when something changes, so reduced-motion visitors
  // still see the shapes without any animation.
  const frameloop = !active ? "never" : reduced ? "demand" : "always";

  const spin = reduced ? 0 : 1;
  const floatScale = reduced ? 0 : 1;

  return (
    <Canvas
      // The scene is decoration, so assistive technology should skip it.
      aria-hidden="true"
      frameloop={frameloop}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />

      <Float
        speed={1.2 * floatScale}
        rotationIntensity={0.3 * floatScale}
        floatIntensity={0.8 * floatScale}
      >
        <SpinningShape speed={0.2 * spin}>
          <mesh>
            <icosahedronGeometry args={[1.3, 0]} />
            <meshStandardMaterial
              color={palette.primary}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        </SpinningShape>
      </Float>

      <Float speed={1.6 * floatScale} floatIntensity={1.2 * floatScale}>
        <SpinningShape speed={0.35 * spin}>
          <mesh position={[1.9, -0.9, -0.5]}>
            <torusGeometry args={[0.55, 0.18, 16, 48]} />
            <meshStandardMaterial color={palette.secondary} roughness={0.4} />
          </mesh>
        </SpinningShape>
      </Float>

      <Float speed={1 * floatScale} floatIntensity={1 * floatScale}>
        <mesh position={[-1.9, 1, -1]} rotation={[0.5, 0.5, 0]}>
          <octahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color={palette.accent} wireframe />
        </mesh>
      </Float>
    </Canvas>
  );
}

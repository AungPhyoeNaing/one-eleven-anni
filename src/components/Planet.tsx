import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Song } from '../data/songs';
import { createNoiseTexture, createBandedTexture } from '../utils/textures';

interface PlanetProps {
  song: Song;
  position: [number, number, number];
  orbitRadius: number;
  orbitSpeed: number;
  onClick: (song: Song) => void;
  isActive: boolean;
}

export const Planet: React.FC<PlanetProps> = ({ song, position, orbitRadius, orbitSpeed, onClick, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);

  // Random starting angle for the orbit
  const startAngle = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Orbit around the center
      const angle = startAngle.current + time * orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      
      // Fun, bouncy vertical bobbing
      groupRef.current.position.y = Math.sin(time * 3 + startAngle.current) * 0.8;
    }
    
    if (meshRef.current) {
      // Planet self rotation and playful wobble
      meshRef.current.rotation.y += 0.02;
      meshRef.current.rotation.x = Math.sin(time) * 0.2;

      // Constant bouncy/squishy idle animation
      if (!isActive) {
        // Speed up the bounce when hovered to show excitement!
        const bounceSpeed = hovered ? 15 : 5;
        const bounceIntensity = hovered ? 0.1 : 0.06;
        
        // Offset the time so they don't all bounce in perfect unison
        const offsetTime = time * bounceSpeed + startAngle.current * 10;
        const squish = 1 + Math.sin(offsetTime) * bounceIntensity;
        meshRef.current.scale.set(squish, 2 - squish, squish);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 2) * 0.1;
      ringRef.current.rotation.y = time * 0.5;
    }
  });

  // Generate procedural textures once per planet
  const normalMap = React.useMemo(() => createNoiseTexture(512, 100), []);
  const coreMap = React.useMemo(() => createBandedTexture(song.color, 512), [song.color]);

  const targetScale = isActive ? 1.5 : (hovered ? 1.2 : 1);
  const glowColor = new THREE.Color(song.color);
  
  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(song);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.8, 64, 64]} />
        {/* Crystal clear glossy varnish shell */}
        <meshPhysicalMaterial 
          color="#ffffff"
          roughness={0}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0}
          transmission={1}
          thickness={0} // Perfectly clear, no distortion
        />
        
        {/* Super crisp textured core */}
        <mesh scale={[0.98, 0.98, 0.98]}>
          <sphereGeometry args={[0.8, 64, 64]} />
          <meshStandardMaterial 
            map={coreMap}
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={isActive ? 0.5 : (hovered ? 0.3 : 0.15)} // Subtle glow that doesn't wash out texture
            roughness={0.8}
            normalMap={normalMap} // Put the organic bump map on the surface itself!
            normalScale={new THREE.Vector2(0.3, 0.3)}
          />
        </mesh>

        {/* Cute Saturn Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.3, 0.05, 32, 100]} />
          <meshStandardMaterial 
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
            normalMap={normalMap} // give the ring some texture too!
          />
        </mesh>

        {/* Glow halo */}
        <mesh scale={[1.3, 1.3, 1.3]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent 
            opacity={isActive ? 0.5 : (hovered ? 0.3 : 0.1)}
            side={THREE.BackSide}
          />
        </mesh>
      </mesh>

      {/* HTML Label floating above planet */}
      <Html position={[0, 1.5, 0]} center className="pointer-events-none transition-opacity duration-300">
        <div className={`whitespace-nowrap px-3 py-1 rounded-full backdrop-blur-md border border-white/20 text-xs font-light tracking-wider ${isActive || hovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
             style={{ backgroundColor: `${song.color}40`, color: '#fff' }}>
          {song.title}
        </div>
      </Html>
    </group>
  );
};

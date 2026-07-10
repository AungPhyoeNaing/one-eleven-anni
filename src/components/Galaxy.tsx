import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls, Environment, Float, Html, Sparkles, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Planet } from './Planet';
import { Song, songs } from '../data/songs';
import { createNoiseTexture } from '../utils/textures';

interface GalaxyProps {
  onPlanetClick: (song: Song) => void;
  activeSong: Song | null;
  onCenterClick: () => void;
}

const BackgroundElements = () => {
  const elements = React.useMemo(() => {
    // Super vibrant, cute, neon color palette
    const colors = ['#00ffff', '#ff1493', '#ffd700', '#39ff14', '#7df9ff', '#ff00ff', '#ffa500', '#ffb6c1'];
    return Array.from({ length: 150 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 150 - 20
      ] as [number, number, number],
      scale: Math.random() * 0.08 + 0.02, // Tiny cores with slight variation
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.2,
    }));
  }, []);

  return (
    <group>
      {/* Floating 3D glowing stars */}
      {elements.map((el, i) => (
        <Float key={i} speed={el.speed} rotationIntensity={1} floatIntensity={3}>
          <mesh position={el.position} scale={el.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color={el.color} /> {/* Solid vibrant core */}
            
            {/* Intense Inner Glow */}
            <mesh scale={[2.5, 2.5, 2.5]}>
               <sphereGeometry args={[1, 16, 16]} />
               <meshBasicMaterial color={el.color} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            
            {/* Soft Mid Glow */}
            <mesh scale={[4.5, 4.5, 4.5]}>
               <sphereGeometry args={[1, 16, 16]} />
               <meshBasicMaterial color={el.color} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            
            {/* Soft Outer Halo */}
            <mesh scale={[8, 8, 8]}>
               <sphereGeometry args={[1, 16, 16]} />
               <meshBasicMaterial color={el.color} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const ShootingStar = ({ delay }: { delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timer = useRef(delay);

  const resetStar = () => {
    if (!meshRef.current) return;
    meshRef.current.position.set(
      (Math.random() - 0.5) * 200,
      150 + Math.random() * 50, // Start very high up
      (Math.random() - 0.5) * 150 - 50 
    );
    // Point diagonally down
    meshRef.current.rotation.z = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
    meshRef.current.rotation.x = Math.random() * Math.PI * 0.2;
    // Scale the tail to be incredibly long to create a "star rail" trail effect
    meshRef.current.scale.set(1, Math.random() * 80 + 60, 1); 
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
    const glowMat = (meshRef.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    if (glowMat) glowMat.opacity = 0;
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Handle delay
    if (timer.current > 0) {
      timer.current -= delta;
      if (timer.current <= 0) resetStar();
      return;
    }

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    const glowMat = (meshRef.current.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial;
    
    // Move fast along local Y (head-first)
    meshRef.current.translateY(-150 * delta); 
    
    // Fade logic
    if (meshRef.current.position.y < -50) {
      mat.opacity -= delta * 2; // Fade out as it drops out of view
      glowMat.opacity -= delta * 2;
    } else {
      mat.opacity = Math.min(0.9, mat.opacity + delta * 3); // Fade in smoothly
      glowMat.opacity = Math.min(0.4, glowMat.opacity + delta * 3);
    }
    
    // Reset when fully faded and low
    if (mat.opacity <= 0 && meshRef.current.position.y < -50) {
      // Much less frequent: wait 10-25 seconds before shooting again
      timer.current = Math.random() * 15 + 10; 
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* radiusTop=0 (tail), radiusBottom=0.04 (head). Very thin elegant line */}
      <cylinderGeometry args={[0, 0.04, 1, 8]} /> 
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0} 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      {/* Outer massive pink/purple glowing star rail aura */}
      <mesh scale={[6, 1, 6]}>
         <cylinderGeometry args={[0, 0.04, 1, 8]} />
         <meshBasicMaterial color="#ffb6c1" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </mesh>
  );
};

const ShootingStars = () => {
  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <ShootingStar key={i} delay={Math.random() * 20} />
      ))}
    </group>
  );
};

const CameraController = ({ activeSong }: { activeSong: Song | null }) => {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 5, 15));
  
  useFrame(() => {
    // If mobile (portrait), we zoom out more so planets don't get cut off
    const isMobile = size.width < 768;
    const baseZ = isMobile ? 22 : 15;
    const activeZ = isMobile ? 14 : 10;
    
    const desiredZ = activeSong ? activeZ : baseZ;
    const desiredY = activeSong ? 2 : (isMobile ? 8 : 5);
    
    targetPos.current.set(0, desiredY, desiredZ);
    camera.position.lerp(targetPos.current, 0.02);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
};

const CentralStar = ({ onClick }: { onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const photoTexture = useTexture('/images/central-star-photo.jpg');

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.15; // Slow majestic rotation
      const pulse = 1 + Math.sin(time * 2.5) * 0.02;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.5;
      ring1Ref.current.rotation.y = time * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * -0.4;
      ring2Ref.current.rotation.z = time * 0.2;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = time * 0.2;
      ring3Ref.current.rotation.z = time * -0.6;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Invisible Hitbox to perfectly capture clicks without geometry getting in the way */}
        <mesh 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          visible={false}
        >
          <sphereGeometry args={[2.5, 32, 32]} />
        </mesh>

        <group ref={coreRef}>
          {/* Perfectly clear, bright Photo Core */}
          <mesh>
             <sphereGeometry args={[1.5, 64, 64]} />
             <meshBasicMaterial map={photoTexture} color={hovered ? "#fff0f5" : "#ffffff"} />
          </mesh>
          
          {/* Subtle Magical Holographic Wireframe enveloping the photo */}
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshBasicMaterial color="#ff69b4" wireframe transparent opacity={0.15} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>

        {/* Dynamic Celestial Astrolabe Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.0, 0.015, 16, 100]} />
          <meshBasicMaterial color="#ff1493" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
        </mesh>
        
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.3, 0.03, 16, 100]} />
          <meshBasicMaterial color="#ff69b4" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
        
        <mesh ref={ring3Ref}>
          <torusGeometry args={[2.7, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* Ethereal Volumetric Glows */}
        {/* Inner tight intense glow */}
        <mesh scale={[1.2, 1.2, 1.2]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color="#ff69b4"
            transparent
            opacity={hovered ? 0.6 : 0.3}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Massive soft lovely outer halo */}
        <mesh scale={[1.8, 1.8, 1.8]}>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial 
            color="#ff1493"
            transparent
            opacity={hovered ? 0.25 : 0.12}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </Float>
      
      <pointLight color="#ffc0cb" intensity={100} distance={50} decay={2} />
    </group>
  );
};

export const Galaxy: React.FC<GalaxyProps> = ({ onPlanetClick, activeSong, onCenterClick }) => {
  return (
    <div className="absolute inset-0 w-full h-full bg-cosmic-dark overflow-hidden">
      <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
        <color attach="background" args={['#030014']} />
        
        {/* Environment and Lighting */}
        <ambientLight intensity={0.2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Cute magical background particles scattered across the entire galaxy */}
        <Sparkles count={1500} scale={60} size={2} speed={0.1} color="#ffb6c1" opacity={0.4} />
        <Sparkles count={1000} scale={80} size={1} speed={0.05} color="#a0c4ff" opacity={0.3} />
        <Sparkles count={1000} scale={50} size={3} speed={0.2} color="#e0b0ff" opacity={0.5} />
        
        {/* Distant 3D glowing geometrical shapes and volumetric orbs */}
        <BackgroundElements />
        
        {/* Cinematic falling shooting stars */}
        <ShootingStars />
        
        {/* Camera Logic */}
        <CameraController activeSong={activeSong} />
        
        {/* Interactive Controls (limited so they don't break the cinematic feel) */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={!activeSong}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 2 - 0.5}
        />

        {/* Central Star (Jia) */}
        <React.Suspense fallback={null}>
          <CentralStar onClick={onCenterClick} />
        </React.Suspense>

        {/* Orbiting Planets (Songs) */}
        {songs.map((song, index) => {
          // Calculate initial fixed radius. Closer together for mobile fitting.
          const radius = 4.5 + index * 2.5;
          const speed = 0.2 - index * 0.05; // Inner planets faster
          
          return (
            <Planet
              key={song.id}
              song={song}
              position={[radius, 0, 0]}
              orbitRadius={radius}
              orbitSpeed={speed}
              onClick={onPlanetClick}
              isActive={activeSong?.id === song.id}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

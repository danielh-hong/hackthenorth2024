import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import { ClownFishModel } from "../components/ClownFishComponent";
import { TroutFishModel } from "../components/TroutFishComponent";
import { DoubleSide, RepeatWrapping } from "three";
import * as THREE from "three";
import FishModal from "./FishModal";
import Corals from "../components/Corals";
import ClickableFish from "./ClickableFish";
import styles from './FishBackground.module.css';

// Subtle bubbles with sleek movement and dissipation (increased number)
function Bubbles() {
  const bubbleRef = useRef();
  const bubbles = Array.from({ length: 100 }, () => ({
    x: Math.random() * 10 - 5,
    y: -5,
    z: Math.random() * 10 - 5,
    size: Math.random() * 0.1 + 0.05,
    speed: Math.random() * 0.01 + 0.005,
  }));

  useFrame(() => {
    bubbles.forEach((bubble) => {
      bubble.y += bubble.speed;
      if (bubble.y > 5) bubble.y = -5;
    });
    bubbleRef.current.children.forEach((bubble, i) => {
      bubble.position.y = bubbles[i].y;
      bubble.scale.setScalar(Math.max(0.1, 1 - (bubble.position.y + 5) / 10));
    });
  });

  return (
    <group ref={bubbleRef}>
      {bubbles.map((bubble, i) => (
        <Sphere key={i} args={[bubble.size, 16, 16]} position={[bubble.x, bubble.y, bubble.z]}>
          <meshStandardMaterial color="white" opacity={0.5} transparent />
        </Sphere>
      ))}
    </group>
  );
}

// Stronger light rays with a volumetric effect
function LightRays() {
  return (
    <spotLight
      position={[0, 70, 0]}  // Raised the light source higher for more spread
      angle={Math.PI / 3}  // Wider angle to illuminate the entire tank
      penumbra={1}  // Increase the softness of edges
      intensity={500}  // Increased intensity to make it more impactful
      distance={200}  // Light reaches further into the scene
      decay={2}  // Natural light decay
      castShadow
    />
  );
}

// Ocean floor with fading edges
function OceanFloor() {
  const texture = useTexture('./sand.jpg'); // Load sand texture
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);  // Extended the sand size by repeating the texture more

  const oceanFloorRef = useRef();

  useFrame(({ camera }) => {
    if (oceanFloorRef.current) {
      const distance = camera.position.length();
      oceanFloorRef.current.material.opacity = Math.max(0.1, 1 - (distance - 50) / 50);  // Stronger fade-out at edges
    }
  });

  return (
    <mesh ref={oceanFloorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />  {/* Larger sand plane (sand ground )*/}
      <meshStandardMaterial
        map={texture}
        metalness={0.2}
        roughness={0.9}
        color={new THREE.Color(0x2d4163)}
        transparent
      />
    </mesh>
  );
}

// Ocean skybox wrapping the scene with one ocean texture
function OceanSkybox() {
  const oceanTexture = useTexture('./ocean.jpg'); // Load the ocean texture

  return (
    <mesh>
      <sphereGeometry args={[200, 32, 32]} />
      <meshBasicMaterial map={oceanTexture} side={THREE.BackSide} />
    </mesh>
  );
}

function FishBackground() {
  const [fishCatches, setFishCatches] = useState([]);
  const [selectedFish, setSelectedFish] = useState(null);

  useEffect(() => {
    const fetchFishCatches = async () => {
      try {
        const response = await fetch('http://localhost:3001/get-all-fish-catches');
        if (!response.ok) throw new Error('Failed to fetch fish catches');
        const data = await response.json();
        setFishCatches(data);
      } catch (error) {
        console.error('Error fetching fish catches:', error);
      }
    };
    fetchFishCatches();
  }, []);

  const handleFishClick = (fish) => setSelectedFish(fish);

  return (
    <div className={styles.main}>
      <Canvas camera={{ position: [-4, 6, 15], fov: 50 }}>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.8}
          maxDistance={100}
          minDistance={23}
          maxPolarAngle={(4 * Math.PI) / 5}
          minPolarAngle={Math.PI / 5}
        />

        {/* Keep the Sun Rays to illuminate fish and coral */}
        <LightRays />

        {/* Fading Ocean Floor */}
        <OceanFloor />

        {/* Subtle Bubbles within the tank */}
        <Bubbles />

        {/* Ocean Skybox for wrapping the entire scene */}
        <OceanSkybox />

        <ambientLight intensity={1.3} />
        <directionalLight intensity={1.5} position={[5, 15, 10]} castShadow />

        <Suspense fallback={null}>
          {fishCatches.map((fish, index) => (
            <ClickableFish
              key={fish._id}
              fish={fish}
              index={index}
              onClick={handleFishClick}
              ModelComponent={index % 2 === 0 ? ClownFishModel : TroutFishModel}
            />
          ))}
          <Corals dimensions={[35, 19.8, 30]} num={100} />
        </Suspense>
      </Canvas>
      {selectedFish && (
        <FishModal fish={selectedFish} onClose={() => setSelectedFish(null)} />
      )}
    </div>
  );
}

export default FishBackground;

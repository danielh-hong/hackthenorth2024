// main fish component


import React, { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ClownFishModel } from "../components/ClownFishComponent";
import { TroutFishModel } from "../components/TroutFishComponent";
import { DoubleSide } from "three";
import styles from './FishBackground.module.css';
import FishModal from "./FishModal";
import Corals from "../components/Corals";
import ClickableFish from "./ClickableFish";





function Box(props) {
  let boxRef = useRef();
  useFrame((state, delta) => {
    // boxRef.current.rotation.y += delta;
  });

  return (
    <mesh ref={boxRef} position={props.position} scale={props.scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={props.color}
        opacity={props.opacity || 1}
        transparent={props.opacity ? true : false}
        // metalness={1}
        // roughness={1}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Plane(props) {
  // let time = Math.random() * 100;
  let planeRef = useRef();
  useFrame((state, delta) => {
    // planeRef.current.rotation.z -= delta;
    planeRef.current.rotation.x = 3.141 / 2;
  });

  return (
    <mesh ref={planeRef} position={props.position} scale={props.scale}>
      <planeGeometry args={props.size} recieveShadow />
      <meshStandardMaterial
        color={props.color}
        opacity={props.opacity || 1}
        transparent={props.opacity ? true : false}
        metalness={1}
        side={DoubleSide}
        depthWrite={false}
      />
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

        if (!response.ok) {
          throw new Error('Failed to fetch fish catches');
        }
        const data = await response.json();
        setFishCatches(data);
      } catch (error) {
        console.error('Error fetching fish catches:', error);
      }
    };

    fetchFishCatches();
  }, []);

  const handleFishClick = (fish) => {
    setSelectedFish(fish);
  };

  return (
    <div className={styles.main}>
      <Canvas camera={{ position: [0, 17, 55], fov: 75 }}>
        <OrbitControls
          autoRotate
          autoRotateSpeed={1}
          maxDistance={100}
          minDistance={23}
          maxPolarAngle={(4 * 3.141) / 5}
          minPolarAngle={3.141 / 5}
        />

        <>
          <pointLight
            position={[30 / 2, 20 / 2, 20 / 2]}
            color={[1, 1, 1]}
            intensity={0.25}
          />
          <pointLight
            position={[-30 / 2, 20 / 2, 20 / 2]}
            color={[1, 1, 1]}
            intensity={0.25}
          />
          <pointLight
            position={[30 / 2, 20 / 2, -20 / 2]}
            color={[1, 1, 1]}
            intensity={0.25}
          />
          <pointLight
            position={[-30 / 2, 20 / 2, -20 / 2]}
            color={[1, 1, 1]}
            intensity={0.25}
          />
          <pointLight position={[0, 0, 0]} color={[1, 1, 1]} intensity={0.3} />
          <pointLight
            position={[50, 50, 30]}
            color={[1, 1, 1]}
            intensity={0.25}
          />
        </>

        <ambientLight color={[1.9, 1, 1]} intensity={1} />

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
          <Corals dimensions={[30, 19.8, 20]} num={100} />
        </Suspense>

        <Box
          scale={[30, 20, 20]}
          position={[0, 0, 0]}
          color={[0, 0.25, 0.5]}
          opacity={0.35}
        />

        <directionalLight
          color={[1, 1, 1]}
          intensity={2.5}
          position={[10, 10, 10]}
          castShadow
        />
        <Plane
          color={[0, 0.2, 0.3]}
          size={[100, 79]}
          position={[0, -10, 0]}
          opacity={0.9}
          key={5}
          recieveShadow
        />
      </Canvas>
      {selectedFish && (
        <FishModal fish={selectedFish} onClose={() => setSelectedFish(null)} />
      )}
    </div>
  );
}

export default FishBackground;

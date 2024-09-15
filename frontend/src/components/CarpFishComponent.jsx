import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

export function CarpFishModel(props) {
  <mesh {...props} scale={[0.5, 0.5, 0.5]} rotation={[0, Math.PI / 2, 0]}>
  {/* Carp model's geometry and material */}
  <boxGeometry args={[1, 1, 3]} />  {/* Example geometry */}
  <meshStandardMaterial color="orange" />
  </mesh>
  const group = useRef();
  const [dirSwitch, setDirSwitch] = useState(false);
  const [radiusFac, setRadiusFac] = useState(0.01);

  // Load the GLTF model for CarpFish
  const { scene, materials, animations } = useGLTF(
    import.meta.env.BASE_URL + "assets/carpFish.glb"
  );

  // Clone the scene for dynamic node access
  const clone1 = useMemo(() => clone(scene), [scene]);
  const { actions, names } = useAnimations(animations, group);

  const [pos, setPos] = useState([0, 0, 0]);
  const [rotY, setRotY] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Track if the animation is already playing

  const [geometry, setGeometry] = useState(null);
  const [material, setMaterial] = useState(null);

  // Log the structure to inspect the scene, materials, and animations
  useEffect(() => {
    console.log("GLTF Scene structure:", scene);
    console.log("Animations available:", animations);
    console.log("Materials available:", materials);

    if (names.length === 0) {
      console.warn("No animations found in carpFish.glb");
    }
  }, [scene, animations, materials]);

  // Traverse the scene to find the geometry and material dynamically
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        setGeometry(node.geometry);
        setMaterial(node.material);
      }
    });
  }, [scene]);

  // Set the initial carp fish position and rotation
  useEffect(() => {
    setRadiusFac(Math.random() * 0.01 + 0.005); // Adjust speed of rotation
    setPos([
      15 * (Math.random() - 0.5),
      props.index * 10 - 5,
      6 * (Math.random() - 0.5),
    ]);
    let angle = Math.random() * 2 * Math.PI;
    setRotY(angle);
  }, [props.index]);

  // Update rotation of the fish (apply an initial rotation to face forward)
  useEffect(() => {
    if (group.current) {
      group.current.rotation.y = rotY; // Rotate left-right on Y-axis
      group.current.rotation.x = 0;    // Ensure no up-down movement

      // Apply initial rotation if the fish is sideways
      // Adjust the Z or Y axis based on how your model is facing.
      group.current.rotation.z = Math.PI / 2; // Rotate to make the fish face forward
    }
  }, [rotY]);
  useEffect(() => {
    if (group.current) {
      group.current.rotation.x = 0;           // Ensure no up-down movement
      group.current.rotation.y = rotY;        // Rotate left-right on Y-axis
      group.current.rotation.z = 2 * Math.PI;     // Adjust Z-axis (180 degrees rotation to make the fish face forward)
    }
  }, [rotY]);
  
  // Play the animation for the trout fish only once (avoid resetting each frame)
  useEffect(() => {
    if (actions && names.length > 0 && !isPlaying) {
      let ind = 0;  // Play the first animation (e.g., "swim")
      actions[names[ind]]?.reset().fadeIn(0.5).play();
      setIsPlaying(true); // Ensure we only start the animation once
      return () => actions[names[ind]]?.fadeOut(0.5);
    }
  }, [actions, names, isPlaying]);

  // Animate the carp fish's position and rotation (make it move forward)
  useFrame(() => {
    if (rotY >= 2 * Math.PI || rotY < -2 * Math.PI) {
      setDirSwitch((prev) => !prev);
      setRotY(0);
      return;
    }

    const speedMultiplier = 1.5; // Slightly slower rotation speed

    setRotY((prev) => (dirSwitch ? prev + radiusFac * speedMultiplier : prev - radiusFac * speedMultiplier));
    
    // Adjust the movement direction to make the fish move forward
    setPos((prev) => [
      prev[0] - 0.03 * Math.sin(rotY),  // Slightly slower forward movement on the X-axis
      prev[1],                          // No vertical movement (Y-axis fixed)
      prev[2] - 0.03 * Math.cos(rotY),  // Slightly slower forward movement on the Z-axis
    ]);
  });

  return (
    <group ref={group} {...props} position={pos} scale={[0.03, 0.03, 0.03]} rotation={[180, 0, 0]}>
      {geometry && material ? (
        <mesh geometry={geometry} material={material} />
      ) : (
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}

// Preload the carp fish GLTF model
useGLTF.preload(import.meta.env.BASE_URL + "assets/carpFish.glb");

import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";
import * as THREE from 'three';

export const KoiFishModel = forwardRef((props, ref) => {
  const innerRef = useRef();
  const [dirSwitch, setDirSwitch] = useState(false);
  const [radiusFac] = useState(() => Math.random() * 0.005 + 0.005);
  const { scene, materials, animations } = useGLTF(
    import.meta.env.BASE_URL + "assets/koiFish.glb"
  );
  
  console.log("KoiFishModel: Loaded model", { scene, materials, animations });

  const clone1 = useMemo(() => clone(scene), [scene]);
  const { nodes } = useGraph(clone1);

  console.log("KoiFishModel: Cloned scene nodes", nodes);

  const { actions, names } = useAnimations(animations, innerRef);

  const [pos, setPos] = useState(() => [
    18 * (Math.random() - 0.5),
    15 * Math.random() - 5,
    20 * Math.random() - 10,
  ]);

  const [rotY, setRotY] = useState(() => Math.random() * 2 * Math.PI);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.rotation.y = rotY;
    }
  }, [rotY]);

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      const action = actions[names[0]];
      action.reset().fadeIn(0.5).play();
      return () => action.fadeOut(0.5);
    }
  }, [actions, names]);

  useFrame(() => {
    if (rotY >= 2 * Math.PI || rotY < -2 * Math.PI) {
      setDirSwitch((prev) => !prev);
      setRotY(0);
      return;
    }
    setRotY((prev) => (dirSwitch ? prev + radiusFac : prev - radiusFac));
    setPos((prev) => [
      prev[0] + 0.01 * Math.sin(rotY),
      prev[1],
      prev[2] + 0.01 * Math.cos(rotY),
    ]);

    if (innerRef.current) {
      innerRef.current.rotation.y = rotY;
    }
  });

  // Traverse the scene to find all meshes
  const meshes = [];
  scene.traverse((child) => {
    if (child.isMesh) {
      meshes.push(child);
    }
  });

  console.log("KoiFishModel: Found meshes", meshes);

  if (meshes.length === 0) {
    console.error('No meshes found in the Koi Fish model');
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }

  return (
    <group ref={ref} {...props} position={pos} dispose={null}>
      <group ref={innerRef} name="Sketchfab_Scene">
        {meshes.map((mesh, index) => (
          <mesh
            key={index}
            geometry={mesh.geometry}
            material={mesh.material}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          />
        ))}
      </group>
    </group>
  );
});

useGLTF.preload(import.meta.env.BASE_URL + "assets/koiFish.glb");
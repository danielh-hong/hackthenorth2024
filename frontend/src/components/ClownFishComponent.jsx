import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

export const ClownFishModel = forwardRef((props, ref) => {
  const innerRef = useRef();
  const [dirSwitch, setDirSwitch] = useState(false);
  const [radiusFac] = useState(() => Math.random() * 0.005 + 0.005);
  const { scene, materials, animations } = useGLTF(
    import.meta.env.BASE_URL + "assets/clownFish.glb"
  );
  const clone1 = useMemo(() => clone(scene), [scene]);
  const { nodes } = useGraph(clone1);

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

  return (
    <group ref={ref} {...props} position={pos} dispose={null}>
      <group ref={innerRef} name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group
            name="3a338159af63455cbb591f306837a4cefbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={1}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group name="Object_4">
                  <primitive object={nodes._rootJoint} />
                  <group
                    name="Object_6"
                    position={[0, 0.14, -2.21]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                  <group
                    name="fishClown"
                    position={[0, 0.14, -2.21]}
                    rotation={[-Math.PI / 2, 0, 0]}
                  />
                  <skinnedMesh
                    name="Object_7"
                    geometry={nodes.Object_7.geometry}
                    material={materials.fishclown}
                    skeleton={nodes.Object_7.skeleton}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

useGLTF.preload(import.meta.env.BASE_URL + "assets/clownFish.glb");
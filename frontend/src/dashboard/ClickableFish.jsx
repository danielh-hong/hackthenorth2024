import React from "react";
import { Text } from "@react-three/drei";

function ClickableFish({ fish, index, onClick, ModelComponent }) {
  const handleClick = (event) => {
    event.stopPropagation();
    onClick(fish);
  };

  return (
    <group onClick={handleClick}>
      <ModelComponent scale={0.1} index={index / 20} />
      <Text
        position={[0, 1, 0]}
        fontSize={-505}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {index + 1}
      </Text>
    </group>
  );
}

export default ClickableFish;
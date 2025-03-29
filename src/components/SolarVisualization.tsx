import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars } from '@react-three/drei';
import { Mesh, Vector3, Texture } from 'three';

// Base64 encoded fallback texture in case the original sun texture fails to load
const FALLBACK_SUN_TEXTURE = "data:image/jpeg;base64,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";

const SunObject = () => {
  const meshRef = useRef<Mesh>(null);
  const [textureError, setTextureError] = useState(false);
  
  // Try to load the texture, fall back to base64 if it fails
  const props = useTexture({
    map: textureError ? FALLBACK_SUN_TEXTURE : '/sun-texture.jpg',
    onError: () => setTextureError(true),
  });
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial
        map={props.map}
        emissive="#ff9d00"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const SolarFlare = ({ position, scale = 1 }: { position: Vector3, scale?: number }) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.2;
      // Pulsating effect
      meshRef.current.scale.x = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
      meshRef.current.scale.y = scale * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.5, 0.2, 16, 100]} />
      <meshBasicMaterial color="#ff5722" transparent opacity={0.7} />
    </mesh>
  );
};

const CoronaEffect = () => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z -= delta * 0.01;
      meshRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3.2, 64, 64]} />
      <meshBasicMaterial 
        color="#ff9d00" 
        transparent 
        opacity={0.1} 
        wireframe={true}
      />
    </mesh>
  );
};

type SolarVisualizationProps = {
  className?: string;
  solarActivityLevel?: 'low' | 'moderate' | 'high' | 'severe';
};

const SolarVisualization: React.FC<SolarVisualizationProps> = ({ 
  className,
  solarActivityLevel = 'moderate'
}) => {
  // Determine number of flares based on activity level
  const getFlareCount = () => {
    switch(solarActivityLevel) {
      case 'low': return 1;
      case 'moderate': return 3;
      case 'high': return 5;
      case 'severe': return 8;
      default: return 3;
    }
  };
  
  const flareCount = getFlareCount();
  const flarePositions = Array.from({ length: flareCount }, (_, i) => {
    const angle = (i / flareCount) * Math.PI * 2;
    const distance = 3;
    return new Vector3(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
      (Math.random() - 0.5) * 2
    );
  });

  return (
    <div className={`relative w-full h-96 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} />
          
          <SunObject />
          <CoronaEffect />
          
          {flarePositions.map((position, index) => (
            <SolarFlare 
              key={index} 
              position={position} 
              scale={0.7 + Math.random() * 0.6} 
            />
          ))}
          
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minDistance={6}
            maxDistance={20}
          />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 left-4 glass-panel px-3 py-2">
        <div className="text-sm font-medium">Solar Activity</div>
        <div 
          className={`text-lg font-bold ${
            solarActivityLevel === 'low' ? 'text-alert-low' : 
            solarActivityLevel === 'moderate' ? 'text-alert-moderate' : 
            solarActivityLevel === 'high' ? 'text-alert-high' : 
            'text-alert-severe'
          }`}
        >
          {solarActivityLevel.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default SolarVisualization;

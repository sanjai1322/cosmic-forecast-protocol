
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

const SunObject = () => {
  const meshRef = useRef<Mesh>(null);
  // Using the correct path to the texture with error handling
  const sunTexture = useTexture('/sun-texture.jpg', 
    // Fallback to a basic material if loading fails
    (texture) => {
      console.log('Sun texture loaded successfully');
    },
    (error) => {
      console.error('Failed to load sun texture:', error);
    }
  );
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.5, 64, 64]} />
      <meshStandardMaterial
        map={sunTexture}
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

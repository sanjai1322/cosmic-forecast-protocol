
import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  starCount?: number;
  speed?: number;
}

const Starfield: React.FC<StarfieldProps> = ({ 
  starCount = 200, 
  speed = 0.05 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    class Star {
      x: number;
      y: number;
      z: number;
      radius: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width;
        
        this.radius = 0.5 + Math.random() * 1;
        
        // Create different star colors with subtle variations - limited palette for performance
        const colors = ['#ffffff', '#f0f0ff', '#fffaf0'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      move() {
        this.z = this.z - speed;
        
        if (this.z <= 0) {
          this.z = canvas.width;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }
      
      show() {
        if (!ctx) return;
        
        let x, y, s;
        
        x = (this.x - canvas.width / 2) * (canvas.width / this.z);
        x = x + canvas.width / 2;
        
        y = (this.y - canvas.height / 2) * (canvas.width / this.z);
        y = y + canvas.height / 2;
        
        s = this.radius * (canvas.width / this.z);
        
        // Ensure stars stay within canvas bounds
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.z = canvas.width;
          return;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, s, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Add subtle glow effect to only a few stars to improve performance
        if (Math.random() > 0.95) {
          ctx.beginPath();
          ctx.arc(x, y, s * 1.5, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
        }
      }
    }

    // Create stars - ensure we respect the provided star count
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Animation loop with frame limiting for performance
    let lastFrameTime = 0;
    const targetFPS = 30; // Lower FPS for better performance
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      // Skip frames to maintain target FPS
      if (currentTime - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastFrameTime = currentTime;
      
      // Use a more efficient clearing method - semi-transparent overlay for trails
      ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < stars.length; i++) {
        stars[i].show();
        stars[i].move();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Resize handling with debounce for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [starCount, speed]);

  return <canvas ref={canvasRef} className="star-field fixed top-0 left-0 w-full h-full -z-10" />;
};

export default Starfield;

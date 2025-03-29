
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
        
        // Create different star colors with subtle variations
        const colors = ['#ffffff', '#f0f0ff', '#fffaf0', '#f8f8ff', '#e6e6fa'];
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
        
        // Add subtle glow effect to some stars
        if (Math.random() > 0.85) {
          ctx.beginPath();
          ctx.arc(x, y, s * 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fill();
        }
      }
    }

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < stars.length; i++) {
        stars[i].show();
        stars[i].move();
      }
      
      requestAnimationFrame(animate);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [starCount, speed]);

  return <canvas ref={canvasRef} className="star-field" />;
};

export default Starfield;

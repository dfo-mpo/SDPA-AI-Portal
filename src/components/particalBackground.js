'use client';  
import { useEffect, useRef } from 'react';  
  
const PAGE_SHIFT = 270;  
const PARTICAL_SPEED = 0.25;
  
const ParticleBackground = () => {  
  const canvasRef = useRef(null);  
  
  useEffect(() => {  
    const canvas = canvasRef.current;  
    const ctx = canvas.getContext('2d');  
    const particles = [];  
    const mouse = { x: null, y: null, radius: 100 };  
    canvas.width = window.innerWidth;  
    canvas.height = window.innerHeight - PAGE_SHIFT;  
  
    // Function to get the current particle color based on the CSS variable  
    const getParticleColor = () => {  
      return getComputedStyle(document.body).getPropertyValue('--theme-partical-colour').trim();  
    };  
  
    let particleColor = getParticleColor();  
  
    window.addEventListener('resize', () => {  
      canvas.width = window.innerWidth;  
      canvas.height = window.innerHeight - PAGE_SHIFT;  
    });  
  
    window.addEventListener('mousemove', (event) => {  
      mouse.x = event.x;  
      mouse.y = event.y - PAGE_SHIFT;  
    });  
  
    class Particle {  
      constructor(x, y, directionX, directionY, size, color) {  
        this.x = x;  
        this.y = y;  
        this.directionX = directionX;  
        this.directionY = directionY;  
        this.size = size;  
        this.color = color;  
      }  
  
      draw() {  
        ctx.beginPath();  
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);  
        ctx.fillStyle = this.color;  
        ctx.fill();  
      }  
  
      update() {  
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {  
          this.directionX = -this.directionX;  
        }  
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {  
          this.directionY = -this.directionY;  
        }  
        this.x += this.directionX * PARTICAL_SPEED;  
        this.y += this.directionY * PARTICAL_SPEED;  
        this.draw();  
      }  
  
      setColor(newColor) {  
        this.color = newColor;  
      }  
    }  
  
    function init() {  
      particles.length = 0;  
      const numberOfParticles = (canvas.width * canvas.height) / 8000;  
      for (let i = 0; i < numberOfParticles; i++) {  
        const size = (Math.random() * 5) + 1;  
        const x = Math.random() * (innerWidth - size * 2);  
        const y = Math.random() * (innerHeight - size * 2);  
        const directionX = (Math.random() * 0.4) - 0.2;  
        const directionY = (Math.random() * 0.4) - 0.2;  
        particles.push(new Particle(x, y, directionX, directionY, size, particleColor));  
      }  
    }  
  
    function connect() {  
      let opacityValue = 1;  
      const currentParticleColor = getParticleColor(); // Retrieve the current particle color each time 
  
      for (let a = 0; a < particles.length; a++) {  
        for (let b = a; b < particles.length; b++) {  
          const distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));  
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {  
            opacityValue = 1 - (distance / 20000);  
            ctx.strokeStyle = `rgba(${hexToRgb(currentParticleColor)}, ${opacityValue})`;  
            ctx.lineWidth = 1;  
            ctx.beginPath();  
            ctx.moveTo(particles[a].x, particles[a].y);  
            ctx.lineTo(particles[b].x, particles[b].y);  
            ctx.stroke();  
          }  
        }  
        // Draw line from mouse to particle  
        const mouseDistance = ((particles[a].x - mouse.x) * (particles[a].x - mouse.x)) + ((particles[a].y - mouse.y) * (particles[a].y - mouse.y));  
        if (mouseDistance < (canvas.width / 7) * (canvas.height / 7)) {  
          opacityValue = 1 - (mouseDistance / 20000);  
          ctx.strokeStyle = `rgba(${hexToRgb(currentParticleColor)}, ${opacityValue})`;  
          ctx.lineWidth = 1;  
          ctx.beginPath();  
          ctx.moveTo(particles[a].x, particles[a].y);  
          ctx.lineTo(mouse.x, mouse.y);  
          ctx.stroke();  
        }  
      }  
    }  
  
    function animate() {  
      requestAnimationFrame(animate);  
      ctx.clearRect(0, 0, innerWidth, innerHeight);  
      particles.forEach(particle => particle.update());  
      connect();  
    }  
  
    init();  
    animate();  
  
    // Function to update particle colors  
    const updateParticleColors = () => {  
      const newColor = getParticleColor();  
      if (newColor !== particleColor) {  
        particleColor = newColor;  
        particles.forEach(particle => particle.setColor(newColor));  
      }  
    };  
  
    // Observe changes to the body's class attribute for theme change  
    const observer = new MutationObserver(() => {  
      updateParticleColors();  
    });  
  
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });  
  
    return () => observer.disconnect();  
  }, []);  
  
  return <canvas ref={canvasRef} style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 1 }} />;  
};  
  
// Helper function to convert hex color to RGB format  
function hexToRgb(hex) {  
  hex = hex.replace(/^#/, ''); // Remove the leading '#' if it's there  
  let bigint = parseInt(hex, 16);  
  let r = (bigint >> 16) & 255;  
  let g = (bigint >> 8) & 255;  
  let b = bigint & 255;  
  return `${r}, ${g}, ${b}`;  
}  
  
export default ParticleBackground;  
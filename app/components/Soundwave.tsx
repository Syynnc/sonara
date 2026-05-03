'use client';

import { useEffect, useRef } from 'react';

export function Soundwave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    let offset = 0;

    let mouseX = -1000;
    let mouseY = -1000;
    let targetX = -1000;
    let targetY = -1000;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      isHovering = false;
      targetX = -1000;
      targetY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const waves = [
      { amplitude: 0.12, frequency: 0.004, speed: 1.5, opacity: 0.3, width: 2 },
      { amplitude: 0.18, frequency: 0.006, speed: 2, opacity: 0.5, width: 3 },
      { amplitude: 0.15, frequency: 0.005, speed: 1.8, opacity: 0.8, width: 4 },
    ];

    // Gold color: RGB(212, 175, 55)
    const baseColor = [212, 175, 55];

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      if (isHovering) {
        if (mouseX < 0) {
          mouseX = targetX;
          mouseY = targetY;
        } else {
          mouseX += (targetX - mouseX) * 0.1;
          mouseY += (targetY - mouseY) * 0.1;
        }
      } else {
        mouseX += (-1000 - mouseX) * 0.05;
        mouseY += (-1000 - mouseY) * 0.05;
      }

      const centerY = canvas.offsetHeight / 2;

      if (mouseX > -500) {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
        gradient.addColorStop(0, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.15)`);
        gradient.addColorStop(0.5, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.05)`);
        gradient.addColorStop(1, `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(mouseX, mouseY, 400, 0, Math.PI * 2);
        ctx.fill();
      }

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.lineWidth = wave.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${wave.opacity})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.5)`;

        for (let x = 0; x < canvas.offsetWidth; x++) {
          let y =
            centerY +
            Math.sin((x + offset * wave.speed) * wave.frequency) *
            (canvas.offsetHeight * wave.amplitude) +
            Math.sin((x + offset * wave.speed * 0.5) * wave.frequency * 2) *
            (canvas.offsetHeight * wave.amplitude * 0.3);

          if (mouseX > -500) {
            const dx = x - mouseX;
            const dy = y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 350;

            if (distance < maxDistance) {
              const influence = Math.pow(1 - distance / maxDistance, 2);
              y += (mouseY - y) * influence * 0.3 * (index + 0.5);
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      offset += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

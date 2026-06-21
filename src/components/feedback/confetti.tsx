"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-info",
  "bg-premium",
];

const SHAPES = ["rounded-full", "rounded-sm"];

interface Particle {
  id: number;
  color: string;
  shape: string;
  size: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  delay: number;
  duration: number;
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  className?: string;
}

function generateParticle(index: number): Particle {
  const angle = (Math.PI * 2 * index) / 24;
  const distance = 80 + Math.random() * 160;

  return {
    id: index,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 4 + Math.floor(Math.random() * 5),
    startX: 0,
    startY: 0,
    endX: Math.cos(angle) * distance,
    endY: Math.sin(angle) * distance - 40,
    rotation: Math.random() * 720 - 360,
    delay: Math.random() * 0.3,
    duration: 0.5 + Math.random() * 1,
  };
}

export function Confetti({
  active,
  duration = 2000,
  className,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    setParticles(Array.from({ length: 24 }, (_, i) => generateParticle(i)));
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden",
        className,
      )}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn(particle.color, particle.shape)}
          style={{
            width: particle.size,
            height: particle.size,
            position: "absolute",
          }}
          initial={{
            x: particle.startX,
            y: particle.startY,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: particle.endX,
            y: particle.endY,
            opacity: 0,
            scale: 0,
            rotate: particle.rotation,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

"use client"

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedCounter = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = {
      stop: () => {},
    };

    const animate = (latest: number) => {
      if (latest < value) {
        setCount(Math.round(latest));
      } else {
        setCount(value);
      }
    };
    
    // This is a simplified animation using a spring.
    // In a real app, you might use a library like `react-spring` for more control.
    const spring = {
      damping: 100,
      stiffness: 100,
      mass: 1,
    };
    
    // A simple timeout-based animation loop
    let start = 0;
    const duration = 1500; // ms
    const frame = () => {
      const progress = (Date.now() - start) / duration;
      if (progress < 1) {
        animate(value * progress);
        requestAnimationFrame(frame);
      } else {
        animate(value);
      }
    };

    const timer = setTimeout(() => {
      start = Date.now();
      requestAnimationFrame(frame);
    }, 500); // delay before starting animation

    return () => clearTimeout(timer);

  }, [value]);

  return <motion.span>{count}</motion.span>;
};

export default AnimatedCounter; 
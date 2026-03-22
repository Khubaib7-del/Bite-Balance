import React from 'react';
import { motion } from 'framer-motion';

const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Orb 1: Top-Right (Lime to Emerald) */}
      <motion.div
        className="position-absolute rounded-full"
        style={{
          width: '384px',
          height: '384px',
          background: 'radial-gradient(circle, rgba(132, 204, 22, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
          filter: 'blur(60px)',
          top: '-10%',
          right: '-5%',
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orb 2: Bottom-Left (Orange to Amber) */}
      <motion.div
        className="position-absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          filter: 'blur(80px)',
          bottom: '-15%',
          left: '-10%',
        }}
        animate={{
          x: [0, -40, 60, 0],
          y: [0, 50, -30, 0],
          scale: [1.1, 1, 1.2, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orb 3: Center Rotating (Teal/Cyan) */}
      <motion.div
        className="position-absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
          filter: 'blur(40px)',
          top: '40%',
          left: '45%',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default BackgroundOrbs;

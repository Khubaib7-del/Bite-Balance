import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        let scene, camera, renderer, particles;

        const init = () => {
            try {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.z = 5;

                renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(window.devicePixelRatio);

                if (mountRef.current) {
                    mountRef.current.appendChild(renderer.domElement);
                }
            } catch (e) {
                console.error("WebGL Initialization failed", e);
                return null;
            }

            // Particles
            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 1500;
            const posArray = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 10;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.005,
                color: '#10b981',
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });

            particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            let animationId;
            const animateLoop = () => {
                animationId = requestAnimationFrame(animateLoop);
                if (particles) {
                    particles.rotation.y += 0.001;
                    particles.rotation.x += 0.0005;
                }
                renderer.render(scene, camera);
            };

            animateLoop();

            return () => {
                cancelAnimationFrame(animationId);
            };
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const cleanup = init();
        if (!cleanup) return; // Exit if WebGL failed
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('resize', onWindowResize);
            if (cleanup) cleanup();
            if (mountRef.current && renderer) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (renderer) renderer.dispose();
        };
    }, []);

    return <div id="three-canvas-container" ref={mountRef} />;
};

export default ThreeBackground;

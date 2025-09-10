"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Type definitions
interface Position3D {
  x: number;
  y: number;
  z: number;
}

// Configuration constants
const PARTICLE_CONFIG = {
  SURFACE: {
    SIZE: 0.03,
    OPACITY: 0.9,
  },
  FLOATING: {
    SIZE: 0.02,
    OPACITY: 0.6,
    DISTANCE_MIN: 0.05,
    DISTANCE_MAX: 0.15,
    BOUNDARY_OFFSET: 0.3,
  },
  ANIMATION: {
    ROTATION_SPEED: 0.002,
    VELOCITY_RANGE: 0.01,
    VELOCITY_DRIFT: 0.002,
    VELOCITY_MAX: 0.02,
    DRIFT_PROBABILITY: 0.01,
  },
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1000,
    POSITION: { x: 2.5, y: 1.5, z: 3 },
  },
} as const;

// Helper functions
const createScene = () => {
  return new THREE.Scene();
};

const createCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(
    PARTICLE_CONFIG.CAMERA.FOV,
    width / height,
    PARTICLE_CONFIG.CAMERA.NEAR,
    PARTICLE_CONFIG.CAMERA.FAR,
  );
  camera.position.set(
    PARTICLE_CONFIG.CAMERA.POSITION.x,
    PARTICLE_CONFIG.CAMERA.POSITION.y,
    PARTICLE_CONFIG.CAMERA.POSITION.z,
  );
  camera.lookAt(0, 0, 0);
  return camera;
};

const createRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  // Ensure canvas is centered
  renderer.domElement.style.display = "block";
  renderer.domElement.style.margin = "0 auto";

  return renderer;
};

const generateRandomSpherePosition = (radius: number): Position3D => {
  const phi = Math.random() * Math.PI * 2;
  const theta = Math.acos(2 * Math.random() - 1);

  return {
    x: radius * Math.sin(theta) * Math.cos(phi),
    y: radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(theta),
  };
};

const generateRandomVelocity = (): Position3D => {
  return {
    x: (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_RANGE,
    y: (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_RANGE,
    z: (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_RANGE,
  };
};

const createSurfaceParticles = (
  particleCount: number,
  radius: number,
  color: string,
): THREE.Points => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  // Create particles on sphere surface with random distribution
  for (let i = 0; i < particleCount; i++) {
    const position = generateRandomSpherePosition(radius);
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: PARTICLE_CONFIG.SURFACE.SIZE,
    color: new THREE.Color(color),
    transparent: true,
    opacity: PARTICLE_CONFIG.SURFACE.OPACITY,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
};

const createFloatingParticles = (
  particleCount: number,
  radius: number,
  color: string,
): THREE.Points => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    // Random position in a sphere around the main sphere
    const distance =
      radius +
      PARTICLE_CONFIG.FLOATING.DISTANCE_MIN +
      Math.random() * PARTICLE_CONFIG.FLOATING.DISTANCE_MAX;
    const position = generateRandomSpherePosition(distance);
    const velocity = generateRandomVelocity();

    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    velocities[i * 3] = velocity.x;
    velocities[i * 3 + 1] = velocity.y;
    velocities[i * 3 + 2] = velocity.z;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.userData.velocities = velocities;

  const material = new THREE.PointsMaterial({
    size: PARTICLE_CONFIG.FLOATING.SIZE,
    color: new THREE.Color(color),
    transparent: true,
    opacity: PARTICLE_CONFIG.FLOATING.OPACITY,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
};

interface ParticleSphereProps {
  width?: number;
  height?: number;
  particleCount?: number;
  floatingParticleCount?: number;
  radius?: number;
  color?: string;
  animationSpeed?: number;
  label?: string;
}

export function ParticleSphere({
  width = 400,
  height = 400,
  particleCount = 1500,
  floatingParticleCount = 10000,
  radius = 2,
  color = "#000000",
  animationSpeed = 0.01,
  label,
}: ParticleSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const floatingParticlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Scene setup
      const scene = createScene();
      sceneRef.current = scene;

      // Camera setup
      const camera = createCamera(width, height);

      // Renderer setup
      const renderer = createRenderer(width, height);
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);

      // Create particle systems
      const particles = createSurfaceParticles(particleCount, radius, color);
      particlesRef.current = particles;
      scene.add(particles);

      const floatingParticles = createFloatingParticles(
        floatingParticleCount,
        radius,
        color,
      );
      floatingParticlesRef.current = floatingParticles;
      scene.add(floatingParticles);

      // Animation loop
      const animateFloatingParticles = (
        floatingParticles: THREE.Points,
        particleCount: number,
        radius: number,
      ) => {
        const floatingPositions = floatingParticles.geometry.attributes.position
          .array as Float32Array;
        const velocities = floatingParticles.geometry.userData
          .velocities as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;

          // Simple drift movement
          floatingPositions[i3] += velocities[i3];
          floatingPositions[i3 + 1] += velocities[i3 + 1];
          floatingPositions[i3 + 2] += velocities[i3 + 2];

          // Keep particles within bounds
          const distance = Math.sqrt(
            floatingPositions[i3] ** 2 +
              floatingPositions[i3 + 1] ** 2 +
              floatingPositions[i3 + 2] ** 2,
          );

          if (distance > radius + PARTICLE_CONFIG.FLOATING.BOUNDARY_OFFSET) {
            // Respawn particle closer to sphere
            const newDistance =
              radius +
              PARTICLE_CONFIG.FLOATING.DISTANCE_MIN +
              Math.random() * PARTICLE_CONFIG.FLOATING.DISTANCE_MAX;
            const newPosition = generateRandomSpherePosition(newDistance);
            const newVelocity = generateRandomVelocity();

            floatingPositions[i3] = newPosition.x;
            floatingPositions[i3 + 1] = newPosition.y;
            floatingPositions[i3 + 2] = newPosition.z;

            velocities[i3] = newVelocity.x;
            velocities[i3 + 1] = newVelocity.y;
            velocities[i3 + 2] = newVelocity.z;
          }

          // Add some random drift to velocities
          if (Math.random() < PARTICLE_CONFIG.ANIMATION.DRIFT_PROBABILITY) {
            velocities[i3] +=
              (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_DRIFT;
            velocities[i3 + 1] +=
              (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_DRIFT;
            velocities[i3 + 2] +=
              (Math.random() - 0.5) * PARTICLE_CONFIG.ANIMATION.VELOCITY_DRIFT;

            // Clamp velocities
            velocities[i3] = Math.max(
              -PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX,
              Math.min(PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX, velocities[i3]),
            );
            velocities[i3 + 1] = Math.max(
              -PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX,
              Math.min(
                PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX,
                velocities[i3 + 1],
              ),
            );
            velocities[i3 + 2] = Math.max(
              -PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX,
              Math.min(
                PARTICLE_CONFIG.ANIMATION.VELOCITY_MAX,
                velocities[i3 + 2],
              ),
            );
          }
        }

        floatingParticles.geometry.attributes.position.needsUpdate = true;
      };

      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);

        if (particlesRef.current) {
          particlesRef.current.rotation.y +=
            PARTICLE_CONFIG.ANIMATION.ROTATION_SPEED;
        }

        if (floatingParticlesRef.current) {
          animateFloatingParticles(
            floatingParticlesRef.current,
            floatingParticleCount,
            radius,
          );
        }

        renderer.render(scene, camera);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener("resize", handleResize);

      // Mouse interaction setup
      const setupMouseInteraction = () => {
        const mouse = new THREE.Vector2();
        const handleMouseMove = (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

            // Subtle rotation based on mouse position
            if (particlesRef.current) {
              particlesRef.current.rotation.x = mouse.y * 0.3;
              particlesRef.current.rotation.y = mouse.x * 0.3;
            }
          }
        };
        return handleMouseMove;
      };

      const handleMouseMove = setupMouseInteraction();

      // Store container reference for cleanup
      const currentContainer = containerRef.current;
      currentContainer.addEventListener("mousemove", handleMouseMove);

      // Cleanup function
      return () => {
        try {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }

          window.removeEventListener("resize", handleResize);

          if (currentContainer) {
            currentContainer.removeEventListener("mousemove", handleMouseMove);
            if (renderer.domElement.parentNode) {
              renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
          }

          // Dispose of Three.js resources
          const disposeParticleSystem = (particleSystem: THREE.Points) => {
            if (particleSystem.geometry) {
              particleSystem.geometry.dispose();
            }
            if (particleSystem.material) {
              if (Array.isArray(particleSystem.material)) {
                particleSystem.material.forEach((material) =>
                  material.dispose(),
                );
              } else {
                particleSystem.material.dispose();
              }
            }
          };

          if (particles) {
            disposeParticleSystem(particles);
          }

          if (floatingParticles) {
            disposeParticleSystem(floatingParticles);
          }

          renderer.dispose();
        } catch (error) {
          console.error("Error during ParticleSphere cleanup:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing ParticleSphere:", error);
      return () => {}; // Return empty cleanup function on error
    }
  }, [
    width,
    height,
    particleCount,
    floatingParticleCount,
    radius,
    color,
    animationSpeed,
  ]);

  return (
    <div className="flex flex-col items-center space-y-3">
      <div
        ref={containerRef}
        className="particle-sphere-container"
        style={{
          width,
          height,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      {label && (
        <div
          className="text-center"
          style={{
            width,
            textAlign: "center",
          }}
        >
          <p className="text-muted-foreground text-sm">
            {label}
            <span
              className="inline-block ml-1"
              style={{
                animation: "loadingDot 1.4s infinite",
                animationDelay: "0s",
              }}
            >
              .
            </span>
            <span
              className="inline-block ml-0.5"
              style={{
                animation: "loadingDot 1.4s infinite",
                animationDelay: "0.2s",
              }}
            >
              .
            </span>
            <span
              className="inline-block ml-0.5"
              style={{
                animation: "loadingDot 1.4s infinite",
                animationDelay: "0.4s",
              }}
            >
              .
            </span>
          </p>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @keyframes loadingDot {
                0%, 80%, 100% {
                  transform: translateY(0px);
                  opacity: 0.5;
                }
                40% {
                  transform: translateY(-6px);
                  opacity: 1;
                }
              }
            `,
            }}
          />
        </div>
      )}
    </div>
  );
}

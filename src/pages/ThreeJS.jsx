import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text, OrbitControls, Float } from '@react-three/drei';
import { usePageInit } from '../hooks';
import { useNavigate } from 'react-router-dom';
import VerifyBasboussa from '../components/VerifyBasboussa';
import * as THREE from 'three';
import '../styles/ThreeJS.css';

// Conversation Card Component
function ConversationCard({ message, catImage, position, delay, isActive }) {
  const [visible, setVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    setVisible(true);
  }, [isActive]);
  
  useEffect(() => {
    if (visible && currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(message.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
        setTyping(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else if (currentIndex === message.length) {
      setTyping(false);
    }
  }, [currentIndex, message, visible]);
  
  if (!visible) return null;
  
  return (
    <Html position={position} center>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 150, 57, 0.95), rgba(0, 100, 0, 0.9))',
          padding: '20px 25px',
          borderRadius: '20px',
          maxWidth: 'min(320px, 85vw)',
          minWidth: 'min(250px, 75vw)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 215, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          animation: 'slideInUp 0.5s ease-out',
          fontFamily: '"Inter", sans-serif',
          position: 'relative',
          transition: 'all 0.5s ease-out',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(50px)',
          pointerEvents: isActive ? 'all' : 'none'
        }}
      >
        <div style={{ 
          width: '100%', 
          height: 'clamp(120px, 20vw, 150px)', 
          marginBottom: '15px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <img 
            src={catImage} 
            alt="Sad cat" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
        <div style={{
          color: 'white',
          fontSize: 'clamp(14px, 4vw, 16px)',
          lineHeight: '1.6',
          fontWeight: '500',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          minHeight: '50px'
        }}>
          {displayedText}
          {typing && <span style={{ animation: 'blink 1s infinite' }}>|</span>}
        </div>
      </div>
      <style>
        {`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </Html>
  );
}

// Bouncing Sorry Ball
function SorryBall({ position, color, text, delay = 0 }) {
  const meshRef = useRef();
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime + delay;
    
    if (clicked) {
      meshRef.current.position.y = position[1] + Math.abs(Math.sin(time * 8)) * 2;
      meshRef.current.rotation.x += 0.1;
      meshRef.current.rotation.y += 0.1;
    } else {
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.3;
      meshRef.current.rotation.y = time * 0.5;
    }
    
    if (hovered) {
      meshRef.current.scale.setScalar(1.3);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });
  
  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      <Html position={[position[0], position[1], position[2]]} center>
        <div style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          pointerEvents: 'none',
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          width: '100px'
        }}>
          {text}
        </div>
      </Html>
    </group>
  );
}

// Dancing Emoji Character
function DancingEmoji({ emoji, position, message }) {
  const meshRef = useRef();
  const [showMessage, setShowMessage] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    meshRef.current.position.y = position[1] + Math.sin(time * 3) * 0.2;
    meshRef.current.rotation.z = Math.sin(time * 4) * 0.3;
    meshRef.current.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
  });
  
  return (
    <group ref={meshRef} position={position}>
      <Html center>
        <div
          onClick={() => setShowMessage(!showMessage)}
          style={{
            fontSize: '60px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'transform 0.2s',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          {emoji}
        </div>
        {showMessage && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '15px 20px',
            borderRadius: '20px',
            color: '#333',
            fontWeight: 'bold',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'popIn 0.3s ease-out'
          }}>
            {message}
          </div>
        )}
      </Html>
    </group>
  );
}

// Spinning Apology Text
function SpinningText({ text, position }) {
  const textRef = useRef();
  
  useFrame((state) => {
    if (!textRef.current) return;
    textRef.current.rotation.y = state.clock.elapsedTime;
  });
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.5}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.05}
      outlineColor="#C1272D"
    >
      {text}
    </Text>
  );
}

// Wobbly Heart
function WobblyHeart({ position, onClick }) {
  const meshRef = useRef();
  const [wobble, setWobble] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    
    if (wobble) {
      meshRef.current.rotation.z = Math.sin(time * 10) * 0.5;
      meshRef.current.scale.setScalar(1.5 + Math.sin(time * 10) * 0.3);
    } else {
      meshRef.current.rotation.z = Math.sin(time * 2) * 0.1;
    }
  });
  
  const handleClick = () => {
    setWobble(!wobble);
    if (onClick) onClick();
  };
  
  // Create heart shape
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
  heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
  heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
  heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => (document.body.style.cursor = 'pointer')}
      onPointerOut={(e) => (document.body.style.cursor = 'auto')}
    >
      <extrudeGeometry args={[heartShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1 }]} />
      <meshStandardMaterial
        color="#C1272D"
        emissive="#FFD700"
        emissiveIntensity={wobble ? 0.8 : 0.3}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

// Confetti Particles
function Confetti({ active }) {
  const particlesRef = useRef();
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }
  
  useFrame((state) => {
    if (!particlesRef.current || !active) return;
    particlesRef.current.rotation.y += 0.002;
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= 0.05;
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 5;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (!active) return null;
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors sizeAttenuation />
    </points>
  );
}

// Main Scene
function Scene({ onComplete, onProgressUpdate, showFinalMessage }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  
  const conversations = [
    { 
      catImage: 'https://media.giphy.com/media/BEob5qwFkSJ7G/giphy.gif',
      message: 'Merhaba habibi... Biraz konuşmamız lazım galiba', 
      position: [0, 0, 0] 
    },
    { 
      catImage: 'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
      message: 'Yanlış anlaşılma oldu sanırım... Vallahi kasıtlı değildi', 
      position: [0, 0, 0] 
    },
    { 
      catImage: 'https://media.giphy.com/media/L95W4wv8nnb9K/giphy.gif',
      message: 'İnşallah kalbini kırmamışımdır...', 
      position: [0, 0, 0] 
    },
    { 
      catImage: 'https://media.giphy.com/media/6OWIl75ibpuFO/giphy.gif',
      message: 'Gel bi çay içelim, konuşalım', 
      position: [0, 0, 0] 
    },
    { 
      catImage: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG8zNjM3MDBnemh5aWZ3ajIzazhsN2wxYzJpNmtoaGJjdnA4eTI0dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/M4ecx9P2jI4tq/giphy.gif',
      message: 'Tamam sana kahve... Allah razı olsun 👉👈', 
      position: [0, 0, 0] 
    }
  ];
  
  const handleNextStep = () => {
    if (conversationStep < conversations.length - 1) {
      const nextStep = conversationStep + 1;
      setConversationStep(nextStep);
      // Update progress: each step is worth ~16.67%
      onProgressUpdate(Math.round(((nextStep + 1) / conversations.length) * 100));
    } else {
      setTimeout(() => {
        setShowConfetti(true);
        onComplete();
      }, 500);
    }
  };
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#C1272D" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} color="#009639" />
      
      {/* Background gradient */}
      <mesh position={[0, 0, -10]} scale={[50, 50, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#16213e" />
      </mesh>
      
      {/* Spinning Apology Texts */}
      <SpinningText text="YANLIŞLIK OLDU" position={[0, 3, 0]} />
      <SpinningText text="هبيبي أنا آسف" position={[0, 2.2, 0]} />
      
      {/* Conversation Cards with Cat Photos */}
      {conversations.map((conv, index) => {
        // Only show current card and hide all cards when finished
        if (index === conversationStep && !showFinalMessage) {
          return (
            <group key={index} position={[0, 0, 0]}>
              <ConversationCard
                message={conv.message}
                catImage={conv.catImage}
                position={[0, 0, 0]}
                delay={0}
                isActive={true}
              />
            </group>
          );
        }
        return null;
      })}
      
      {/* Next Button */}
      {conversationStep < conversations.length && (
        <Html position={[0, -2.5, 0]} center>
          <button
            onClick={handleNextStep}
            style={{
              background: 'linear-gradient(135deg, #C1272D, #FFD700)',
              border: 'none',
              padding: 'clamp(12px, 3vw, 15px) clamp(25px, 6vw, 35px)',
              borderRadius: '50px',
              color: 'white',
              fontSize: 'clamp(0.95rem, 4vw, 1.1rem)',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
              fontFamily: '"Inter", sans-serif',
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite',
              minWidth: 'min(200px, 70vw)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
            onTouchStart={(e) => e.target.style.transform = 'scale(0.95)'}
            onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
          >
            {conversationStep < conversations.length - 1 ? 'Devam Et' : 'Bitir'}
          </button>
        </Html>
      )}
      
      {/* Floating Decorative Spheres */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[-4, 2, -2]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
        <mesh position={[4, 1, -3]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial color="#C1272D" emissive="#C1272D" emissiveIntensity={0.3} />
        </mesh>
      </Float>
      
      <Float speed={2.5} rotationIntensity={0.7} floatIntensity={2.5}>
        <mesh position={[0, 3.8, -4]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#009639" emissive="#009639" emissiveIntensity={0.4} />
        </mesh>
      </Float>
      
      {/* Camera controls - Mobile Friendly */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={0.5}
        maxDistance={12}
        minDistance={5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
      />
    </>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <Html center>
      <div style={{
        color: '#feca57',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        textShadow: '0 0 10px rgba(254, 202, 87, 0.8)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>😅</div>
        Hazırlanıyor...
      </div>
    </Html>
  );
}

// Main Component
const ThreeJS = () => {
  usePageInit();
  const navigate = useNavigate();
  const [conversationProgress, setConversationProgress] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  useEffect(() => {
    const verified = sessionStorage.getItem('basboussaVerified');
    if (verified === 'true') {
      setIsVerified(true);
    }
    // Add classes to both body and container
    document.body.classList.add('threejs-active');
    
    // Remove scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.classList.remove('threejs-active');
      document.body.style.overflow = '';
    };
  }, [navigate]);
  
  const handleComplete = () => {
    setConversationProgress(100);
    setTimeout(() => setShowFinalMessage(true), 1000);
  };
  
  const handleProgressUpdate = (progress) => {
    setConversationProgress(progress);
  };

  if (!isVerified) {
    return <VerifyBasboussa />;
  }
  
  return (
    <div style={{ 
      width: '100%',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #2d132c 100%)',
      overflow: 'hidden',
      touchAction: 'pan-x pan-y'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        textAlign: 'center',
        color: 'white',
        fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
        pointerEvents: 'none'
      }}>
        <h1 style={{ 
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
          margin: '0',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'rainbow 3s ease-in-out infinite'
        }}>
            Confused Habibi
        </h1>
        <p style={{ 
          fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', 
          margin: '5px 0',
          fontWeight: '400',
          opacity: '0.9',
          textShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}>
          I think we got our wires crossed �
        </p>
      </div>
      
      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '15px 25px',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center',
        maxWidth: '90%',
        fontFamily: '"Inter", sans-serif',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 215, 0, 0.3)'
      }}>
             </div>
      
      {/* Progress Meter - Mobile Optimized */}
      <div style={{
        position: 'absolute',
        top: 'clamp(100px, 15vh, 120px)',
        right: 'clamp(10px, 3vw, 20px)',
        zIndex: 100,
        background: 'rgba(255, 215, 0, 0.15)',
        padding: 'clamp(12px, 3vw, 16px)',
        borderRadius: '16px',
        minWidth: 'clamp(120px, 25vw, 160px)',
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', fontWeight: '600', color: '#FFD700', marginBottom: '10px', fontFamily: '"Inter", sans-serif', textAlign: 'center' }}>
          🗨️ İlerleme
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: conversationProgress === 100 ? 'linear-gradient(90deg, #009639, #FFD700)' : 'linear-gradient(90deg, #C1272D, #FFD700, #009639)',
            height: '100%',
            width: `${conversationProgress}%`,
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '12px'
          }} />
        </div>
        <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: '700', color: '#FFD700', marginTop: '8px', textAlign: 'center', fontFamily: '"Inter", sans-serif' }}>
          {conversationProgress}%
        </div>
      </div>
      
      {/* Final Message - Mobile Optimized */}
      {showFinalMessage && (
        <>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95), rgba(193, 39, 45, 0.95))',
            padding: 'clamp(30px, 8vw, 48px) clamp(25px, 6vw, 40px)',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(255, 215, 0, 0.4)',
            animation: 'popIn 0.5s ease-out',
            maxWidth: '90%',
            width: 'min(400px, 90vw)',
            border: '3px solid rgba(255, 215, 0, 0.8)',
            fontFamily: '"Inter", sans-serif'
          }}>
            <div style={{ fontSize: 'clamp(3rem, 10vw, 4rem)', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#fff', margin: '10px 0', fontSize: 'clamp(1.3rem, 5vw, 2rem)', fontWeight: '700', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              Maşallah! Barıştık!
            </h2>
            <p style={{ color: '#fff', fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', lineHeight: '1.6', fontWeight: '400', marginTop: '16px', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              Allah razı olsun ya habibi!<br/>
              İnşallah bir daha yanlış anlaşılma olmaz
            </p>
          </div>
          <Confetti active={true} />
        </>
      )}

      {/* 3D Canvas - Mobile Optimized */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <Scene 
            onComplete={handleComplete} 
            onProgressUpdate={handleProgressUpdate}
            showFinalMessage={showFinalMessage}
          />
        </Suspense>
      </Canvas>
      
      <style>
        {`
          @keyframes popIn {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
          
          @keyframes rainbow {
            0%, 100% { color: #ff6b9d; }
            33% { color: #feca57; }
            66% { color: #54a0ff; }
          }
        `}
      </style>
    </div>
  );
};

export default ThreeJS;

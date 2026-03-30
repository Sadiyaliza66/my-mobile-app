/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Upload, Eye, Info, Smartphone } from 'lucide-react';

// A default eye texture URL
const DEFAULT_EYE_TEXTURE = 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1024&auto=format&fit=crop';

function CurvedEyeImage({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState<number>(1);

  useEffect(() => {
    if (!imageUrl) return;
    
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        // High quality texture filtering for maximum clarity and enhancement
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        
        const imgAspect = tex.image.width / tex.image.height;
        setAspect(imgAspect);
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error('Error loading texture:', err);
      }
    );
  }, [imageUrl]);

  // Create a custom geometry with a very natural, subtle curve (Gaussian curve)
  const geometry = useMemo(() => {
    const width = 8;
    const height = 8 / aspect;
    
    // High segment count for a perfectly smooth surface
    const geo = new THREE.PlaneGeometry(width, height, 128, 128);
    const pos = geo.attributes.position;
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      // Gaussian curve: Bulges smoothly in the center (cornea) and flattens at the edges
      // This creates the exact "halki si curve" (slight curve) of a live eye.
      const z = 0.6 * Math.exp(-(x * x + y * y) / 5.0);
      pos.setZ(i, z);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [aspect]);

  // Restored the nice, natural "looking around" movement
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = Math.sin(time * 1.0) * 0.02;
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.08; // Slightly more noticeable left/right
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.04; // Slightly more noticeable up/down
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        map={texture}
        roughness={0.9} // High roughness so we don't get artificial shiny spots blocking the pupil
        metalness={0.0} // Keep colors 100% natural and clear
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<string>(DEFAULT_EYE_TEXTURE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Eye className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Realistic 3D Eye Generator</h1>
            <p className="text-xs text-neutral-400">College Project Showcase</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Controls & Info */}
        <div className="space-y-6 lg:col-span-1 flex flex-col">
          
          {/* Upload Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Upload Eye Image
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              Upload any 2D photo of an eye. The app will apply a natural, slight curve (cornea bulge) while preserving 100% of your original image details.
            </p>
            
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Select Image
            </button>
          </div>

          {/* Project Info Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex-1">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-purple-400" />
              How it works
            </h2>
            <ul className="space-y-4 text-sm text-neutral-300">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">1</div>
                <p><strong>Natural Curve:</strong> We use a Gaussian curve that gently bulges the iris/cornea while keeping the eyelids flat, just like a real eye.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">2</div>
                <p><strong>Original Texture Preserved:</strong> Artificial lights and reflections are removed so the natural pupil and cornea details from your photo remain exactly as they are.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">3</div>
                <p><strong>Lifelike Movement:</strong> The eye features a subtle, continuous "looking around" animation to feel alive.</p>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl flex gap-3 items-start">
              <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200 leading-relaxed">
                <strong>Tip:</strong> Drag the image in the viewer to rotate it. Notice how the center bulges out slightly, giving it a lifelike 3D depth!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Canvas */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden relative min-h-[500px] shadow-2xl">
          {/* Overlay UI */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live 3D Render
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center z-10 pointer-events-none">
            <p className="text-sm text-white/50 bg-black/40 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
              Drag to rotate • Scroll to zoom
            </p>
          </div>

          {/* Three.js Canvas */}
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <color attach="background" args={['#0a0a0a']} />
            
            {/* Very bright ambient light so the original image colors and pupil details are 100% visible */}
            <ambientLight intensity={3.0} />
            
            {/* Very soft directional light just to give the 3D curve a tiny bit of depth, without washing out the image */}
            <directionalLight position={[0, 0, 5]} intensity={0.5} />
            
            <CurvedEyeImage imageUrl={uploadedImage} />
            
            {/* Orbit controls restricted so you don't look at the back of the image */}
            <OrbitControls 
              enablePan={false}
              minDistance={3}
              maxDistance={10}
              minAzimuthAngle={-Math.PI / 4}
              maxAzimuthAngle={Math.PI / 4}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI * 2/3}
            />
            
            {/* Soft shadow underneath */}
            <ContactShadows 
              position={[0, -3.5, 0]} 
              opacity={0.6} 
              scale={15} 
              blur={2.5} 
              far={4} 
            />
          </Canvas>
        </div>

      </main>
    </div>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

interface RiverCrossSectionProps {
  data: {
    distance: number;
    depth: number;
    velocity?: number;
  }[];
  maxDepth?: number;
  maxDistance?: number;
  width?: number;
  height?: number;
  animate?: boolean;
  delay?: number;
}

const RiverCrossSection = ({
  data,
  maxDepth,
  maxDistance,
  width = 1000,
  height = 500,
  animate = true,
  delay = 0
}: RiverCrossSectionProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showVelocityFlow, setShowVelocityFlow] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'depth' | 'velocity'>('depth');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Compute max values if not provided
  const computedMaxDepth = maxDepth || Math.max(...data.map(d => d.depth)) * 1.2;
  const computedMaxDistance = maxDistance || Math.max(...data.map(d => d.distance));
  const maxVelocity = Math.max(...data.map(d => d.velocity || 0));
  
  // Sort data by distance to ensure proper rendering
  const sortedData = [...data].sort((a, b) => a.distance - b.distance);

  // Initialize 3D scene
  useEffect(() => {
    if (activeView !== '3d' || !mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create river geometry
    const riverGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const uvs = [];

    // Create vertices for river surface and bottom
    for (let i = 0; i < sortedData.length - 1; i++) {
      const current = sortedData[i];
      const next = sortedData[i + 1];
      
      const x1 = (current.distance / computedMaxDistance) * 20 - 10;
      const x2 = (next.distance / computedMaxDistance) * 20 - 10;
      const y1 = 0; // Surface
      const y2 = -current.depth / 2;
      const y3 = -next.depth / 2;

      // Two triangles for each section
      vertices.push(
        x1, y1, 0,  // Surface left
        x2, y1, 0,  // Surface right
        x1, y2, 0,  // Bottom left
        
        x2, y1, 0,  // Surface right
        x2, y3, 0,  // Bottom right
        x1, y2, 0   // Bottom left
      );

      // Color based on depth or velocity
      for (let j = 0; j < 6; j++) {
        if (selectedMetric === 'depth') {
          const avgDepth = (current.depth + next.depth) / 2;
          const intensity = avgDepth / computedMaxDepth;
          colors.push(0.5 + intensity * 0.5, 0.8 - intensity * 0.3, 1.0, 1.0);
        } else {
          const avgVelocity = ((current.velocity || 0) + (next.velocity || 0)) / 2;
          const intensity = avgVelocity / maxVelocity;
          colors.push(1.0 - intensity * 0.5, 0.8, 0.5 + intensity * 0.5, 1.0);
        }
      }

      // UV coordinates
      uvs.push(
        i / (sortedData.length - 1), 1,
        (i + 1) / (sortedData.length - 1), 1,
        i / (sortedData.length - 1), 0,
        
        (i + 1) / (sortedData.length - 1), 1,
        (i + 1) / (sortedData.length - 1), 0,
        i / (sortedData.length - 1), 0
      );
    }

    riverGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    riverGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    riverGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    // River material
    const riverMaterial = new THREE.MeshPhongMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const riverMesh = new THREE.Mesh(riverGeometry, riverMaterial);
    scene.add(riverMesh);

    // Add velocity arrows if available
    if (showVelocityFlow && sortedData.some(d => d.velocity)) {
      const arrowGroup = new THREE.Group();
      
      sortedData.forEach((point, index) => {
        if (point.velocity && index < sortedData.length - 1) {
          const x = (point.distance / computedMaxDistance) * 20 - 10;
          const y = -point.depth / 4; // Middle of water column
          
          const arrowGeometry = new THREE.ConeGeometry(0.1, point.velocity * 0.5, 8);
          const arrowMaterial = new THREE.MeshPhongMaterial({
            color: point.velocity > 1 ? 0xff6b6b : point.velocity > 0.5 ? 0x4ecdc4 : 0x45b7d1
          });
          
          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
          arrow.position.set(x, y, 0);
          arrow.rotation.z = -Math.PI / 2;
          arrowGroup.add(arrow);
        }
      });
      
      scene.add(arrowGroup);
    }

    // Animation loop
    const animate3D = () => {
      animationIdRef.current = requestAnimationFrame(animate3D);
      
      // Rotate camera around the river
      const time = Date.now() * 0.0005;
      camera.position.x = Math.cos(time) * 15;
      camera.position.z = Math.sin(time) * 15;
      camera.lookAt(0, -2, 0);
      
      renderer.render(scene, camera);
    };
    
    animate3D();

    // Cleanup function
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeView, sortedData, selectedMetric, showVelocityFlow, computedMaxDepth, computedMaxDistance, maxVelocity]);

  // 2D Canvas rendering with enhanced interactivity
  useEffect(() => {
    if (activeView !== '2d') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced grid with animation
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    
    const gridSpacing = 50;
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Modern axis labels
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    
    // X-axis
    const xSteps = 8;
    for (let i = 0; i <= xSteps; i++) {
      const x = (i / xSteps) * canvas.width;
      const value = (i / xSteps) * computedMaxDistance;
      ctx.fillText(`${value.toFixed(1)}m`, x - 15, canvas.height - 10);
    }
    
    // Y-axis
    const ySteps = 6;
    for (let i = 0; i <= ySteps; i++) {
      const y = (i / ySteps) * canvas.height;
      const value = ((ySteps - i) / ySteps) * computedMaxDepth;
      ctx.fillText(`${value.toFixed(1)}m`, 10, y + 4);
    }
    
    // Enhanced title
    ctx.font = 'bold 18px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('Interactive River Cross Section', canvas.width / 2, 30);
    
    // Draw river with enhanced gradients
    if (sortedData.length < 2) return;
    
    // Create dynamic water gradient based on selected metric
    const waterGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    if (selectedMetric === 'depth') {
      waterGradient.addColorStop(0, 'rgba(56, 178, 172, 0.1)');
      waterGradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.3)');
      waterGradient.addColorStop(1, 'rgba(30, 64, 175, 0.6)');
    } else {
      waterGradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
      waterGradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.3)');
      waterGradient.addColorStop(1, 'rgba(239, 68, 68, 0.6)');
    }
    
    // Draw river bottom with smooth curves
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    const firstPoint = sortedData[0];
    const firstX = (firstPoint.distance / computedMaxDistance) * canvas.width;
    const firstY = (firstPoint.depth / computedMaxDepth) * canvas.height;
    ctx.lineTo(firstX, firstY);
    
    // Smooth river bottom with bezier curves
    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i];
      const prev = sortedData[i - 1];
      
      const currentX = (current.distance / computedMaxDistance) * canvas.width;
      const currentY = (current.depth / computedMaxDepth) * canvas.height;
      const prevX = (prev.distance / computedMaxDistance) * canvas.width;
      const prevY = (prev.depth / computedMaxDepth) * canvas.height;
      
      const cp1X = prevX + (currentX - prevX) * 0.3;
      const cp1Y = prevY;
      const cp2X = currentX - (currentX - prevX) * 0.3;
      const cp2Y = currentY;
      
      ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, currentX, currentY);
    }
    
    const lastPoint = sortedData[sortedData.length - 1];
    const lastX = (lastPoint.distance / computedMaxDistance) * canvas.width;
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    
    // River bed gradient
    const bedGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
    bedGradient.addColorStop(0, 'rgba(120, 113, 108, 0.3)');
    bedGradient.addColorStop(1, 'rgba(87, 83, 78, 0.5)');
    ctx.fillStyle = bedGradient;
    ctx.fill();
    
    // Draw water
    ctx.beginPath();
    ctx.moveTo(0, 0);
    
    for (let i = 0; i < sortedData.length; i++) {
      const point = sortedData[i];
      const x = (point.distance / computedMaxDistance) * canvas.width;
      const y = (point.depth / computedMaxDepth) * canvas.height;
      
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prev = sortedData[i - 1];
        const prevX = (prev.distance / computedMaxDistance) * canvas.width;
        const prevY = (prev.depth / computedMaxDepth) * canvas.height;
        
        const cp1X = prevX + (x - prevX) * 0.3;
        const cp1Y = prevY;
        const cp2X = x - (x - prevX) * 0.3;
        const cp2Y = y;
        
        ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x, y);
      }
    }
    
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    
    ctx.fillStyle = waterGradient;
    ctx.fill();
    
    // Enhanced velocity arrows with animation
    if (showVelocityFlow) {
      const time = Date.now() * 0.003;
      
      sortedData.forEach((point, index) => {
        if (point.velocity && index < sortedData.length - 1) {
          const x = (point.distance / computedMaxDistance) * canvas.width;
          const surfaceY = 0;
          const bottomY = (point.depth / computedMaxDepth) * canvas.height;
          const arrowY = surfaceY + (bottomY - surfaceY) * 0.3;
          
          const normalizedVelocity = point.velocity / maxVelocity;
          const arrowLength = normalizedVelocity * 30 + 10;
          
          // Animated arrow position
          const animOffset = Math.sin(time + index * 0.5) * 5;
          
          // Color based on velocity
          let arrowColor;
          if (point.velocity < 0.5) {
            arrowColor = '#10b981'; // emerald-500
          } else if (point.velocity < 1.5) {
            arrowColor = '#f59e0b'; // amber-500
          } else {
            arrowColor = '#ef4444'; // red-500
          }
          
          // Draw arrow with glow effect
          ctx.save();
          ctx.shadowColor = arrowColor;
          ctx.shadowBlur = 10;
          
          ctx.beginPath();
          ctx.moveTo(x - arrowLength + animOffset, arrowY);
          ctx.lineTo(x + animOffset, arrowY);
          ctx.strokeStyle = arrowColor;
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Arrow head
          ctx.beginPath();
          ctx.moveTo(x + animOffset, arrowY);
          ctx.lineTo(x - 8 + animOffset, arrowY - 4);
          ctx.lineTo(x - 8 + animOffset, arrowY + 4);
          ctx.closePath();
          ctx.fillStyle = arrowColor;
          ctx.fill();
          
          ctx.restore();
        }
      });
    }
    
    // Interactive points
    sortedData.forEach((point, index) => {
      const x = (point.distance / computedMaxDistance) * canvas.width;
      const y = (point.depth / computedMaxDepth) * canvas.height;
      
      // Highlight hovered point
      if (hoveredPoint === index) {
        ctx.save();
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
    });
    
    // Draw animated water surface
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    const waveAmplitude = 2;
    const waveFrequency = 0.02;
    const waveSpeed = Date.now() * 0.002;
    
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 2) {
      const y = Math.sin(x * waveFrequency + waveSpeed) * waveAmplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    
  }, [activeView, sortedData, computedMaxDepth, computedMaxDistance, selectedMetric, showVelocityFlow, hoveredPoint, maxVelocity]);

  // Mouse interaction for 2D view
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeView !== '2d') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find closest point
    let closestIndex = -1;
    let closestDistance = Infinity;
    
    sortedData.forEach((point, index) => {
      const pointX = (point.distance / computedMaxDistance) * canvas.width;
      const pointY = (point.depth / computedMaxDepth) * canvas.height;
      
      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);
      if (distance < 20 && distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    
    setHoveredPoint(closestIndex === -1 ? null : closestIndex);
  };

  const hasVelocityData = sortedData.some(d => d.velocity !== undefined);

  return (
    <motion.div
      className="relative bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
      initial={animate ? { opacity: 0, y: 20 } : { opacity: 1 }}
      animate={animate ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {/* Header Controls */}
      <motion.div 
        className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-slate-800">
            River Cross Section Analysis
          </h2>
          
          {/* View Toggle */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveView('2d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === '2d'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              2D View
            </button>
            <button
              onClick={() => setActiveView('3d')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeView === '3d'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              3D View
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-6 text-sm">
          {hasVelocityData && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-slate-600">Metric:</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as 'depth' | 'velocity')}
                  className="px-3 py-1 rounded-md border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="depth">Depth</option>
                  <option value="velocity">Velocity</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={showVelocityFlow}
                  onChange={(e) => setShowVelocityFlow(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show Flow Arrows
              </label>
            </>
          )}
          
          <div className="flex items-center gap-2 text-slate-500">
            <span>Max Depth: <strong className="text-blue-600">{computedMaxDepth.toFixed(2)}m</strong></span>
            <span>•</span>
            <span>Width: <strong className="text-emerald-600">{computedMaxDistance.toFixed(2)}m</strong></span>
          </div>
        </div>
      </motion.div>

      {/* Chart Area */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: delay + 0.3 }}
      >
        {activeView === '2d' ? (
          <canvas 
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ) : (
          <div 
            ref={mountRef}
            style={{ width: '100%', height: `${height}px` }}
            className="bg-gradient-to-b from-slate-50 to-slate-100"
          />
        )}
        
        {/* Tooltip */}
        <AnimatePresence>
          {hoveredPoint !== null && activeView === '2d' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4 min-w-48"
            >
              <div className="text-sm">
                <div className="font-semibold text-slate-800 mb-2">
                  Point {hoveredPoint + 1}
                </div>
                <div className="space-y-1 text-slate-600">
                  <div>Distance: <strong>{sortedData[hoveredPoint].distance.toFixed(2)}m</strong></div>
                  <div>Depth: <strong>{sortedData[hoveredPoint].depth.toFixed(2)}m</strong></div>
                  {sortedData[hoveredPoint].velocity !== undefined && (
                    <div>Velocity: <strong>{sortedData[hoveredPoint].velocity!.toFixed(2)}m/s</strong></div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Legend */}
      {hasVelocityData && (
        <motion.div 
          className="px-6 py-3 bg-slate-50 border-t border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.4 }}
        >
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-600">Velocity Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Slow (&lt;0.5 m/s)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Medium (0.5-1.5 m/s)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Fast (&gt;1.5 m/s)</span>
              </div>
            </div>
            <span className="text-slate-500">
              {activeView === '2d' ? 'Hover over points for details' : 'Auto-rotating 3D view'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Demo component with realistic river data
const DemoRiverCrossSection = () => {
  const sampleData = [
    { distance: 0, depth: 0.2, velocity: 0.1 },
    { distance: 2, depth: 1.5, velocity: 0.8 },
    { distance: 5, depth: 3.2, velocity: 1.2 },
    { distance: 8, depth: 4.8, velocity: 1.8 },
    { distance: 12, depth: 6.1, velocity: 2.1 },
    { distance: 15, depth: 5.9, velocity: 1.9 },
    { distance: 18, depth: 4.2, velocity: 1.5 },
    { distance: 22, depth: 2.8, velocity: 1.0 },
    { distance: 25, depth: 1.1, velocity: 0.6 },
    { distance: 28, depth: 0.3, velocity: 0.2 }
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <RiverCrossSection 
          data={sampleData}
          width={1000}
          height={500}
          animate={true}
          delay={0}
        />
        
        {/* Additional Info Panel */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {sampleData.reduce((sum, point) => sum + point.depth, 0) / sampleData.length}m
              </div>
              <div className="text-sm text-slate-600">Average Depth</div>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-emerald-600">
                {(sampleData.reduce((sum, point) => sum + (point.velocity || 0), 0) / sampleData.length).toFixed(2)}m/s
              </div>
              <div className="text-sm text-slate-600">Average Velocity</div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-amber-600">
                {Math.max(...sampleData.map(p => p.depth)).toFixed(1)}m
              </div>
              <div className="text-sm text-slate-600">Maximum Depth</div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-slate-600">
            <p>
              This interactive river cross-section visualization shows depth and velocity variations across the channel width.
              The 3D view provides an immersive perspective while the 2D view offers precise measurements and interactive data points.
              Flow arrows indicate water velocity magnitude and direction, with color coding for easy interpretation.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoRiverCrossSection;
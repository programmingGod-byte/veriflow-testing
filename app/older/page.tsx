"use client"
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Mock data based on the provided images
const riverData = {
  flowDirection: 62.5,
  sections: [
    { id: 1, velocity: 0.1508, discharge: 0.01, percentage: 0.8 },
    { id: 2, velocity: 0.1619, discharge: 0.02, percentage: 1.6 },
    { id: 3, velocity: 0.3205, discharge: 0.06, percentage: 4.8 },
    { id: 4, velocity: 0.6571, discharge: 0.13, percentage: 10.5 },
    { id: 5, velocity: 0.8939, discharge: 0.17, percentage: 13.7 },
    { id: 6, velocity: 1.7368, discharge: 0.35, percentage: 28.2 },
    { id: 7, velocity: 1.2910, discharge: 0.27, percentage: 21.8 },
    { id: 8, velocity: 0.7755, discharge: 0.13, percentage: 10.5 },
    { id: 9, velocity: 0.5315, discharge: 0.06, percentage: 4.8 },
    { id: 10, velocity: 0.3997, discharge: 0.02, percentage: 1.6 }
  ],
  totalDischarge: 1.24
};

// Mock time-series data
const timeSeriesData = [
  { date: '2025-04-14', discharge: 0.95 },
  { date: '2025-04-15', discharge: 1.02 },
  { date: '2025-04-16', discharge: 1.15 },
  { date: '2025-04-17', discharge: 1.28 },
  { date: '2025-04-18', discharge: 1.19 },
  { date: '2025-04-19', discharge: 1.22 },
  { date: '2025-04-20', discharge: 1.24 }
];

const waterLevelData = {
  currentLevel: 2.8,
  maxLevel: 5.0,
  dangerLevel: 4.0,
  warningLevel: 3.5,
  normalLevel: 2.0,
  location: 'Main River Channel',
  lastUpdated: new Date().toLocaleString()
};

// 3D River Cross-Section Component
function River3DVisualization({ flowDirection, sections }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1c);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point lights for dramatic effect
    const blueLight = new THREE.PointLight(0x4f46e5, 1, 20);
    blueLight.position.set(-8, 5, 0);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1, 20);
    cyanLight.position.set(8, 5, 0);
    scene.add(cyanLight);

    // Create river bed
    const riverBedGeometry = new THREE.PlaneGeometry(20, 8);
    const riverBedMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d3748,
      transparent: true,
      opacity: 0.8
    });
    const riverBed = new THREE.Mesh(riverBedGeometry, riverBedMaterial);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.y = -1;
    riverBed.receiveShadow = true;
    scene.add(riverBed);

    // Create water sections with varying heights based on velocity
    const sectionGroup = new THREE.Group();
    const maxVelocity = Math.max(...sections.map(s => s.velocity));
    
    sections.forEach((section, index) => {
      const x = (index - sections.length / 2) * 1.8;
      const height = (section.velocity / maxVelocity) * 4 + 0.5;
      const width = 1.5;
      const depth = 6;

      // Water section geometry
      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      // Color based on velocity (blue to cyan gradient)
      const velocityRatio = section.velocity / maxVelocity;
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x1e40af), // Deep blue
        new THREE.Color(0x06b6d4), // Cyan
        velocityRatio
      );

      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        specular: 0x4fc3f7
      });

      const waterSection = new THREE.Mesh(geometry, material);
      waterSection.position.set(x, height / 2 - 0.5, 0);
      waterSection.castShadow = true;
      waterSection.receiveShadow = true;
      
      sectionGroup.add(waterSection);

      // Add floating particles for flow effect
      const particleCount = Math.floor(section.velocity * 10) + 5;
      const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
      });

      for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
          x + (Math.random() - 0.5) * width,
          height / 2 + Math.random() * 2,
          (Math.random() - 0.5) * depth
        );
        particle.userData = { 
          initialY: particle.position.y,
          speed: section.velocity * 0.1 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2
        };
        sectionGroup.add(particle);
      }
    });

    scene.add(sectionGroup);

    // Flow direction arrow
    const arrowGroup = new THREE.Group();
    const arrowGeometry = new THREE.ConeGeometry(0.3, 1.5, 8);
    const arrowMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff6b35,
      emissive: 0x331100
    });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.z = -Math.PI / 2;
    arrow.position.set(0, 3, 0);
    arrowGroup.add(arrow);

    // Arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(-1, 3, 0);
    arrowGroup.add(shaft);

    arrowGroup.rotation.y = (flowDirection * Math.PI) / 180;
    scene.add(arrowGroup);

    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      
      // Animate particles
      scene.traverse((object) => {
        if (object.userData && object.userData.speed) {
          object.position.y = object.userData.initialY + 
            Math.sin(Date.now() * 0.001 * object.userData.speed + object.userData.phase) * 0.5;
          object.position.z += object.userData.speed * 0.1;
          if (object.position.z > 4) object.position.z = -4;
        }
      });

      // Rotate the scene slowly
      sectionGroup.rotation.y = Math.sin(Date.now() * 0.0005) * 0.1;
      
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [flowDirection, sections]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-96 rounded-xl overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    />
  );
}

// 3D Discharge Contribution Pie Chart
function Discharge3DPieChart({ data, totalDischarge }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1c);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create 3D pie segments
    const pieGroup = new THREE.Group();
    let currentAngle = 0;
    const radius = 3;
    const height = 0.8;
    const colors = [
      0x4f46e5, 0x7c3aed, 0xdb2777, 0xe11d48, 0xf59e0b,
      0x10b981, 0x06b6d4, 0x3b82f6, 0x8b5cf6, 0xf97316
    ];

    data.forEach((section, index) => {
      const angle = (section.percentage / 100) * Math.PI * 2;
      const segmentHeight = height + (section.discharge / totalDischarge) * 2;
      
      // Create segment geometry
      const geometry = new THREE.CylinderGeometry(radius, radius, segmentHeight, 32, 1, false, currentAngle, angle);
      
      const material = new THREE.MeshPhongMaterial({
        color: colors[index % colors.length],
        transparent: true,
        opacity: 0.9,
        shininess: 100
      });

      const segment = new THREE.Mesh(geometry, material);
      segment.position.y = segmentHeight / 2;
      segment.castShadow = true;
      segment.receiveShadow = true;
      
      // Add hover effect data
      segment.userData = {
        originalY: segmentHeight / 2,
        section: section,
        color: colors[index % colors.length]
      };

      pieGroup.add(segment);
      currentAngle += angle;

      // Add glowing edges
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.3 
      });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.position.y = segmentHeight / 2;
      pieGroup.add(edges);
    });

    scene.add(pieGroup);

    // Add floating indicator spheres for labels
    let labelAngle = 0;
    data.forEach((section, index) => {
      const angle = (section.percentage / 100) * Math.PI * 2;
      const midAngle = labelAngle + angle / 2;
      const labelRadius = radius + 1.5;
      
      const labelGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        color: colors[index % colors.length],
        emissive: colors[index % colors.length],
        emissiveIntensity: 0.3
      });
      
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(
        Math.cos(midAngle) * labelRadius,
        1,
        Math.sin(midAngle) * labelRadius
      );
      
      scene.add(label);
      labelAngle += angle;
    });

    // Animation loop
    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      
      // Rotate pie chart
      pieGroup.rotation.y += 0.005;
      
      // Gentle floating animation
      pieGroup.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef.current && renderer) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [data, totalDischarge]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-96 rounded-xl overflow-hidden shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    />
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, unit, icon, change, color, delay = 0 }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25'
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-xl p-6 text-white opacity-0 animate-[fadeInUp_0.5s_ease-out_${delay}s_forwards]`}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold">
              {typeof value === 'number' ? value.toFixed(2) : value}{' '}
              <span className="text-lg font-normal text-white/90">{unit}</span>
            </p>
            {change && (
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  change.trend === 'up' ? 'text-green-200' : 
                  change.trend === 'down' ? 'text-red-200' : 'text-white/70'
                }`}>
                  {change.trend === 'up' ? '↗' : change.trend === 'down' ? '↘' : '→'} {change.value}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Water Level Indicator
function WaterLevelIndicator({ currentLevel, maxLevel, dangerLevel, warningLevel, normalLevel }) {
  const percentage = (currentLevel / maxLevel) * 100;
  
  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="relative w-16 h-64 bg-gradient-to-t from-slate-800 to-slate-600 rounded-full shadow-inner overflow-hidden">
        {/* Water fill */}
        <div
          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-300 rounded-full transition-all duration-1000 ease-out"
          style={{
            height: `${percentage}%`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
        
        {/* Level markers */}
        <div className="absolute inset-0">
          {[
            { level: dangerLevel, color: 'bg-red-500', label: 'Danger' },
            { level: warningLevel, color: 'bg-yellow-500', label: 'Warning' },
            { level: normalLevel, color: 'bg-green-500', label: 'Normal' }
          ].map(({ level, color, label }) => (
            <div
              key={label}
              className={`absolute w-full h-0.5 ${color}`}
              style={{ bottom: `${(level / maxLevel) * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-2xl font-bold text-slate-700">{currentLevel.toFixed(1)}m</p>
        <p className="text-sm text-slate-500">Current Level</p>
        <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {currentLevel >= dangerLevel ? 'DANGER' : 
          currentLevel >= warningLevel ? 'WARNING' : 'NORMAL'}
        </div>
      </div>
    </div>
  );
}

// Simple chart components
function VelocityChart({ data }) {
  return (
    <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 flex items-end justify-around">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="w-8 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg shadow-lg transition-all duration-[800ms]"
            style={{ 
              height: `${(item.velocity / Math.max(...data.map(d => d.velocity))) * 200}px`,
              animationDelay: `${index * 100}ms`
            }}
          />
          <span className="text-xs mt-2 text-slate-600">{item.section}</span>
        </div>
      ))}
    </div>
  );
}

function DischargeBarChart({ data }) {
  return (
    <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 flex items-end justify-around">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="w-8 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-lg shadow-lg transition-all duration-[800ms]"
            style={{ 
              height: `${(item.value / Math.max(...data.map(d => d.value))) * 200}px`,
              animationDelay: `${index * 100}ms`
            }}
          />
          <span className="text-xs mt-2 text-slate-600 transform -rotate-45 origin-center">
            {item.day.replace('Section ', 'S')}
          </span>
        </div>
      ))}
    </div>
  );
}

function DischargeGraph({ data }) {
  return (
    <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 flex items-end justify-around">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="w-8 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg shadow-lg transition-all duration-[800ms]"
            style={{ 
              height: `${(item.discharge / Math.max(...data.map(d => d.discharge))) * 200}px`,
              animationDelay: `${index * 100}ms`
            }}
          />
          <span className="text-xs mt-2 text-slate-600 transform -rotate-45 origin-center">
            {item.date.split('-')[2]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RealtimeDataPage() {
  const [data, setData] = useState(riverData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dischargeHistory, setDischargeHistory] = useState(timeSeriesData);

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      setData(prevData => {
        const newData = {
          ...prevData,
          sections: prevData.sections.map(section => ({
            ...section,
            velocity: section.velocity * (0.95 + Math.random() * 0.1),
            discharge: section.discharge * (0.95 + Math.random() * 0.1)
          }))
        };
        
        const newTotal = newData.sections.reduce((sum, section) => sum + section.discharge, 0);
        newData.totalDischarge = parseFloat(newTotal.toFixed(2));
        
        newData.sections = newData.sections.map(section => ({
          ...section,
          percentage: parseFloat(((section.discharge / newTotal) * 100).toFixed(1))
        }));
        
        return newData;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setData(prevData => {
        const newData = {
          ...prevData,
          sections: prevData.sections.map(section => ({
            ...section,
            velocity: section.velocity * (0.9 + Math.random() * 0.2),
            discharge: section.discharge * (0.9 + Math.random() * 0.2)
          }))
        };
        
        const newTotal = newData.sections.reduce((sum, section) => sum + section.discharge, 0);
        newData.totalDischarge = parseFloat(newTotal.toFixed(2));
        
        newData.sections = newData.sections.map(section => ({
          ...section,
          percentage: parseFloat(((section.discharge / newTotal) * 100).toFixed(1))
        }));
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        setDischargeHistory(prev => {
          const updated = prev.length >= 7 ? [...prev.slice(1)] : [...prev];
          return [...updated, { date: dateStr, discharge: newData.totalDischarge }];
        });
        
        return newData;
      });
      
      setCurrentTime(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  const velocityData = data.sections.map(section => ({
    section: section.id,
    velocity: section.velocity
  }));

  const dischargeData = data.sections.map(section => ({
    day: `Section ${section.id}`,
    value: section.discharge
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        {/* Enhanced header with glassmorphism */}
        <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent sm:text-5xl opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]">
                Real-Time River Data
              </h1>
              
              <div className="flex items-center mt-4 sm:mt-0 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                <span className="text-white/80 text-sm mr-4 backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
                  Last updated: {formatTime(currentTime)}
                </span>
                <button
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className={`relative overflow-hidden px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'
                  }`}
                >
                  <div className="relative z-10 flex items-center">
                    {isRefreshing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Refreshing...
                        </>
                    ) : (
                      <>
                        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                      </>
                    )}
                  </div>
                  {isRefreshing && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse rounded-xl"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Discharge" 
            value={data.totalDischarge} 
            unit="m³/s"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            change={{ value: 2.3, trend: 'up' }}
            color="blue"
            delay={0.1}
          />
          
          <StatCard 
            title="Max Velocity" 
            value={Math.max(...data.sections.map(s => s.velocity))} 
            unit="m/s"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            change={{ value: 1.8, trend: 'up' }}
            color="cyan"
            delay={0.2}
          />
          
          <StatCard 
            title="Flow Direction" 
            value={data.flowDirection} 
            unit="degrees"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            }
            change={{ value: 0, trend: 'neutral' }}
            color="purple"
            delay={0.3}
          />
          
          <StatCard 
            title="Channel Width" 
            value="5.43" 
            unit="meters"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            }
            color="green"
            delay={0.4}
          />
        </div>

        {/* River visualization and water level */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards]">
          <div className="lg:col-span-3">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                3D River Cross-Section
              </h2>
              <River3DVisualization 
                flowDirection={data.flowDirection} 
                sections={data.sections}
              />
              <div className="mt-4 text-sm text-white/70 backdrop-blur-sm bg-white/5 p-3 rounded-xl">
                Interactive 3D visualization showing river cross-section with real-time flow velocities. 
                The arrow indicates primary flow direction. Particle effects represent water movement.
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl h-full">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Water Level Monitor
              </h2>
              <div className="flex items-center justify-center h-80">
                <WaterLevelIndicator 
                  currentLevel={waterLevelData.currentLevel}
                  maxLevel={waterLevelData.maxLevel}
                  dangerLevel={waterLevelData.dangerLevel}
                  warningLevel={waterLevelData.warningLevel}
                  normalLevel={waterLevelData.normalLevel}
                />
              </div>
              <div className="mt-4 text-xs text-white/60 backdrop-blur-sm bg-white/5 p-2 rounded-lg">
                Location: {waterLevelData.location}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Discharge Pie Chart */}
        <div className="opacity-0 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards]">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              3D Discharge Distribution
            </h2>
            <Discharge3DPieChart data={data.sections} totalDischarge={data.totalDischarge} />
            <div className="mt-4 text-sm text-white/70 backdrop-blur-sm bg-white/5 p-3 rounded-xl">
              Interactive 3D pie chart showing discharge contribution from each river section. 
              Segment heights represent relative discharge volumes.
            </div>
          </div>
        </div>

        {/* Discharge Over Time */}
        <div className="opacity-0 animate-[fadeInUp_0.5s_ease-out_0.5s_forwards]">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Discharge Trends
            </h2>
            <DischargeGraph data={dischargeHistory} />
            <div className="mt-4 text-sm text-white/70 backdrop-blur-sm bg-white/5 p-3 rounded-xl">
              Historical discharge measurements over the past week. Trend analysis helps predict potential flooding conditions.
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.6s_forwards]">
          {/* Velocity Profile */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Velocity Profile
            </h2>
            <VelocityChart data={velocityData} />
            <div className="mt-4 text-sm text-white/70 backdrop-blur-sm bg-white/5 p-3 rounded-xl">
              Velocity distribution across river sections. Higher velocities typically occur in the central channel.
            </div>
          </div>

          {/* Section Discharge */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Section Discharge
            </h2>
            <DischargeBarChart data={dischargeData} />
            <div className="mt-4 text-sm text-white/70 backdrop-blur-sm bg-white/5 p-3 rounded-xl">
              Individual discharge values for each river section based on cross-sectional area and flow velocity.
            </div>
          </div>
        </div>

        {/* Data Summary Footer */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl opacity-0 animate-[fadeInUp_0.5s_ease-out_0.7s_forwards]">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Data Summary</h3>
              <p className="text-white/70">
                All measurements from Main River Station • {currentTime.toLocaleDateString()} at {formatTime(currentTime)}
              </p>
            </div>
            <div className="flex gap-4 mt-4 lg:mt-0">
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-medium hover:bg-white/30 transition-all duration-300 flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center">
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Historical
              </button>
            </div>
          </div>
        </div>

        {/* Custom CSS for animations */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}


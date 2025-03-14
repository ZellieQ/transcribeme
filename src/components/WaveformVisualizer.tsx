import React, { useRef, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface WaveformVisualizerProps {
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barColor?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  width = 800,
  height = 100,
  barWidth = 3,
  barGap = 1,
  barColor = '#4285f4'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { transcriptionProgress } = useAppContext();
  const [audioData, setAudioData] = useState<number[]>([]);
  const animationRef = useRef<number>();
  
  // Generate random audio data for visualization
  useEffect(() => {
    if (transcriptionProgress.status === 'loading' || transcriptionProgress.status === 'processing') {
      // Generate random waveform data
      const generateWaveformData = () => {
        const data: number[] = [];
        const numBars = Math.floor(width / (barWidth + barGap));
        
        for (let i = 0; i < numBars; i++) {
          // Create a more natural looking waveform with varying heights
          // Higher values in the middle, lower at the edges
          const position = i / numBars;
          const centerDistance = Math.abs(position - 0.5) * 2; // 0 at center, 1 at edges
          const maxHeight = 0.8 - (centerDistance * 0.3); // Higher in middle
          
          // Add some randomness but keep it smooth by limiting changes
          const randomFactor = Math.random() * 0.5;
          data.push(maxHeight * randomFactor);
        }
        
        setAudioData(data);
        animationRef.current = requestAnimationFrame(generateWaveformData);
      };
      
      generateWaveformData();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Reset animation when not processing
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // If idle or complete, show flat line
      if (transcriptionProgress.status === 'idle') {
        const flatData: number[] = [];
        const numBars = Math.floor(width / (barWidth + barGap));
        for (let i = 0; i < numBars; i++) {
          flatData.push(0.05); // Very small bars for idle state
        }
        setAudioData(flatData);
      }
      
      // If complete, show a nice completed waveform
      if (transcriptionProgress.status === 'complete') {
        const completedData: number[] = [];
        const numBars = Math.floor(width / (barWidth + barGap));
        for (let i = 0; i < numBars; i++) {
          // Create a symmetrical waveform
          const position = i / numBars;
          const value = Math.sin(position * Math.PI * 8) * 0.3 + 0.3;
          completedData.push(Math.max(0.05, value));
        }
        setAudioData(completedData);
      }
    }
  }, [transcriptionProgress.status, width, barWidth, barGap]);
  
  // Draw the waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set bar color
    ctx.fillStyle = barColor;
    
    // Draw bars
    const barCount = audioData.length;
    const centerY = height / 2;
    
    for (let i = 0; i < barCount; i++) {
      const barHeight = audioData[i] * height;
      const x = i * (barWidth + barGap);
      const y = centerY - barHeight / 2;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, [audioData, width, height, barWidth, barGap, barColor]);
  
  return (
    <div className="waveform-container">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height}
        className="waveform-canvas"
      />
    </div>
  );
};

export default WaveformVisualizer;

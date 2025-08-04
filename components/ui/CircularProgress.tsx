import { useEffect, useRef, useState } from "react";

export default function CircularProgress({ value, size = 80, strokeWidth = 6, color = "#c084fc", bgColor = "#f3f4f6", label }: { value: number; size?: number; strokeWidth?: number; color?: string; bgColor?: string; label?: string }) {
  const [progress, setProgress] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setProgress((prev) => {
        if (prev < value) return Math.min(prev + 2, value);
        if (prev > value) return Math.max(prev - 2, value);
        return prev;
      });
      if (progress !== value) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <svg width={size} height={size} className="block">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 select-none">
        {label || `${progress}%`}
      </span>
    </div>
  );
} 
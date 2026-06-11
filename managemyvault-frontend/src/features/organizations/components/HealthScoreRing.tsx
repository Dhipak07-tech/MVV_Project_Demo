import { motion } from 'framer-motion';
import { getHealthScoreColor } from '../../../config/theme';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Animated SVG arc ring showing organization health score (0-100).
 * Green >= 80, Amber 50-79, Red < 50.
 * Animates from 0 to actual value on mount using Framer Motion.
 */
export default function HealthScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  className = '',
}: HealthScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getHealthScoreColor(score);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border-subtle"
        />
        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {/* Score text */}
      <motion.span
        className="absolute text-xs font-semibold"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score}
      </motion.span>
    </div>
  );
}

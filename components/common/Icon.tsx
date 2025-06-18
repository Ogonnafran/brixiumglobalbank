
import React from 'react';
import { LucideIcon, Bell } from 'lucide-react'; // Default icon

interface IconProps {
  name: LucideIcon;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name: IconComponent = Bell, className = '', size = 24 }) => {
  return <IconComponent className={`inline-block ${className}`} size={size} />;
};

export default Icon;
    
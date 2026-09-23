import React from 'react';
import { StatusLevel } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-950/70 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]';
      case 'WARNING':
        return 'bg-amber-950/70 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
      case 'NORMAL':
      default:
        return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
    }
  };

  const getDotStyle = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-400 animate-ping';
      case 'WARNING':
        return 'bg-amber-400 animate-pulse';
      case 'NORMAL':
      default:
        return 'bg-emerald-400';
    }
  };

  const getSolidDot = () => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'WARNING':
        return 'bg-amber-500';
      case 'NORMAL':
      default:
        return 'bg-emerald-500';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'CRITICAL':
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'NORMAL':
      default:
        return <ShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-mono ${getBadgeStyle()} ${sizeClasses[size]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${getDotStyle()}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${getSolidDot()}`}></span>
      </span>
      {showIcon && getIcon()}
      <span>{status}</span>
    </span>
  );
};

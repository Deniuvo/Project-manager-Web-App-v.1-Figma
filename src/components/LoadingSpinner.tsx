interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Base circle */}
      <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-full"></div>
      {/* Animated circle */}
      <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
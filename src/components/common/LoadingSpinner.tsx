interface LoadingSpinnerProps {
  count?: number;
  className?: string;
}

export function LoadingSpinner({ count = 5, className }: LoadingSpinnerProps) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="h-16 w-full mb-2 bg-slate-200 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
}

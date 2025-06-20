import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export const Button = ({ 
    children, 
    className = '', 
    size = 'md', 
    variant = 'default',
    ...props 
}: ButtonProps) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
        default: 'bg-blue-600 hover:bg-blue-700 text-white',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
        ghost: 'hover:bg-gray-100 text-gray-700',
        destructive: 'bg-red-600 hover:bg-red-700 text-white',
    };

    return (
        <button
            className={`rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

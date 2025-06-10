import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ children, className = '', size = 'md', ...props }: ButtonProps) => {
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`rounded font-medium transition ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

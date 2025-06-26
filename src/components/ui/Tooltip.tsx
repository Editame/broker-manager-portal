// src/components/ui/Tooltip.tsx
'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

// Componente simple para uso básico
interface TooltipProps {
    children: React.ReactElement;
    content: string;
}

export const Tooltip = ({ children, content }: TooltipProps) => (
    <RadixTooltip.Root delayDuration={300}>
        <RadixTooltip.Trigger asChild>
            {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
            <RadixTooltip.Content
                side="top"
                className="px-2 py-1 text-sm rounded bg-gray-700 text-white shadow"
                sideOffset={4}
            >
                {content}
                <RadixTooltip.Arrow className="fill-gray-700" />
            </RadixTooltip.Content>
        </RadixTooltip.Portal>
    </RadixTooltip.Root>
);

// Componentes individuales para uso más flexible
export const TooltipProvider = RadixTooltip.Provider;

// Root component que acepta múltiples children
export const TooltipRoot = ({ children, ...props }: { 
    children: ReactNode;
    delayDuration?: number;
}) => (
    <RadixTooltip.Root delayDuration={300} {...props}>
        {children}
    </RadixTooltip.Root>
);

export const TooltipTrigger = RadixTooltip.Trigger;
export const TooltipPortal = RadixTooltip.Portal;

export const TooltipContent = ({ children, className = '', ...props }: {
    children: ReactNode;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
}) => (
    <RadixTooltip.Portal>
        <RadixTooltip.Content
            className={`px-2 py-1 text-sm rounded bg-gray-700 text-white shadow z-50 ${className}`}
            sideOffset={4}
            {...props}
        >
            {children}
            <RadixTooltip.Arrow className="fill-gray-700" />
        </RadixTooltip.Content>
    </RadixTooltip.Portal>
);

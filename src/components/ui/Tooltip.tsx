// src/components/ui/Tooltip.tsx
'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps {
    children: React.ReactElement; // ⚠️ importante: solo un hijo
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

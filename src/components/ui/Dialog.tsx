'use client';

import * as React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/Utils';

const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;
const DialogPortal = RadixDialog.Portal;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof RadixDialog.Overlay>,
    React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
    <RadixDialog.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = RadixDialog.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof RadixDialog.Content>,
    React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <RadixDialog.Content
            ref={ref}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 grid w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 gap-4 border border-white/10 bg-[#1F1F1F] p-6 shadow-xl duration-200 sm:rounded-2xl',
                className
            )}
            {...props}
        >
            {children}
            <RadixDialog.Close className="absolute right-4 top-4 text-white/70 hover:text-white transition">
                <X className="h-5 w-5" />
            </RadixDialog.Close>
        </RadixDialog.Content>
    </DialogPortal>
));
DialogContent.displayName = RadixDialog.Content.displayName;

export {
    Dialog,
    DialogTrigger,
    DialogContent,
};

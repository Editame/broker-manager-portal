import React from 'react';
import {cn} from "@/lib/Utils";


interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-gray-700',
                className
            )}
            {...props}
        />
    );
}

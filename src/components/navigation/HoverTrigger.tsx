"use client";

interface HoverTriggerProps {
    onMouseEnter: () => void;
}

export function HoverTrigger({ onMouseEnter }: HoverTriggerProps) {
    return (
        <div
            className="fixed left-0 top-0 w-3 lg:w-4 h-screen z-[160] hidden lg:block cursor-pointer bg-transparent"
            onMouseEnter={onMouseEnter}
            aria-label="Expand Sidebar Trigger Zone"
        />
    );
}

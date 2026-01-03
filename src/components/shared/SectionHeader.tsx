"use client";

import React from "react";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, className = "" }) => {
    return (
        <div className={`text-center mb-16 ${className}`}>
            <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">
                {title}
            </h2>
            {subtitle && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-[1px] bg-[var(--sage)] opacity-50" />
                    <p className="text-gray-500 max-w-2xl mx-auto text-base md:text-lg font-light tracking-wide">
                        {subtitle}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SectionHeader;

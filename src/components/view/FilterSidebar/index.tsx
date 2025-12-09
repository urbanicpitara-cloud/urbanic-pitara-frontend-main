"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterState {
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    availability: string[];
    tags: string[];
}

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClearFilters: () => void;
    availableSizes?: string[];
    availableColors?: string[];
    availableTags?: string[];
    maxPrice?: number;
}

export default function FilterSidebar({
    filters,
    onFilterChange,
    onClearFilters,
    availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
    availableColors = ["Red", "Blue", "Green", "Black", "White", "Pink", "Yellow"],
    availableTags = [],
    maxPrice = 50000,
}: FilterSidebarProps) {
    const [expandedSections, setExpandedSections] = useState({
        price: true,
        size: true,
        color: true,
        availability: true,
        tags: availableTags.length > 0,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handlePriceChange = (value: number[]) => {
        // Ensure values are always in ascending order (min, max)
        const sortedValues = [...value].sort((a, b) => a - b);
        onFilterChange({ ...filters, priceRange: [sortedValues[0], sortedValues[1]] });
    };

    const handleSizeToggle = (size: string) => {
        const newSizes = filters.sizes.includes(size)
            ? filters.sizes.filter((s) => s !== size)
            : [...filters.sizes, size];
        onFilterChange({ ...filters, sizes: newSizes });
    };

    const handleColorToggle = (color: string) => {
        const newColors = filters.colors.includes(color)
            ? filters.colors.filter((c) => c !== color)
            : [...filters.colors, color];
        onFilterChange({ ...filters, colors: newColors });
    };

    const handleAvailabilityToggle = (value: string) => {
        const newAvailability = filters.availability.includes(value)
            ? filters.availability.filter((a) => a !== value)
            : [...filters.availability, value];
        onFilterChange({ ...filters, availability: newAvailability });
    };

    const handleTagToggle = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter((t) => t !== tag)
            : [...filters.tags, tag];
        onFilterChange({ ...filters, tags: newTags });
    };

    const colorMap: Record<string, string> = {
        Red: "bg-red-500",
        Blue: "bg-blue-500",
        Green: "bg-green-500",
        Black: "bg-black",
        White: "bg-white border-2 border-gray-300",
        Pink: "bg-pink-500",
        Yellow: "bg-yellow-400",
    };

    const hasActiveFilters =
        filters.priceRange[0] > 0 ||
        filters.priceRange[1] < maxPrice ||
        filters.sizes.length > 0 ||
        filters.colors.length > 0 ||
        filters.availability.length > 0 ||
        filters.tags.length > 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Price Range */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                    onClick={() => toggleSection("price")}
                    className="flex justify-between items-center w-full mb-4"
                >
                    <h3 className="font-semibold text-gray-900">Price Range</h3>
                    {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.price && (
                    <div className="space-y-4">
                        <Slider
                            min={0}
                            max={maxPrice}
                            step={100}
                            value={filters.priceRange}
                            onValueChange={handlePriceChange}
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>₹{filters.priceRange[0]}</span>
                            <span>₹{filters.priceRange[1]}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Size Filter */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                    onClick={() => toggleSection("size")}
                    className="flex justify-between items-center w-full mb-4"
                >
                    <h3 className="font-semibold text-gray-900">Size</h3>
                    {expandedSections.size ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.size && (
                    <div className="grid grid-cols-3 gap-2">
                        {availableSizes.map((size) => (
                            <button
                                key={String(size)}
                                onClick={() => handleSizeToggle(size)}
                                className={`px-3 py-2 border rounded-sm text-sm font-medium transition-all ${filters.sizes.includes(size)
                                    ? "bg-black text-white border-black shadow-sm"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Color Filter */}
            {/* <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                    onClick={() => toggleSection("color")}
                    className="flex justify-between items-center w-full mb-4"
                >
                    <h3 className="font-semibold text-gray-900">Color</h3>
                    {expandedSections.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.color && (
                    <div className="grid grid-cols-5 gap-2">
                        {availableColors.map((color) => (
                            <button
                                key={String(color)}
                                onClick={() => handleColorToggle(color)}
                                className="relative group flex flex-col items-center gap-1"
                                title={String(color)}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm ${colorMap[color] || "bg-gray-100"} ${filters.colors.includes(color) ? "ring-2 ring-offset-2 ring-black" : ""
                                        } transition-all hover:scale-110`}
                                    style={!colorMap[color] && typeof color === 'string' && color.startsWith('#') ? { backgroundColor: color } : {}}
                                />
                                <span className="text-[10px] text-gray-500 truncate w-full text-center">{color}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div> */}

            {/* Availability Filter */}
            <div className="mb-6 pb-6 border-b border-gray-200">
                <button
                    onClick={() => toggleSection("availability")}
                    className="flex justify-between items-center w-full mb-4"
                >
                    <h3 className="font-semibold text-gray-900">Availability</h3>
                    {expandedSections.availability ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.availability && (
                    <div className="space-y-3">
                        {["In Stock", "Out of Stock"].map((option) => (
                            <label key={option} className="flex items-center space-x-3 cursor-pointer">
                                <Checkbox
                                    checked={filters.availability.includes(option)}
                                    onCheckedChange={() => handleAvailabilityToggle(option)}
                                />
                                <span className="text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Tags Filter (if available) */}
            {availableTags.length > 0 && (
                <div className="mb-6">
                    <button
                        onClick={() => toggleSection("tags")}
                        className="flex justify-between items-center w-full mb-4"
                    >
                        <h3 className="font-semibold text-gray-900">Categories</h3>
                        {expandedSections.tags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedSections.tags && (
                        <div className="space-y-3">
                            {availableTags.map((tag) => (
                                <label key={tag} className="flex items-center space-x-3 cursor-pointer">
                                    <Checkbox
                                        checked={filters.tags.includes(tag)}
                                        onCheckedChange={() => handleTagToggle(tag)}
                                    />
                                    <span className="text-sm text-gray-700">{tag}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

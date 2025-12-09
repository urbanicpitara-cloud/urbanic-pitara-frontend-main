"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MultiSelectProps {
    options: { id: string; title: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const handleSelect = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter((item) => item !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const selectedTitles = options
        .filter((opt) => selected.includes(opt.id))
        .map((opt) => opt.title);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between h-auto min-h-10", className)}
                >
                    <div className="flex flex-wrap gap-1 text-left">
                        {selectedTitles.length > 0 ? (
                            selectedTitles.join(", ")
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[300px]" align="start">
                <DropdownMenuLabel>Collections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-y-auto">
                    {options.map((option) => (
                        <DropdownMenuCheckboxItem
                            key={option.id}
                            checked={selected.includes(option.id)}
                            onCheckedChange={() => handleSelect(option.id)}
                        >
                            {option.title}
                        </DropdownMenuCheckboxItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

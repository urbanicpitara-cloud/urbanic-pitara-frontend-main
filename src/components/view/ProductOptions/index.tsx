"use client";

import { GetProductByHandleQuery } from "@/types/shopify-graphql";
import React from "react";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";

type ProductOptionsProps = {
  options: NonNullable<GetProductByHandleQuery["product"]>["options"];
  selectedOptions?: Record<string, string>;
  setSelectedOptions?: (options: Record<string, string>) => void;
  isGlass?: boolean;
};

const ProductOptions = ({
  options,
  selectedOptions = {},
  setSelectedOptions,
  isGlass = false,
}: ProductOptionsProps) => {
  const handleOptionChange = (optionName: string, value: string) => {
    const updatedOptions = {
      ...selectedOptions,
      [optionName]: value,
    };
    setSelectedOptions?.(updatedOptions);
  };

  const renderOptionUI = (
    option: NonNullable<GetProductByHandleQuery["product"]>["options"][0],
    isGlass: boolean
  ) => {
    switch (option.name.toLowerCase()) {
      case "color":
        return (
          <div className="flex items-center gap-3">
            {option.optionValues.map((value) => (
              <button
                key={value.id}
                onClick={() => handleOptionChange(option.name, value.name)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-beige-300 shadow-sm transition-transform duration-300 hover:scale-110",
                  {
                    "ring-2 ring-black shadow-md":
                      selectedOptions[option.name] === value.name,
                  }
                )}
                style={{ backgroundColor: value.name.toLowerCase() }}
              />
            ))}
          </div>
        );

      case "size":
        return (
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value) => (
              <Button
                key={value.id}
                size="sm"
                variant={
                  selectedOptions[option.name] === value.name
                    ? "default"
                    : "outline"
                }
                className={cn(
                  "rounded-xl px-4 py-1 font-sans tracking-wide transition-all hover:border-gold hover:text-gold",
                  {
                    "bg-black text-ivory border-none":
                      selectedOptions[option.name] === value.name,
                  }
                )}
                onClick={() => handleOptionChange(option.name, value.name)}
              >
                {value.name}
              </Button>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-wrap gap-2">
            {option.optionValues.map((value) => (
              <Button
                key={value.id}
                variant={
                  selectedOptions[option.name] === value.name
                    ? "default"
                    : isGlass
                    ? "ghost"
                    : "outline"
                }
                className={cn(
                  "rounded-lg px-4 py-1 transition-all hover:border-gold hover:text-gold",
                  {
                    "bg-black text-ivory border-none":
                      selectedOptions[option.name] === value.name,
                  }
                )}
                onClick={() => handleOptionChange(option.name, value.name)}
              >
                {value.name}
              </Button>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {options.map((option) => (
        <div key={option.name} className="flex flex-col gap-3">
          <label className="text-base font-serif font-medium text-black">
            {option.name}
          </label>
          {renderOptionUI(option, isGlass)}
        </div>
      ))}
    </div>
  );
};

export default ProductOptions;

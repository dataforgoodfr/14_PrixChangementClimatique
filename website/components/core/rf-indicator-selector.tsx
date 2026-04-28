"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/components/icons";

interface IndicatorSelectorProps {
  label: string;
  icon: IconComponent;
  active?: boolean;
  onClick: () => void;
}

export function IndicatorSelector({
  label,
  icon: Icon,
  active = false,
  onClick,
}: IndicatorSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className={cn(
          "size-16",
          active
            ? "border-neutral-900 bg-white hover:bg-white"
            : "border-transparent bg-neutral-100 hover:bg-neutral-200",
        )}
      >
        <Icon
          color={active ? "var(--color-rf-green-dark)" : "var(--color-rf-gray)"}
          className="size-6"
        />
      </Button>
      <span
        className={cn(
          "text-xs leading-tight whitespace-normal text-center",
          active
            ? "font-bold text-neutral-900"
            : "font-medium text-neutral-500",
        )}
      >
        {label}
      </span>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IconComponent } from "@/components/icons";

interface IndicateurSelectorProps {
  label: string;
  icon: IconComponent;
  active?: boolean;
  onClick: () => void;
}

export function IndicateurSelector({
  label,
  icon: Icon,
  active = false,
  onClick,
}: IndicateurSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        onClick={onClick}
        variant="outline"
        size="icon"
        className={cn(
          `w-16 h-16 `,
          active
            ? "border-neutral-900 bg-white hover:bg-white"
            : "border-transparent bg-neutral-100 hover:bg-neutral-200",
        )}
      >
        <Icon
          color={active ? "oklch(52.7% 0.154 150.069)" : "oklch(55.6% 0 0)"}
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

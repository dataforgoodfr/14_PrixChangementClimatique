import type { ComponentType } from "react";

export interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export type IconComponent = ComponentType<IconProps>;

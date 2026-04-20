import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

interface RFButtonProps {
  title: string;
  path: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function RFButton({
  title,
  path,
  onClick,
  variant = "primary",
  icon,
  iconPosition = "left",
}: RFButtonProps) {
  return (
    <Link
      href={path}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-[8px] px-5 py-2 w-fit text-sm font-semibold border rounded-none transition-all duration-150",
        "hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        {
          "bg-rf-green-dark text-rf-lime border-rf-lime shadow-[4px_4px_0px_var(--color-rf-lime)]":
            variant === "primary",

          "bg-rf-lime text-rf-green-dark border-rf-lime shadow-[4px_4px_0px_var(--color-rf-green-dark)]":
            variant === "secondary",
        },
      )}
    >
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {title}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </Link>
  );
}

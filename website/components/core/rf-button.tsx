import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

interface RFButtonBaseProps {
  title: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

interface RFLinkProps extends RFButtonBaseProps {
  as?: "link";
  path: string;
  download?: string | boolean;
}

interface RFButtonElement extends RFButtonBaseProps {
  as: "button";
  path?: never;
  type?: "button" | "submit" | "reset";
}

type RFButtonProps = RFLinkProps | RFButtonElement;

const baseClasses = clsx(
  "inline-flex items-center gap-[8px] px-5 py-2 w-fit text-base font-bold border rounded-none transition-all duration-150",
  "hover:shadow-none hover:translate-x-1 hover:translate-y-1",
);

const variantClasses = {
  primary:
    "bg-rf-green-dark text-rf-lime border-rf-lime shadow-[4px_4px_0px_var(--color-rf-lime)]",
  secondary:
    "bg-rf-lime text-rf-green-dark border-rf-lime shadow-[4px_4px_0px_var(--color-rf-green-dark)]",
};

function renderContent(
  icon?: ReactNode,
  title?: string,
  iconPosition: "left" | "right" = "left",
) {
  return (
    <>
      {icon && iconPosition === "left" && <span>{icon}</span>}
      {title}
      {icon && iconPosition === "right" && <span>{icon}</span>}
    </>
  );
}

export function RFButton(props: RFButtonProps) {
  const {
    title,
    onClick,
    variant = "primary",
    icon,
    iconPosition = "left",
    as = "link",
  } = props;

  const className = clsx(baseClasses, variantClasses[variant]);

  if (props.as === "button") {
    return (
      <button
        type={props.type || "button"}
        onClick={onClick}
        className={className}
      >
        {renderContent(icon, title, iconPosition)}
      </button>
    );
  }

  return (
    <Link
      href={props.path}
      onClick={onClick}
      className={className}
      download={props.download}
    >
      {renderContent(icon, title, iconPosition)}
    </Link>
  );
}

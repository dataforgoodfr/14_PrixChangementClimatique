import Link from "next/link";

interface RFButtonProps {
  title: string;
  path: string;
  onClick?: () => void;
}

export function RFButton({ title, path, onClick }: RFButtonProps) {
  return (
    <Link
      href={path}
      onClick={onClick}
      className="inline-block px-5 py-2 text-sm font-semibold bg-rf-green-dark text-rf-lime border border-rf-lime rounded-none shadow-[4px_4px_0px_var(--color-rf-lime)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150"
    >
      {title}
    </Link>
  );
}

import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subTitle?: string;
  className?: string;
}

export const SectionTitle = ({
  title,
  subTitle,
  className,
}: SectionTitleProps) => {
  return (
    <div className={cn("space-y-1", className)}>
      <h2
        data-slot="section-title"
        className="text-2xl font-semibold text-rf-subtitle"
      >
        {title}
      </h2>
      {subTitle && (
        <p className="text-base font-normal italic text-rf-gray-lightest">
          {subTitle}
        </p>
      )}
    </div>
  );
};

"use client";
import { cn } from "@/lib/utils";

type InlinePart = {
  text: string;
  bold?: boolean;
};

type Segment = {
  parts: InlinePart[];
  highlight?: boolean;
};

type Props = {
  topLine: Segment[];
  middleLine?: Segment[];
  bottomLine: Segment[];
  highlightVariant?: "primary" | "secondary" | "tertiary";
};

const highlightStyles = {
  primary: "inline-block bg-rf-lime text-rf-green-dark",
  secondary: "inline-block bg-rf-green-dark text-rf-lime",
  tertiary: "inline-block bg-rf-green-dark text-white",
};

const renderSegment = (
  segment: Segment,
  variant: "primary" | "secondary" | "tertiary",
) => {
  const className = cn(
    "text-[18px] md:text-[26px] lg:text-[36px] py-[2px] lg:py-[8px] px-[8px] rotate-[-1deg]",
    segment.highlight && highlightStyles[variant],
  );

  return (
    <span className={className}>
      {segment.parts.map((part, i) => (
        <span key={i} className={part.bold ? "font-bold" : ""}>
          {part.text}
        </span>
      ))}
    </span>
  );
};

const SectionTitle: React.FC<Props> = ({
  topLine,
  middleLine,
  bottomLine,
  highlightVariant = "primary",
}) => {
  return (
    <div className="flex flex-col items-start">
      <div className="bg-[url('/home-quotation-mark.svg')] bg-contain bg-no-repeat w-[30px] h-[30px] md:w-[40px] md:h-[40px] shrink-0" />
      <h2 className="flex flex-col leading-tight">
        <span>
          {topLine.map((seg, i) => (
            <span key={i}>{renderSegment(seg, highlightVariant)}</span>
          ))}
        </span>

        {middleLine && (
          <span>
            {middleLine.map((seg, i) => (
              <span key={i}>{renderSegment(seg, highlightVariant)}</span>
            ))}
          </span>
        )}

        <span>
          {bottomLine.map((seg, i) => (
            <span key={i}>{renderSegment(seg, highlightVariant)}</span>
          ))}
        </span>
      </h2>
    </div>
  );
};

export default SectionTitle;

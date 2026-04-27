"use-client";

type Props = {
  label: string;
  color: string;
  backgroundColor: string;
  striped: boolean;
};
const CaptionItem: React.FC<Props> = ({
  label,
  color,
  striped,
  backgroundColor,
}) => {
  return (
    <div className="flex gap-[8px] items-center">
      <div
        style={{
          backgroundColor: backgroundColor,
          ...(striped && {
            backgroundImage:
              "repeating-linear-gradient(-45deg, #1E1B39 0, #1E1B39 1px, transparent 2px, transparent 6px)",
          }),
        }}
        className={`w-[16px] h-[16px] border border-white border-opacity-60 rounded-full`}
      ></div>
      <p style={{ color: color }}>{label}</p>
    </div>
  );
};

export default CaptionItem;

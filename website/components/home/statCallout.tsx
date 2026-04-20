"use-client";

type Props = {
  value: string;
  text: string;
  highlight: string;
};
const StatCallout: React.FC<Props> = ({ value, highlight, text }) => {
  const parts = text.split(highlight);

  return (
    <p>
      <span className="text-[28px] md:text-[40px] lg:text-[48px] text-rf-green-light font-[700] mr-[4px]">
        {value}
      </span>
      <span className="text-[16px] md:text-[25px] lg:text-[28px] text-rf-green-dark font-[400]">
        {parts[0]}
        <strong>{highlight}</strong>
      </span>
      <br />
      <span className="text-[14px] lg:text-[21px] text-rf-gray font-[400]">
        {parts[1]}
      </span>
    </p>
  );
};

export default StatCallout;

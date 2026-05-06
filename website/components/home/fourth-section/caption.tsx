"use-client";

import CaptionItem from "../caption-item";

const Caption: React.FC = () => {
  const list = [
    {
      id: 1,
      label: "0-1%",
      backgroundColor: "#2563EB",
      color: "black",
      striped: false,
    },
    {
      id: 2,
      label: "1-2%",
      backgroundColor: "#add8e6",
      color: "black",
      striped: false,
    },
    {
      id: 3,
      label: "2-5%",
      backgroundColor: "#F87171",
      color: "black",
      striped: false,
    },
    {
      id: 4,
      label: "> 5%",
      backgroundColor: "#B91C1C",
      color: "black",
      striped: false,
    },
  ];

  return (
    <div className="flex flex-col gap-[8px] items-center self-center w-fit">
      <div className="flex gap-[16px] w-full flex-wrap justify-center">
        {list.map((el) => (
          <CaptionItem
            key={el.id}
            backgroundColor={el.backgroundColor}
            label={el.label}
            striped={el.striped}
            color={el.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Caption;

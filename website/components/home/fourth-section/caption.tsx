"use-client";

import CaptionItem from "../caption-item";

const Caption: React.FC = () => {
  const list = [
    {
      id: 1,
      label: "0-1%",
      backgroundColor: "#91354E",
      color: "black",
      striped: false,
    },
    {
      id: 2,
      label: "1-2%",
      backgroundColor: "#4EAD78",
      color: "black",
      striped: false,
    },
    {
      id: 3,
      label: "2-5%",
      backgroundColor: "#E0C7EC",
      color: "black",
      striped: false,
    },
    {
      id: 4,
      label: "> 5%",
      backgroundColor: "#FCDAED",
      color: "black",
      striped: false,
    },
    {
      id: 5,
      label: "Pas de prime",
      backgroundColor: "#DFCDD7",
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

"use-client";

import CaptionItem from "../caption-item";

const Caption: React.FC = () => {
  const list = [
    {
      id: 1,
      label: "Moyen",
      backgroundColor: "#D57632",
      color: "#FFFFFFCC",
      striped: false,
    },
    {
      id: 2,
      label: "Fort",
      backgroundColor: "#A13332",
      color: "#FFFFFFCC",
      striped: false,
    },
    {
      id: 3,
      label: "PPRN RGA",
      backgroundColor: "#B1B1AF",
      color: "#FFFFFFCC",
      striped: true,
    },
  ];

  return (
    <div className="flex flex-col gap-[8px] items-center self-center lg:self-end w-fit">
      <p className="text-[16px] font-[600] text-white">Niveau de risque</p>
      <div className="flex lg:flex-col gap-[16px] w-full flex-wrap justify-center">
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

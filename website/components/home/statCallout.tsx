"use client";

import { ReactNode } from "react";

type Props = {
  value: string;
  title: { text: string; highlight: string };
  subtitle: ReactNode;
  variant?: "primary" | "secondary" | "fullGreen";
};

const StatCallout: React.FC<Props> = ({
  value,
  title,
  subtitle,
  variant = "primary",
}) => {
  const styles = {
    primary: {
      value: "text-rf-green-light",
      before: "text-rf-green-dark",
      after: "text-rf-gray",
    },
    secondary: {
      value: "text-rf-lime",
      before: "text-white",
      after: "text-white/80",
    },
    fullGreen: {
      value: "text-rf-green-dark",
      before: "text-rf-green-dark",
      after: "text-rf-green-dark/80",
    },
  };

  const s = styles[variant];

  return (
    <div>
      <span className={`text-5xl font-bold mr-[4px] ${s.value}`}>{value}</span>

      <span className={`text-3xl font-[400] ${s.before}`}>
        {`${title.text} `}
        <strong>{title.highlight}</strong>
      </span>

      <br />

      <span className={`text-lg ${s.after}`}>{subtitle}</span>
    </div>
  );
};

export default StatCallout;

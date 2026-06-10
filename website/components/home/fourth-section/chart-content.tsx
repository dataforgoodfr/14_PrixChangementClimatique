"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

// Données : proportion (%) de communes par tranche de budget et part d'assurance
const data = [
  { name: "0-100K", p01: 1, p12: 14, p25: 72, p5plus: 13 },
  { name: "100K-200K", p01: 4, p12: 32, p25: 60, p5plus: 4 },
  { name: "200K-500K", p01: 10, p12: 51, p25: 37, p5plus: 2 },
  { name: "500K-1M", p01: 24, p12: 57, p25: 18, p5plus: 1 },
  { name: ">1M", p01: 62, p12: 32, p25: 6, p5plus: 0 },
];

const CATEGORIES = [
  { key: "p01", color: "#2563EB", label: "0-1 %" },
  { key: "p12", color: "#add8e6", label: "1-2 %" },
  { key: "p25", color: "#F87171", label: "2-5 %" },
  { key: "p5plus", color: "#B91C1C", label: "> 5 %" },
];

const ChartContent: React.FC = () => {
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const margin = isMd
    ? { top: 10, right: 170, left: 70, bottom: 60 }
    : { top: 10, right: 15, left: 40, bottom: 60 };

  return (
    <div className="relative w-full outline-none">
      {/* Légende mobile : au-dessus du graphique */}
      <div className="flex md:hidden flex-wrap gap-x-4 gap-y-1.5 mb-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-sm text-gray-600">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="outline-none">
        <ResponsiveContainer width="100%" height={isMd ? 420 : 320}>
          <BarChart data={data} margin={margin} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="#E5E7EB" />

            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9D9A9F", fontSize: isMd ? 12 : 10 }}
            >
              <Label
                value="Budget des communes"
                position="insideBottom"
                offset={-45}
                style={{
                  textAnchor: "middle",
                  fill: "#6B7280",
                  fontSize: isMd ? 12 : 10,
                }}
              />
            </XAxis>

            <YAxis
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(v) => `${v}`}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9D9A9F", fontSize: isMd ? 12 : 10 }}
            >
              <Label
                value="Proportion de communes (%)"
                angle={-90}
                position="insideLeft"
                offset={isMd ? -53 : -32}
                style={{
                  textAnchor: "middle",
                  fill: "#6B7280",
                  fontSize: isMd ? 12 : 10,
                }}
              />
            </YAxis>

            <Tooltip
              formatter={(value, name) => {
                const key = String(name ?? "");
                const cat = CATEGORIES.find((c) => c.key === key);
                return [`${value ?? 0} %`, cat?.label ?? key];
              }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />

            {CATEGORIES.map((cat, i) => (
              <Bar
                key={cat.key}
                dataKey={cat.key}
                stackId="a"
                fill={cat.color}
                radius={i === CATEGORIES.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContent;

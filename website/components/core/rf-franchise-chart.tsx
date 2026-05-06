import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type RfFranchiseProps = {
  value: number;
  size?: "sm" | "md";
};

const ARCS = [
  {
    multiplier: 1,
    colorVar: "var(--color-rf-graph-4)",
    radius: 22,
    start: -240,
    stop: -90,
  },
  {
    multiplier: 2,
    colorVar: "var(--color-rf-graph-3)",
    radius: 44,
    start: -210,
    stop: -90,
  },
  {
    multiplier: 3,
    colorVar: "var(--color-rf-graph-2)",
    radius: 66,
    start: -180,
    stop: -90,
  },
  {
    multiplier: 4,
    colorVar: "var(--color-rf-graph-1)",
    radius: 88,
    start: -150,
    stop: -90,
  },
];

const CX = 105;
const CY = 105;
const STROKE_WIDTH = 14;
const INACTIVE_OPACITY = 0.25;

// 270° arc from upper-right to lower-right counterclockwise — gap on right side
function arcPath(r: number, start: number, stop: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = CX + r * Math.cos(toRad(start));
  const y1 = CY + r * Math.sin(toRad(start));
  const x2 = CX + r * Math.cos(toRad(stop));
  const y2 = CY + r * Math.sin(toRad(stop));
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 1 0 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function RfFranchiseChart({ value, size }: RfFranchiseProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Franchise légale Cat-Nat</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`flex flex-col  ${size !== "sm" && "md:flex-row"} justify-center items-center gap-4`}
        >
          <div className="w-full flex items-center justify-center gap-4">
            <svg
              viewBox="0 0 210 210"
              className="w-40 h-40 shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              {ARCS.map(({ multiplier, colorVar, radius, start, stop }) => (
                <path
                  key={multiplier}
                  d={arcPath(radius, start, stop)}
                  fill="none"
                  style={{ stroke: colorVar }}
                  strokeWidth={STROKE_WIDTH}
                  strokeLinecap="round"
                  opacity={multiplier === value ? 1 : INACTIVE_OPACITY}
                />
              ))}
            </svg>
            <div className="flex flex-col gap-2.5">
              {ARCS.map(({ multiplier, colorVar }) => (
                <div
                  key={multiplier}
                  className="flex items-center gap-2"
                  style={{
                    opacity: multiplier === value ? 1 : INACTIVE_OPACITY,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colorVar }}
                  />
                  <span className="text-sm font-medium">X {multiplier}</span>
                </div>
              ))}
            </div>
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="w-full text-muted-foreground">
            La franchise légale Cat Nat est la part des dommages restant à la
            charge de l’assuré après indemnisation, fixée de manière uniforme
            par l’État.Elle peut être majorée (multipliée) dans les communes où
            les catastrophes naturelles se répètent en l’absence de mesures de
            prévention suffisantes, afin d’inciter à une meilleure gestion des
            risques.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

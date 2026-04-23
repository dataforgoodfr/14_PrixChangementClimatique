type RfRecognitionRequestChartProps = {
  recognized: number;
  unrecognized: number;
};

const RADIUS = 80;
const CENTER_X = 86;
const CENTER_Y = 86;
const GAP = 0.1;

function getArcPath(startAngle: number, endAngle: number, color: string) {
  const offset = Math.PI / 2;
  const startX = CENTER_X + RADIUS * Math.cos(offset + startAngle);
  const startY = CENTER_Y - RADIUS * Math.sin(offset + startAngle);
  const endX = CENTER_X + RADIUS * Math.cos(offset + endAngle);
  const endY = CENTER_Y - RADIUS * Math.sin(offset + endAngle);
  const largeArc = Math.abs(endAngle - startAngle) >= Math.PI ? 1 : 0;
  return (
    <path
      d={`M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${endX} ${endY}`}
      fill="none"
      stroke={color}
      strokeWidth="12"
      strokeLinecap="round"
    />
  );
}

function CircleChart({
  recognized,
  unrecognized,
}: RfRecognitionRequestChartProps) {
  const recognizedRatio = recognized / (unrecognized + recognized);
  const separationAngle = 2 * Math.PI - 2 * Math.PI * recognizedRatio;

  return (
    <svg
      viewBox="0 0 172 172"
      className="w-full aspect-square"
      xmlns="http://www.w3.org/2000/svg"
    >
      {getArcPath(separationAngle + GAP, 2 * Math.PI - GAP, "#00B831")}
      {getArcPath(GAP, separationAngle - GAP, "#EA580D")}
    </svg>
  );
}

export function RfRecognitionRequestChart({
  recognized,
  unrecognized,
}: RfRecognitionRequestChartProps) {
  return (
    <div className="flex justify-center items-center gap-4">
      <div className="w-43">
        <div className="relative">
          <CircleChart recognized={recognized} unrecognized={unrecognized} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-bold">
              {recognized + unrecognized}
            </div>
            <div className="text-muted-foreground text-sm">Demandes</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <span className="align-middle">
            <span className="inline-block size-4 rounded-full bg-[#00B831]" />
          </span>{" "}
          <span>Demandes reconnues</span>{" "}
          <span className="text-muted-foreground">{recognized}</span>
        </div>
        <div>
          <span className="align-middle">
            <span className="inline-block size-4 rounded-full bg-[#EA580D]" />
          </span>{" "}
          <span>Demandes non reconnues</span>{" "}
          <span className="text-muted-foreground">{unrecognized}</span>
        </div>
      </div>
    </div>
  );
}

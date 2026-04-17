import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface KpiStatCardProps {
  label: string;
  value: string;
  total: string;
}

export function KpiStatCard({ label, value, total }: KpiStatCardProps) {
  return (
    <Card className="flex flex-col gap-0.5 p-3 bg-white rounded-lg shadow-md">
      <CardTitle className="text-xs uppercase tracking-wide text-gray-500 font-medium">
        {label}
      </CardTitle>
      <CardContent className="px-0">
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}{" "}
          <span className="text-sm font-normal text-gray-400">/ {total}</span>
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { Download } from "lucide-react";

export interface DownloadCsvButtonProps {
  data: (string | number)[][];
  filename: string;
  onDownload?: () => void;
  className?: string;
}

export function DownloadCsvButton({
  data,
  filename,
  onDownload,
  className,
}: DownloadCsvButtonProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    const csvContent = data.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center justify-center gap-1 h-6 rounded-lg border-[1.2px] border-rf-button-border bg-rf-button-bg px-2 py-1 text-xs font-medium whitespace-nowrap cursor-pointer transition-all hover:border-rf-button-icon ${className || ""}`}
    >
      <Download className="size-4 text-rf-button-icon " />
      <span className="text-rf-gray-light">Download CSV</span>
    </button>
  );
}

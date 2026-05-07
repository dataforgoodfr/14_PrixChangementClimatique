import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { CatnatResponse } from "@/lib/types/catnat";
import { useEffect, useMemo, useState } from "react";
import { DownloadCsvButton } from "@/components/core/download-csv-button";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

interface DecadeGroup {
  label: string;
  startYear: number;
  endYear: number;
  events: CatnatResponse[];
}

const groupByDecade = (data: CatnatResponse[]): DecadeGroup[] => {
  if (!data || data.length === 0) return [];

  const years = data.map((item) => parseInt(item.annee_debut));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const currentYear = new Date().getFullYear();

  const decades: DecadeGroup[] = [];
  const startDecade = Math.floor(minYear / 10) * 10;
  const endDecade = Math.floor(Math.max(maxYear, currentYear) / 10) * 10;

  for (let decade = endDecade; decade >= startDecade; decade -= 10) {
    const currentDecade = Math.floor(currentYear / 10) * 10;
    const decadeEnd = decade === currentDecade ? currentYear : decade + 9;

    const events = data.filter((item) => {
      const year = parseInt(item.annee_debut);
      return year >= decade && year <= decadeEnd;
    });

    if (events.length > 0) {
      decades.push({
        label: `${decade}-${decadeEnd}`,
        startYear: decade,
        endYear: decadeEnd,
        events,
      });
    }
  }

  return decades;
};

export const CatnatHistoryTimeline = ({ data }: { data: CatnatResponse[] }) => {
  const historyByDecades = useMemo(() => groupByDecade(data), [data]);
  const [expandedDecades, setExpandedDecades] = useState<Set<string>>(
    () => new Set(historyByDecades.map((d) => d.label)),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedDecades(new Set(historyByDecades.map((d) => d.label)));
  }, [historyByDecades]);

  const oldestYear = useMemo(() => {
    return Math.min(...data.map((item) => parseInt(item.annee_debut)));
  }, [data]);

  const toggleDecade = (label: string) => {
    setExpandedDecades((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const csvData = useMemo(() => {
    const headers = ["Année", "Date début", "Date fin", "Type", "Reconnue"];
    const rows = data.map((item) => [
      item.annee_debut,
      item.date_debut,
      item.date_fin,
      item.type_catnat,
      item.is_reconnue ? "Oui" : "Non",
    ]);
    return [headers, ...rows];
  }, [data]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historique des catastrophes naturelles</CardTitle>
        <CardDescription>Depuis {oldestYear}</CardDescription>
        <CardAction>
          <DownloadCsvButton
            data={csvData}
            filename="historique-catastrophes-naturelles"
            className="gap-1.5"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-6">
        {historyByDecades.map((decade) => {
          const isExpanded = expandedDecades.has(decade.label);

          return (
            <div key={decade.label} className="relative">
              <div className="absolute left-[15.5px] top-8 bottom-0 w-px bg-gray-300" />

              <button
                onClick={() => toggleDecade(decade.label)}
                className="flex items-center gap-4 w-full text-left hover:opacity-80 transition-opacity"
              >
                <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-rf-green-dark bg-rf-green-dark">
                  <XIcon
                    strokeWidth={3}
                    className={cn(
                      "w-4 h-4 text-rf-lime transition-transform duration-200 rotate-45",
                      isExpanded && "rotate-0",
                    )}
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-500">
                  {decade.label}
                </h3>
              </button>

              {isExpanded && (
                <div className="ml-12 mt-4 space-y-4">
                  {decade.events.map((event) => (
                    <div
                      key={`${event.date_debut}-${event.date_fin}-${event.type_catnat}`}
                      className="relative"
                    >
                      <div className="absolute -left-[44px] top-0 w-6 h-6 rounded-full bg-white  flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-semibold text-rf-gray-darkest">
                          {formatDate(event.date_debut)}
                          {event.date_debut !== event.date_fin && (
                            <> – {formatDate(event.date_fin)}</>
                          )}
                        </p>
                        <p className="text-base font-normal text-rf-gray-light">
                          {event.type_catnat}
                          {event.is_reconnue && (
                            <span>
                              {" "}
                              {["Inondation", "Sécheresse"].includes(
                                event.type_catnat,
                              )
                                ? "reconnue"
                                : "reconnu"}{" "}
                              catastrophe naturelle
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { RfRecognitionRequestChart } from "@/components/core/rf-recognition-request-chart";
import { Separator } from "@/components/ui/separator";
import { CatnatResponse } from "@/lib/types/catnat";
import { useMemo } from "react";
import { DownloadCsvButton } from "@/components/core/download-csv-button";

export const RecognitionRequests = ({ data }: { data: CatnatResponse[] }) => {
  const recognizedRequests = useMemo(
    () => data?.filter((catnat) => catnat.is_reconnue).length ?? 0,
    [data],
  );

  const unrecognizedRequests = useMemo(
    () => (data?.length ?? 0) - recognizedRequests,
    [data, recognizedRequests],
  );

  const csvData = [
    ["Statut", "Nombre de demandes"],
    ["Reconnues", recognizedRequests],
    ["Non reconnues", unrecognizedRequests],
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          Demandes de reconnaissances de catastrophes naturelles
        </CardTitle>
        <CardDescription>
          Reconnues par la commission interministérielle - Depuis 1982
        </CardDescription>
        <CardAction>
          <DownloadCsvButton
            data={csvData}
            filename="demandes-reconnaissance-catastrophes-naturelles"
            className="gap-1.5"
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="w-full md:w-1/2">
          <RfRecognitionRequestChart
            recognized={recognizedRequests}
            unrecognized={unrecognizedRequests}
          />
        </div>
        <Separator orientation="vertical" className="hidden md:block" />
        <div className="w-full md:w-1/2 text-muted-foreground">
          Due to the average rating of general equipment&#39;s end-markets, such
          as safety equipment. 3M Co&#39;s forward-looking performance has a
          neutral impact on its overall rating. Due to the average rating of
          general equipment&#39;s end-markets, such as safety equipment.
        </div>
      </CardContent>
    </Card>
  );
};

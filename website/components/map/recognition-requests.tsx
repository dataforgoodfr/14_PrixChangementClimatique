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

export const RecognitionRequests = ({
  data,
  hideTitle,
}: {
  data: CatnatResponse[];
  hideTitle?: boolean;
}) => {
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
      {!hideTitle && (
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
      )}
      <CardContent
        className={`flex flex-col ${!hideTitle && "md:flex-row"} justify-between items-center gap-4`}
      >
        <div className="w-full">
          <RfRecognitionRequestChart
            recognized={recognizedRequests}
            unrecognized={unrecognizedRequests}
          />
        </div>
        <Separator orientation="vertical" className="hidden md:block" />
        <div className="w-full text-muted-foreground">
          Le maire dispose d’un délai de 24 mois après la survenue du phénomène
          pour déposer sa demande de reconnaissance de l’état de catastrophe
          naturelle auprès du préfet de département. Une commission
          interministérielle est chargée de donner un avis sur chaque dossier
          communal. Elle se prononce sur le caractère naturel et l’intensité
          anormale du phénomène en se basant sur les expertises techniques
          réalisées. Sur le fondement de ces avis, les ministres compétents
          décident de la reconnaissance ou non des communes en état de
          catastrophe naturelle.
        </div>
      </CardContent>
    </Card>
  );
};

import useSWR from "swr";
import { CatnatResponse } from "@/lib/types/catnat";
import { CatnatTypesChart } from "@/components/core/catnat-types-chart";
import { RecognitionRequests } from "./recognition-requests";
import { SectionTitle } from "./section-title";
import { CatnatHistoryTimeline } from "./catnat-history-timeline";

export const CatNatHistory = ({
  communeCode,
  hideTitle,
}: {
  communeCode: string | null;
  hideTitle?: boolean;
}) => {
  const { data: catNatData } = useSWR<CatnatResponse[]>(
    communeCode ? `/api/catnat?code=${communeCode}` : null,
    { keepPreviousData: true },
  );

  return (
    <div className="space-y-10">
      {catNatData?.length ? (
        <>
          {!hideTitle && (
            <SectionTitle
              title="Exposition aux catastrophes naturelles"
              subTitle="Base de données GASPAR"
            />
          )}
          <RecognitionRequests hideTitle={hideTitle} data={catNatData} />
          <CatnatTypesChart hideTitle={hideTitle} data={catNatData} />
          <CatnatHistoryTimeline data={catNatData} />
        </>
      ) : (
        <p>Chargement en cours...</p>
      )}
    </div>
  );
};

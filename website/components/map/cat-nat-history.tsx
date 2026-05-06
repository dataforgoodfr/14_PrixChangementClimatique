import useSWR from "swr";
import { CatnatResponse } from "@/lib/types/catnat";
import { CatnatTypesChart } from "@/components/core/catnat-types-chart";
import { RecognitionRequests } from "./recognition-requests";
import { SectionTitle } from "./section-title";

export const CatNatHistory = ({
  communeCode,
}: {
  communeCode: string | null;
}) => {
  const { data: catNatData } = useSWR<CatnatResponse[]>(
    communeCode ? `/api/catnat?code=${communeCode}` : null,
    { keepPreviousData: true },
  );

  return (
    <div className="p-4 space-y-10">
      {catNatData?.length ? (
        <>
          <SectionTitle
            title="Historique catastrophes naturelles"
            subTitle="Base de données GASPAR"
          />
          <RecognitionRequests data={catNatData} />
          <CatnatTypesChart data={catNatData} />
        </>
      ) : (
        <p>Chargement en cours...</p>
      )}
    </div>
  );
};

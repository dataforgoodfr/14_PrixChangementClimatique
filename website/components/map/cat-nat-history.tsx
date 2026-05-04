import { Commune } from "@/lib/types/communes";
import useSWR from "swr";
import { CatnatResponse } from "@/lib/types/catnat";
import { CatnatTypesChart } from "@/components/core/catnat-types-chart";
import { RecognitionRequests } from "./recognition-requests";
import { SectionTitle } from "./section-title";
import { CatnatHistoryTimeline } from "./catnat-history-timeline";

export const CatNatHistory = ({
  communeCode,
  selectedCommuneData,
}: {
  communeCode: string | null;
  selectedCommuneData: Commune;
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
          <CatnatHistoryTimeline data={catNatData} />
        </>
      ) : (
        <p>Chargement en cours...</p>
      )}
      <table className="w-full">
        <tbody>
          {Object.entries(selectedCommuneData).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-100 last:border-0">
              <td className="py-1.5 pr-3 text-xs text-gray-500 font-medium align-top w-1/2 break-all">
                {key}
              </td>
              <td className="py-1.5 text-xs text-gray-800 align-top break-all">
                {value === null || value === undefined ? (
                  <span className="text-gray-300">—</span>
                ) : typeof value === "object" ? (
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  String(value)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

"use client";

import { Panel } from "@/components/core/panel";
import { useMapContext } from "@/contexts/map-context";

export function FeatureDetailPanel() {
  const { selectedCommune, clearSelectedCommune } = useMapContext();

  return (
    <Panel
      isOpen={selectedCommune !== null}
      onClose={clearSelectedCommune}
      dir="ltr"
      width={460}
      zIndex="z-30"
    >
      <Panel.Header>
        <Panel.Title>
          {String(selectedCommune?.nom_commune ?? "Commune")}
        </Panel.Title>
        {!!selectedCommune?.code_geo && (
          <Panel.Subtitle>
            Code INSEE : {String(selectedCommune.code_geo)}
          </Panel.Subtitle>
        )}
      </Panel.Header>

      <Panel.Content>
        <div className="p-4">
          {selectedCommune ? (
            <table className="w-full">
              <tbody>
                {Object.entries(selectedCommune).map(([key, value]) => (
                  <tr
                    key={key}
                    className="border-b border-gray-100 last:border-0"
                  >
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
          ) : (
            <p className="text-sm text-gray-400 text-center mt-8">
              Cliquez sur une commune pour afficher ses données.
            </p>
          )}
        </div>
      </Panel.Content>
    </Panel>
  );
}

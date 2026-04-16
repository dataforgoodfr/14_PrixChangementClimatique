"use client";

import { Panel } from "@/components/core/panel";
import { useMapContext } from "@/contexts/map-context";

export function FeatureDetailPanel() {
  const { selectedFeature, clearSelectedFeature } = useMapContext();

  return (
    <Panel
      isOpen={selectedFeature !== null}
      onClose={clearSelectedFeature}
      dir="ltr"
      width={800}
      zIndex="z-30"
    >
      <Panel.Header>
        <Panel.Title>
          {String(selectedFeature?.nom_commune ?? "Commune")}
        </Panel.Title>
        {!!selectedFeature?.code_geo && (
          <Panel.Subtitle>
            Code INSEE : {String(selectedFeature.code_geo)}
          </Panel.Subtitle>
        )}
      </Panel.Header>

      <Panel.Content>
        <div className="p-4">
          {selectedFeature ? (
            <table className="w-full">
              <tbody>
                {Object.entries(selectedFeature).map(([key, value]) => (
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

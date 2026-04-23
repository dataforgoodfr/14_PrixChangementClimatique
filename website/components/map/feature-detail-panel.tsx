"use client";

import { Panel } from "@/components/core/panel";
import { useMapContext } from "@/contexts/map-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RfRecognitionRequestChart } from "@/components/core/rf-recognition-request-chart";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { RfVulnerabilityIndex } from "@/components/core/rf-vulnerability-index";
import { MapPinIcon, UserIcon } from "lucide-react";

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
      <Panel.Header className="flex flex-col gap-4 relative md:min-h-72 bg-panel-header">
        <div className="w-full">
          <Panel.Title className="pt-24 pb-4">
            {String(selectedFeature?.nom_commune ?? "Commune")}
          </Panel.Title>
          <Panel.Subtitle>
            <span className="flex gap-2">
              <MapPinIcon className="inline-block size-6" />
              <span>
                {selectedFeature?.region}, {selectedFeature?.departement},{" "}
                {selectedFeature?.code_departement}
              </span>
            </span>
          </Panel.Subtitle>
          <Panel.Subtitle>
            <span className="flex gap-2 pt-2">
              <UserIcon className="inline-block size-6" />
              <span>xxx habitants</span>
            </span>
          </Panel.Subtitle>
        </div>
        {selectedFeature?.indice_vulnerabilite_niveau && (
          <RfVulnerabilityIndex
            className="block w-full md:absolute md:w-70 md:h-60 right-8 top-8"
            value={selectedFeature.indice_vulnerabilite_niveau}
          />
        )}
      </Panel.Header>

      <Panel.Content>
        <div className="p-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                Demandes de reconnaissances de catastrophes naturelles
              </CardTitle>
              <span className="italic text-muted-foreground">
                Reconnues par la commission interministérielle - Depuis 1982
              </span>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-1/2">
                <RfRecognitionRequestChart recognized={53} unrecognized={8} />
              </div>
              <Separator orientation="vertical" className="hidden md:block" />
              <div className="w-full md:w-1/2 text-muted-foreground">
                Due to the average rating of general equipment&#39;s
                end-markets, such as safety equipment. 3M Co&#39;s
                forward-looking performance has a neutral impact on its overall
                rating. Due to the average rating of general equipment&#39;s
                end-markets, such as safety equipment.
              </div>
            </CardContent>
          </Card>
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

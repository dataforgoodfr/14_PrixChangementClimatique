import type { ExpressionSpecification } from "maplibre-gl";
import { CommuneFilters, RangeFilter } from "./types/filters/filters";

function rangeExpressions(
  field: string,
  filter: RangeFilter,
  exclusiveMax = false,
): ExpressionSpecification[] {
  const get: ExpressionSpecification = ["get", field];
  return [
    [">=", get, filter.min],
    exclusiveMax ? ["<", get, filter.max] : ["<=", get, filter.max],
  ];
}

export function buildMaplibreFilter(
  filters: CommuneFilters,
): ExpressionSpecification {
  const all: ExpressionSpecification[] = [];

  // --- Vulnérabilité ---
  if (filters.indice_vulnerabilite_niveau)
    all.push(
      ...rangeExpressions(
        "indice_vulnerabilite_niveau",
        filters.indice_vulnerabilite_niveau,
        filters.indice_vulnerabilite_niveau.max < 5,
      ),
    );
  if (filters.population)
    all.push(...rangeExpressions("population", filters.population));
  if (filters.depenses_per_pop)
    all.push(...rangeExpressions("depenses_per_pop", filters.depenses_per_pop));

  // --- Exposition ---
  if (filters.indicateur_rga)
    all.push(...rangeExpressions("indicateur_rga", filters.indicateur_rga));
  if (filters.indicateur_tri)
    all.push(...rangeExpressions("indicateur_tri", filters.indicateur_tri));
  if (filters.nb_total_arretes_recon)
    all.push(
      ...rangeExpressions(
        "nb_total_arretes_recon",
        filters.nb_total_arretes_recon,
      ),
    );

  // --- Prévention ---
  if (filters.pprn_rga !== undefined)
    all.push(["==", ["get", "pprn_rga"], filters.pprn_rga]);
  if (filters.pprn_ino !== undefined)
    all.push(["==", ["get", "pprn_ino"], filters.pprn_ino]);

  // --- Situation économique ---
  if (filters.taux_endettement)
    all.push(...rangeExpressions("taux_endettement", filters.taux_endettement));
  if (filters.impots_locaux_2024)
    all.push(...rangeExpressions("impots_locaux_2024", filters.impots_locaux_2024));
  if (filters.taux_evolution_impots_locaux)
    all.push(
      ...rangeExpressions(
        "taux_evolution_impots_locaux",
        filters.taux_evolution_impots_locaux,
      ),
    );

  // --- Assurance ---
  if (filters.prime_assurance_2024)
    all.push(
      ...rangeExpressions("prime_assurance_2024", filters.prime_assurance_2024),
    );
  if (filters.taux_evolution_prime_assurance)
    all.push(
      ...rangeExpressions(
        "taux_evolution_prime_assurance",
        filters.taux_evolution_prime_assurance,
      ),
    );
  if (filters.part_prime_budget_2024)
    all.push(
      ...rangeExpressions(
        "part_prime_budget_2024",
        filters.part_prime_budget_2024,
      ),
    );

  return all.length === 0 ? ["literal", true] : ["all", ...all];
}

import { NextRequest } from "next/server";

const CODE_COMMUNE_REGEX = /^\d{5}$/;

export function getCommuneCodeFromUrl(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return searchParams.get("code");
}

export function isValidCodeCommune(code: string | null): code is string {
  return typeof code === "string" && CODE_COMMUNE_REGEX.test(code);
}

export const VALIDATION_ERRORS = {
  INVALID_CODE_COMMUNE:
    "Paramètre 'code' invalide : code INSEE à 5 chiffres attendu",
} as const;

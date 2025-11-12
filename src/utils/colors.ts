import type { UFInfo } from "./formatters";

export type Region = UFInfo["regiao"];

export const REGION_COLORS: Record<Region, string> = {
  Norte: "#3B82F6",
  Nordeste: "#EF4444",
  "Centro-Oeste": "#22C55E",
  Sudeste: "#F59E0B",
  Sul: "#8B5CF6",
};

export function getRegionColor(regiao: string | null | undefined): string {
  if (!regiao) return "#004F6D";
  return (REGION_COLORS as Record<string, string>)[regiao] ?? "#004F6D";
}

export const getRegonColor = getRegionColor;

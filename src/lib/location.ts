import type { Zone } from "@prisma/client";

export const ZONE_LABEL: Record<Zone, string> = {
  CDA: "CDA",
  DHA: "DHA",
  BAHRIA_TOWN: "Bahria Town",
  BAHRIA_ENCLAVE: "Bahria Enclave",
  PRIVATE_SCHEME: "Private Scheme",
};

export interface LocationHierarchy {
  city: string;
  zone: Zone;
  sector?: string | null;
  phase?: string | null;
  society?: string | null;
  subSector?: string | null;
}

/**
 * Builds the breadcrumb trail for a listing's location, per the two
 * hierarchy branches in the SRS:
 *   City › CDA › Sector › Subsector/Society
 *   City › DHA / Bahria Town / Bahria Enclave › Phase › Sector
 */
export function buildLocationBreadcrumb(location: LocationHierarchy): string[] {
  const { city, zone, sector, phase, society, subSector } = location;
  const crumbs: string[] = [city, ZONE_LABEL[zone]];

  if (zone === "CDA") {
    if (sector) crumbs.push(sector);
    if (subSector ?? society) crumbs.push((subSector ?? society) as string);
    return crumbs;
  }

  if (zone === "DHA" || zone === "BAHRIA_TOWN" || zone === "BAHRIA_ENCLAVE") {
    if (phase) crumbs.push(phase);
    if (sector) crumbs.push(sector);
    return crumbs;
  }

  // PRIVATE_SCHEME
  if (society) crumbs.push(society);
  return crumbs;
}

export function formatLocationBreadcrumb(location: LocationHierarchy): string {
  return buildLocationBreadcrumb(location).join(" › ");
}

import type {CustomIndicator, RawGoalIndicator} from "@/lib/auroraIndicators";

// Single interface containing all possible fields
export interface AreaData {
  siteName?: string;
  ecosystems?: string[];
  goalIndicators?: RawGoalIndicator[];
  customIndicators?: CustomIndicator[];
  gefIndicator?: string;
  area?: number;
  activities?: number[];
  // Admin area fields
  admin0?: number;
  admin1?: number;
  admin2?: number;
  // Geo area field
  uuid?: string;
  restorationType?: number;
  tenureStatus?: number;
  activitiesOther?: string;
}

export type AreaDataKey = keyof AreaData;

// Area objects with specific keys for type discrimination
export interface AdminAreaObject {
  adminArea: AreaData;
}

export interface UploadAreaObject {
  upload: AreaData;
}

export interface KmlUploadAreaObject {
  uploadKml: AreaData;
}

export interface DrawAreaObject {
  draw: AreaData;
}

export interface GroundAreaObject {
  ground: AreaData;
}

export type AreaObject =
  | AdminAreaObject
  | UploadAreaObject
  | KmlUploadAreaObject
  | DrawAreaObject
  | GroundAreaObject;

// Type guard functions
export function isAdminArea(area: AreaObject): area is AdminAreaObject {
  return 'adminArea' in area;
}

export function isUploadArea(area: AreaObject): area is UploadAreaObject {
  return 'upload' in area;
}

export function isKmlUploadArea(area: AreaObject): area is KmlUploadAreaObject {
  return 'uploadKml' in area;
}

export function isDrawArea(area: AreaObject): area is DrawAreaObject {
  return 'draw' in area;
}

export function isGroundArea(area: AreaObject): area is GroundAreaObject {
  return 'ground' in area;
}

export function isGeoArea(area: AreaObject): area is UploadAreaObject | KmlUploadAreaObject | DrawAreaObject | GroundAreaObject {
  return isUploadArea(area) || isKmlUploadArea(area) || isDrawArea(area) || isGroundArea(area);
}

export type AreaValue<T extends AreaObject> = AreaData;

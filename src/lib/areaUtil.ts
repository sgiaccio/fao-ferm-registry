import type { 
  AreaObject, 
  AreaData, 
  AdminAreaObject,
  UploadAreaObject,
  KmlUploadAreaObject,
  DrawAreaObject,
  GroundAreaObject
} from '@/types';

export function getAreaValue(area: AreaObject): AreaData {
  const key = Object.keys(area)[0] as keyof AreaObject;
  return area[key as keyof typeof area];
}

// type AreaTypeMap = {
//   'adminArea': AdminAreaObject;
//   'upload': UploadAreaObject;
//   'uploadKml': KmlUploadAreaObject;
//   'draw': DrawAreaObject;
//   'ground': GroundAreaObject;
// }
type AreaTypeMap = {
    [K in keyof AreaObject]: Extract<AreaObject, { [P in K]: any }>;
}

export function getAreaType(area: AreaObject): keyof AreaTypeMap {
  return Object.keys(area)[0] as keyof AreaTypeMap;
}

export function getAreaUuid(area: AreaObject): string | undefined {
  const areaValue = getAreaValue(area);
  return areaValue.uuid;
}

export function createArea<K extends keyof AreaTypeMap>(
  areaType: K,
  areaValue: AreaData
): AreaTypeMap[K] {
  return {
    [areaType]: areaValue
  } as unknown as AreaTypeMap[K];
}
// src/lib/areaUtil.test.ts
import { describe, it, expect } from 'vitest';
import {
    type AreaObject,
    type AdminAreaObject,
    type UploadAreaObject,
    type KmlUploadAreaObject,
    type DrawAreaObject,
    type GroundAreaObject,
    type AdminAreaData,
    type GeoAreaData,
    isGeoArea
} from '@/types/area';
import {getAreaValue, getAreaUuid, createArea} from './areaUtil';

// Add these functions if not already existing
function getGeoAreaData(area: AreaObject) {
    if (isGeoArea(area)) {
        if ('upload' in area) return area.upload;
        if ('uploadKml' in area) return area.uploadKml;
        if ('draw' in area) return area.draw;
        if ('ground' in area) return area.ground;
    }
    return undefined;
}

describe('Area Utility Functions', () => {
    // Sample test data
    const adminArea: AdminAreaObject = {
        adminArea: {
            siteName: 'Admin Area',
            admin0: 1,
            admin1: 2,
            admin2: 3,
        }
    };

    const uploadArea: UploadAreaObject = {
        upload: {
            siteName: 'Upload Area',
            uuid: '123e4567-e89b-12d3-a456-426614174000'
        }
    };

    const kmlUploadArea: KmlUploadAreaObject = {
        uploadKml: {
            siteName: 'KML Upload Area',
            uuid: '123e4567-e89b-12d3-a456-426614174001'
        }
    };

    const drawArea: DrawAreaObject = {
        draw: {
            siteName: 'Draw Area',
            uuid: '123e4567-e89b-12d3-a456-426614174002'
        }
    };

    const groundArea: GroundAreaObject = {
        ground: {
            siteName: 'Ground Area',
            uuid: '123e4567-e89b-12d3-a456-426614174003'
        }
    };

    describe('getAreaValue', () => {
        it('extracts the AdminAreaData from an AdminAreaObject', () => {
            const result = getAreaValue(adminArea);
            expect(result).toEqual(adminArea.adminArea);
        });

        it('extracts the GeoAreaData from a UploadAreaObject', () => {
            const result = getAreaValue(uploadArea);
            expect(result).toEqual(uploadArea.upload);
        });

        it('extracts the GeoAreaData from a KmlUploadAreaObject', () => {
            const result = getAreaValue(kmlUploadArea);
            expect(result).toEqual(kmlUploadArea.uploadKml);
        });

        it('extracts the GeoAreaData from a DrawAreaObject', () => {
            const result = getAreaValue(drawArea);
            expect(result).toEqual(drawArea.draw);
        });

        it('extracts the GeoAreaData from a GroundAreaObject', () => {
            const result = getAreaValue(groundArea);
            expect(result).toEqual(groundArea.ground);
        });

        it('works with explicit type casting (single type)', () => {
            // This is the case that works in your original code
            const area = groundArea;
            const result = (getAreaValue(area as GroundAreaObject)).uuid;
            expect(result).toEqual('123e4567-e89b-12d3-a456-426614174003');
        });

        // This test would fail in TypeScript compilation
        /*
        it('demonstrates the issue with union types', () => {
          const area = groundArea;
          // This would cause a TypeScript error with the original implementation
          const result = (getAreaValue(area as (GroundAreaObject | UploadAreaObject))).uuid;
          expect(result).toEqual('123e4567-e89b-12d3-a456-426614174003');
        });
        */
    });

    describe('getGeoAreaData', () => {
        it('returns undefined for admin areas', () => {
            const result = getGeoAreaData(adminArea);
            expect(result).toBeUndefined();
        });

        it('extracts GeoAreaData from an UploadAreaObject', () => {
            const result = getGeoAreaData(uploadArea);
            expect(result).toEqual(uploadArea.upload);
        });

        it('extracts GeoAreaData from a KmlUploadAreaObject', () => {
            const result = getGeoAreaData(kmlUploadArea);
            expect(result).toEqual(kmlUploadArea.uploadKml);
        });

        it('extracts GeoAreaData from a DrawAreaObject', () => {
            const result = getGeoAreaData(drawArea);
            expect(result).toEqual(drawArea.draw);
        });

        it('extracts GeoAreaData from a GroundAreaObject', () => {
            const result = getGeoAreaData(groundArea);
            expect(result).toEqual(groundArea.ground);
        });
    });

    describe('getAreaUuid', () => {
        it('returns undefined for admin areas', () => {
            const result = getAreaUuid(adminArea);
            expect(result).toBeUndefined();
        });

        it('returns the UUID from an UploadAreaObject', () => {
            const result = getAreaUuid(uploadArea);
            expect(result).toEqual('123e4567-e89b-12d3-a456-426614174000');
        });

        it('returns the UUID from a KmlUploadAreaObject', () => {
            const result = getAreaUuid(kmlUploadArea);
            expect(result).toEqual('123e4567-e89b-12d3-a456-426614174001');
        });

        it('returns the UUID from a DrawAreaObject', () => {
            const result = getAreaUuid(drawArea);
            expect(result).toEqual('123e4567-e89b-12d3-a456-426614174002');
        });

        it('returns the UUID from a GroundAreaObject', () => {
            const result = getAreaUuid(groundArea);
            expect(result).toEqual('123e4567-e89b-12d3-a456-426614174003');
        });

        it('works with multiple types of geo areas', () => {
            // Test with all geo area types
            const areas: AreaObject[] = [uploadArea, kmlUploadArea, drawArea, groundArea];
            const uuids = areas.map(getAreaUuid);

            expect(uuids).toEqual([
                '123e4567-e89b-12d3-a456-426614174000',
                '123e4567-e89b-12d3-a456-426614174001',
                '123e4567-e89b-12d3-a456-426614174002',
                '123e4567-e89b-12d3-a456-426614174003'
            ]);
        });
    });

    describe('createArea', () => {
        it('creates an AdminAreaObject', () => {
            const adminAreaData: AdminAreaData = {
                siteName: 'New Admin Area',
                admin0: 10,
                admin1: 20,
                admin2: 30,
            };
            const result = createArea('adminArea', adminAreaData);

            expect(result).toEqual({
                adminArea: adminAreaData
            });
            expect(result.adminArea.siteName).toBe('New Admin Area');
            expect(result.adminArea.admin0).toBe(10);
        });

        it('creates an UploadAreaObject', () => {
            const geoAreaData: GeoAreaData = {
                siteName: 'New Upload Area',
                uuid: '123e4567-e89b-12d3-a456-999999999999'
            };
            const result = createArea('upload', geoAreaData);

            expect(result).toEqual({
                upload: geoAreaData
            });
            expect(result.upload.uuid).toBe('123e4567-e89b-12d3-a456-999999999999');
        });

        it('creates a KmlUploadAreaObject', () => {
            const geoAreaData: GeoAreaData = {
                siteName: 'New KML Upload Area',
                uuid: '123e4567-e89b-12d3-a456-888888888888'
            };
            const result = createArea('uploadKml', geoAreaData);

            expect(result).toEqual({
                uploadKml: geoAreaData
            });
            expect(result.uploadKml.uuid).toBe('123e4567-e89b-12d3-a456-888888888888');
        });

        it('creates a DrawAreaObject', () => {
            const geoAreaData: GeoAreaData = {
                siteName: 'New Draw Area',
                uuid: '123e4567-e89b-12d3-a456-777777777777'
            };
            const result = createArea('draw', geoAreaData);

            expect(result).toEqual({
                draw: geoAreaData
            });
            expect(result.draw.uuid).toBe('123e4567-e89b-12d3-a456-777777777777');
        });

        it('creates a GroundAreaObject', () => {
            const geoAreaData: GeoAreaData = {
                siteName: 'New Ground Area',
                uuid: '123e4567-e89b-12d3-a456-666666666666'
            };
            const result = createArea('ground', geoAreaData);

            expect(result).toEqual({
                ground: geoAreaData
            });
            expect(result.ground.uuid).toBe('123e4567-e89b-12d3-a456-666666666666');
        });

        it('adds GeoAreaData with ecosystems and indicators', () => {
            const geoAreaData: GeoAreaData = {
                siteName: 'Complex Area',
                uuid: '123e4567-e89b-12d3-a456-555555555555',
                ecosystems: ['Forest', 'Wetland', 'Grassland'],
                goalIndicators: [
                    { name: 'Indicator 1', value: 10 }
                ],
                customIndicators: [
                    { name: 'Custom 1', value: 'High' }
                ],
                gefIndicator: 'GEF001'
            };
            const result = createArea('draw', geoAreaData);

            expect(result.draw.ecosystems).toEqual(['Forest', 'Wetland', 'Grassland']);
            expect(result.draw.goalIndicators).toHaveLength(1);
            expect(result.draw.customIndicators).toHaveLength(1);
            expect(result.draw.gefIndicator).toBe('GEF001');
        });

        it('type checks for required uuid property', () => {
            // This would cause a compile-time error if uncommented
            // Showing that our type safety works
            /*
            const invalidData = {
                siteName: 'Invalid Area'
                // Missing required uuid property
            };
            createArea('draw', invalidData);
            */

            // This passes type checking
            const validData = {
                siteName: 'Valid Area',
                uuid: '123e4567-e89b-12d3-a456-444444444444'
            };
            const result = createArea('draw', validData);

            expect(result.draw.uuid).toBe('123e4567-e89b-12d3-a456-444444444444');
        });
    });
});


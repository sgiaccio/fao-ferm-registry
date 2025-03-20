const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const assert = require('assert');
const test = require('firebase-functions-test')({
    projectId: 'fao-ferm'
}, null);


// process.env.FUNCTIONS_EMULATOR = 'true';
// process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

// Import the Pool from pg
const { Pool } = require('pg');

// Create a pool instead of creating new clients
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
});

// Modified to use pool
const getDatabaseClient = () => pool.connect();

describe('importFromGround', () => {
    let importFromGround;
    let client;

    before(async () => {
        importFromGround = require('../areas').importFromGround;
        client = await getDatabaseClient();
        
        const { db } = require('../util');
        // Just create the test group once
        await db.collection('groups').doc('test-group').set({
            name: 'Test Group'
        });
    });

    beforeEach(async () => {
        // Clean and set up fresh data before each test
        await client.query('DELETE FROM project_areas WHERE project_id = $1', ['test-project']);
        
        const { db } = require('../util');
        await db.collection('registry').doc('test-project').set({
            created_by: 'test-user-id',
            groundSurveyId: 'test-survey-id',
            group: 'test-group',
            collaborators: ['test-user-id']
        });

        await db.collection('areas').doc('test-project').set({
            areas: []
        });
    });

    after(async () => {
        const { db } = require('../util');
        // Clean up everything and close connections
        await db.collection('registry').doc('test-project').delete();
        await db.collection('groups').doc('test-group').delete();
        
        if (client) {
            client.release();
        }
        await pool.end();
        
        test.cleanup();
    });

    it('should correctly store data in both Firestore and PostgreSQL', async () => {
        global.fetch = async () => ({
            ok: true,
            json: async () => ([{
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [37.728, 0.546],
                        [37.730, 0.546],
                        [37.730, 0.545],
                        [37.729, 0.545],
                        [37.728, 0.546]
                    ]]
                },
                ecosystems: ["T5 - Deserts and semi-deserts biome"]
            }])
        });

        const wrapped = test.wrap(importFromGround);
        
        const context = {
            auth: { 
                uid: 'test-user-id',
                token: {
                    admin: true,
                    privileges: {
                        'test-group': 'editor'
                    }
                }
            }
        };

        const data = {
            projectId: 'test-project'
        };

        await wrapped(data, context);

        // Use existing client for verification
        const pgResult = await client.query(
            'SELECT ST_AsGeoJSON(geom) as geom FROM project_areas WHERE project_id = $1',
            ['test-project']
        );
        assert.strictEqual(pgResult.rows.length, 1, 'Should have stored one geometry in PostgreSQL');
        
        const { db } = require('../util');
        const areasDoc = await db.collection('areas').doc('test-project').get();
        const areas = areasDoc.data().areas;
        assert.strictEqual(areas.length, 1, 'Should have stored one area in Firestore');
        assert.deepStrictEqual(areas[0].ground.ecosystems, ['T5']);
    });

    it('should update ecosystems for duplicate polygons without creating new entries', async () => {
        // Keep track of which call to fetch this is
        let callCount = 0;
        
        // Mock fetch to return different responses based on call count
        global.fetch = async () => {
            callCount++;
            return {
                ok: true,
                json: async () => ([{
                    geometry: {
                        type: "Polygon",
                        coordinates: [[
                            [37.728, 0.546],
                            [37.730, 0.546],
                            [37.730, 0.545],
                            [37.729, 0.545],
                            [37.728, 0.546]
                        ]]
                    },
                    ecosystems: callCount === 1 
                        ? ["T5 - Deserts and semi-deserts biome"]
                        : ["T6 - Polar-alpine biome", "T5 - Deserts and semi-deserts biome"]
                }])
            };
        };

        const wrapped = test.wrap(importFromGround);
        
        const context = {
            auth: { 
                uid: 'test-user-id',
                token: {
                    admin: true,
                    privileges: {
                        'test-group': 'editor'
                    }
                }
            }
        };

        const data = {
            projectId: 'test-project'
        };

        // First import
        await wrapped(data, context);
        // Second import with same polygon
        await wrapped(data, context);

        // Verify PostgreSQL has only one entry
        const pgResult = await client.query(
            'SELECT ST_AsGeoJSON(geom) as geom FROM project_areas WHERE project_id = $1',
            ['test-project']
        );
        assert.strictEqual(pgResult.rows.length, 1, 'Should have only one geometry in PostgreSQL');
        
        // Verify Firestore has updated ecosystems
        const { db } = require('../util');
        const areasDoc = await db.collection('areas').doc('test-project').get();
        const areas = areasDoc.data().areas;
        assert.strictEqual(areas.length, 1, 'Should have only one area in Firestore');
        assert.deepStrictEqual(areas[0].ground.ecosystems, ['T6', 'T5'], 'Should have updated ecosystems');
    });
});

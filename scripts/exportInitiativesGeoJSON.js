const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Function to display usage information
function showUsage() {
    console.log(`
Usage: node exportInitiativesGeoJSON.js [options]

Options:
  --help                 Show this help message
  --user <username>      Database username (default: from env or 'postgres')
  --host <hostname>      Database host (default: from env or 'localhost')
  --database <dbname>    Database name (default: 'interop')
  --password <password>  Database password (default: from env)
  --port <port>          Database port (default: from env or 5432)
  --env <path>           Path to .env file (default: '../env/.env.development')
  --output <path>        Output directory for GeoJSON files (default: './exports')
  --id <initiative_id>   Filter by initiative ID (can be specified multiple times)
  --enrich               Fetch additional attributes from BigQuery

Examples:
  node exportInitiativesGeoJSON.js --host localhost --database interop --output ./my-exports
  node exportInitiativesGeoJSON.js --id ABC123 --id DEF456 --enrich
`);
    process.exit(0);
}

// Parse command line arguments
const args = process.argv.slice(2);
const argMap = {};
const singleDashArgs = [];
const initiativeIds = [];

for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
        // Handle double-dash arguments (correct format)
        const key = arg.replace(/^--/, '');
        const nextArg = args[i + 1];

        // Special handling for --id parameter (can be specified multiple times)
        if (key === 'id' && nextArg && !nextArg.startsWith('-')) {
            initiativeIds.push(nextArg);
            i++;
        } else if (nextArg && !nextArg.startsWith('-')) {
            argMap[key] = nextArg;
            i++;
        } else {
            argMap[key] = true;
        }
    } else if (arg.startsWith('-') && !arg.startsWith('--')) {
        // Track single-dash arguments (incorrect format)
        singleDashArgs.push(arg);
    }
}

// Warn about single-dash arguments
if (singleDashArgs.length > 0) {
    console.warn(
        `Warning: Found arguments with single dash: ${singleDashArgs.join(', ')}`,
    );
    console.warn(
        'Arguments should use double dashes (--) instead of single dash (-). For example: --host instead of -host',
    );
    console.warn(
        'These arguments will be ignored. Use --help for correct usage information.',
    );
}

// Show help if requested - handle both correct (--help) and incorrect (-help, -h) formats
if (
    argMap.help ||
    argMap.h ||
    singleDashArgs.includes('-help') ||
    singleDashArgs.includes('-h')
) {
    showUsage();
}

// Load environment variables from .env file
const envPath =
    argMap.env || path.resolve(__dirname, '../env/.env.development');
dotenv.config({ path: envPath });

// Database connection configuration
const client = new Client({
    user: argMap.user || process.env.DB_USER || 'postgres',
    host: argMap.host || process.env.DB_HOST || 'localhost',
    database: argMap.database || 'interop', // The database name from the issue description
    password: argMap.password || process.env.DB_PASSWORD || '',
    port: parseInt(argMap.port || process.env.DB_PORT || '5432'),
});

/**
 * Fetches additional attributes from BigQuery for the given initiative IDs
 * @param {Array<string>} initiativeIds - Array of initiative IDs to query
 * @returns {Promise<Object>} - Map of initiative IDs to their attributes
 */
async function fetchBigQueryAttributes(initiativeIds) {
    console.log('Fetching additional attributes from BigQuery...');

    // Build the BigQuery query
    let query = `
    WITH data AS (
      SELECT * FROM \`fao-ferm2-review.initiatives.vw_cse\`
    )
    SELECT 
      initiative_id,
      title,
      source,
      restoration_status,
      country_codes_iso3,
      restoration_types,
      last_updated
    FROM data
  `;

    // Add WHERE clause if initiative IDs are provided
    if (initiativeIds.length > 0) {
        const idList = initiativeIds.map((id) => `'${id}'`).join(', ');
        query += ` WHERE initiative_id IN (${idList})`;
    }

    // Encode the query for the URL
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.data.apps.fao.org/api/v2/bigquery?query=${encodedQuery}&output_format=json&download=false`;

    try {
        // Make the request to the BigQuery API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`BigQuery API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log(`Found ${data.length} initiatives in BigQuery`);

        // Create a map of initiative IDs to their attributes
        const attributesMap = {};
        data.forEach((item) => {
            attributesMap[item.initiative_id] = item;
        });

        return attributesMap;
    } catch (error) {
        console.error('Error fetching data from BigQuery:', error);
        return {};
    }
}

async function exportInitiativesGeoJSON() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected to database');

        // Query the initiatives table
        console.log('Querying initiatives table...');
        let query = `
      SELECT 
        id, 
        initiative_id, 
        properties, 
        ST_AsGeoJSON(geom_4326) as geojson
      FROM 
        initiatives
      OFFSET 2
      LIMIT 1
    `;

        // Add WHERE clause if initiative IDs are provided
        if (initiativeIds.length > 0) {
            const placeholders = initiativeIds
                .map((_, i) => `$${i + 1}`)
                .join(', ');
            query += `WHERE initiative_id IN (${placeholders})`;
            console.log(
                `Filtering by initiative IDs: ${initiativeIds.join(', ')}`,
            );
        }

        // Execute the query with or without parameters
        const result =
            initiativeIds.length > 0
                ? await client.query(query, initiativeIds)
                : await client.query(query);
        console.log(`Found ${result.rows.length} initiatives`);

        if (result.rows.length === 0) {
            console.log('No initiatives found');
            return;
        }

        // Fetch additional attributes from BigQuery if requested
        let bigQueryAttributes = {};
        if (argMap.enrich) {
            console.log(
                'Enrichment requested, fetching additional attributes from BigQuery...',
            );
            // Use the initiative IDs from the query results if none were specified
            const idsToQuery =
                initiativeIds.length > 0
                    ? initiativeIds
                    : result.rows.map((row) => row.initiative_id);

            bigQueryAttributes = await fetchBigQueryAttributes(idsToQuery);
            console.log(
                `Retrieved attributes for ${Object.keys(bigQueryAttributes).length} initiatives from BigQuery`,
            );
        }

        // Convert the database results to GeoJSON format
        const features = result.rows
            .map((row) => {
                // Parse the GeoJSON string to an object
                let geometry = JSON.parse(row.geojson);

                // Log the geometry structure for debugging
                console.log(`Geometry type: ${geometry.type}`);

                // Handle GeometryCollection by extracting the first geometry
                if (geometry.type === 'GeometryCollection') {
                    console.log(
                        'Found GeometryCollection, extracting first geometry',
                    );
                    if (geometry.geometries && geometry.geometries.length > 0) {
                        geometry = geometry.geometries[0];
                    } else {
                        console.log(
                            'Empty GeometryCollection, skipping feature',
                        );
                        return null;
                    }
                }

                // Ensure coordinates exist
                if (
                    !geometry.coordinates ||
                    geometry.coordinates.length === 0
                ) {
                    console.log(
                        'Geometry has no coordinates, skipping feature',
                    );
                    return null;
                }

                // Extract properties from the jsonb column
                let properties = {};
                if (row.properties) {
                    properties =
                        typeof row.properties === 'string'
                            ? JSON.parse(row.properties)
                            : row.properties;
                }

                // Add the id and initiative_id to the properties
                properties.id = row.id;
                properties.initiative_id = row.initiative_id;

                // Enrich with BigQuery attributes if available
                if (argMap.enrich && bigQueryAttributes[row.initiative_id]) {
                    const bqData = bigQueryAttributes[row.initiative_id];

                    // Add BigQuery attributes to properties
                    properties.title = bqData.title;
                    properties.source = bqData.source;
                    properties.restoration_status = bqData.restoration_status;
                    properties.country_codes_iso3 = bqData.country_codes_iso3;
                    properties.restoration_types = bqData.restoration_types;
                    properties.last_updated = bqData.last_updated;

                    console.log(
                        `Enriched feature ${row.initiative_id} with BigQuery attributes`,
                    );
                }

                return {
                    type: 'Feature',
                    geometry: geometry,
                    properties: properties,
                };
            })
            .filter((feature) => feature !== null);

        // Create a GeoJSON FeatureCollection
        const featureCollection = {
            type: 'FeatureCollection',
            features: features,
        };

        // Check if we have any valid features
        if (features.length === 0) {
            console.log('No valid features to export');
            return;
        }

        console.log(`Exporting ${features.length} valid features as GeoJSON`);

        // Log geometry types for information
        const geometryTypes = {};
        features.forEach((feature) => {
            const type = feature.geometry.type;
            geometryTypes[type] = (geometryTypes[type] || 0) + 1;
        });
        console.log('Geometry type counts:', geometryTypes);

        try {
            // Create output directory if it doesn't exist
            const outputDir = argMap.output || path.join(__dirname, 'exports');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // Write GeoJSON to disk
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputPath = path.join(
                outputDir,
                `initiatives_${timestamp}.geojson`,
            );
            fs.writeFileSync(
                outputPath,
                JSON.stringify(featureCollection, null, 2),
            );
            console.log(`Created ${outputPath}`);

            // Log enrichment status
            if (argMap.enrich) {
                console.log(
                    `GeoJSON export completed successfully with BigQuery enrichment (${Object.keys(bigQueryAttributes).length} initiatives enriched)`,
                );
            } else {
                console.log(
                    'GeoJSON export completed successfully (without BigQuery enrichment)',
                );
            }
        } catch (error) {
            console.error('Error exporting GeoJSON:', error);
        }
    } catch (error) {
        console.error('Error exporting initiatives:', error);
    } finally {
        // Close the database connection
        await client.end();
        console.log('Database connection closed');
    }
}

// Run the export function
exportInitiativesGeoJSON().catch((error) => {
    console.error('Unhandled error:', error);
});

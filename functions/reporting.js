const functions = require("firebase-functions/v1");
const { db } = require("./util");

/**
 * Gets all public projects published between two dates, including their areas
 * @param {Date} [sinceDate] - Optional start date to filter projects from
 * @param {Date} [toDate] - Optional end date to filter projects to
 * @returns {Promise<Array>} Array of public projects with their areas
 */
async function _getPublicProjectsSinceDate(sinceDate, toDate) {
    // Start with the base query
    let query = db.collection('publicProjects');

    // Add date filters if provided
    // if (sinceDate) {
    //     query = query.where('publishedTime', '>=', sinceDate);
    // }
    // if (toDate) {
    //     query = query.where('publishedTime', '<=', toDate);
    // }


    const projectsSnapshot = await query.get();

    // Process each project and fetch its areas
    let projects = await Promise.all(
        projectsSnapshot.docs.map(async (doc) => {
            const projectData = doc.data();

            // Get the areas from the publicAreas subcollection
            const areasSnapshot = await doc.ref.collection('publicAreas').get();

            const areas = areasSnapshot.docs.map(areaDoc => areaDoc.data());

            return {
                ...projectData,
                areas
            };
        })
    );

    // filter by date
    projects = projects.filter(p => {
        const publishDate = (p.publishedTime || p.updateTime).toDate();
        const sinceDateObj = new Date(sinceDate);
        const toDateObj = new Date(toDate);
        return publishDate >= sinceDateObj && publishDate <= toDateObj;
    });
    // print all project dates for debugging
    return projects;
}




function areaByGefIndicator(areas) {
    return Object.entries(
        areas.reduce((acc, area) => {
            const { gefIndicator, area: areaValue } = Object.values(area)[0];
            return gefIndicator ? {
                ...acc,
                [gefIndicator]: (acc[gefIndicator] || 0) + (+areaValue || 0)
            } : acc;
        }, {}))
        .sort((a, b) => {
            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;
            return 0;
        });
}

function areaByGefIndicatorGroup(areas) {
    const indicators = areaByGefIndicator(areas);
    const areabyIndicatorGroup = indicators.reduce((prev, [id, area]) => {
        const newId = id === 'GEF2LDCF' ? '2LDCF' : id.slice(3, 4);
        return prev.set(newId, (prev.get(newId) || 0) + area);
    }, new Map());
    return Array.from(areabyIndicatorGroup);
}




/**
 * Generates a report with statistics about published initiatives
 * @param {Array} projects - Array of public projects with their areas
 * @returns {Object} Report containing statistics
 */
function generateInitiativeReport(projects) {
    const report = {
        totalInitiatives: projects.length,
        initiativesByMonth: {},
        initiativesByYear: {},
        totalArea: 0,
        averageAreaPerInitiative: 0
    };

    const countries = new Set();
    const ecosystems = new Set();
    let areaUnderRestoration = 0;

    // Calculate statistics
    projects.forEach(project => {
        try {
            const publishDate = (project.publishedTime || project.updateTime).toDate();
            const monthKey = `${publishDate.getFullYear()}-${String(publishDate.getMonth() + 1).padStart(2, '0')}`;
            const yearKey = publishDate.getFullYear().toString();

            // Count initiatives by month
            report.initiativesByMonth[monthKey] = (report.initiativesByMonth[monthKey] || 0) + 1;

            // Count initiatives by year
            report.initiativesByYear[yearKey] = (report.initiativesByYear[yearKey] || 0) + 1;

            // Calculate total area
            project.areas.forEach(area => {
                report.totalArea += area.area || 0;
            });

            // collect all countries
            projectCountries = project.project.countries;
            if (projectCountries) {
                projectCountries.forEach(country => {
                    countries.add(country);
                });
            }

            if (project.reportingLine !== 'GEF') {
                areaUnderRestoration += project.project.areaUnderRestoration || 0;
            } else {
                const areaUnder3 = areaByGefIndicatorGroup(project.areas).find(i => i[0] === '3')
                areaUnderRestoration += areaUnder3 ? areaUnder3[1] : 0;
            }
        } catch (error) {
            console.error('Error with project:', project.project.title, error);
        }
    });

    // Calculate average area per initiative
    report.averageAreaPerInitiative = report.totalInitiatives > 0
        ? report.totalArea / report.totalInitiatives
        : 0;

    // collect all ecosystems
    projects.forEach(project => {
        if (project.areas) {
            project.areas.forEach(area => {
                const areaObj = Object.values(area)[0];
                if (areaObj.ecosystems) {
                    areaObj.ecosystems.forEach(ecosystem => {
                        ecosystems.add(ecosystem);
                    });
                }
            });
        }
    });

    report.nCountries = countries.size;
    report.nEcosystems = ecosystems.size;
    report.areaUnderRestoration = areaUnderRestoration;

    return report;
}

/**
 * Callable function that gets all public projects published between two dates and generates a report
 * @param {Object} data - The request data
 * @param {string} [data.sinceDate] - Optional ISO string of the start date
 * @param {string} [data.toDate] - Optional ISO string of the end date
 * @param {Object} _context - The function context
 * @returns {Promise<Object>} Report containing statistics about published initiatives
 */
exports.generateInitiativeReport = functions
    .region('europe-west3')
    .https
    .onCall(async (data, _context) => {
        try {
            // Get the date parameters
            const sinceDate = data.sinceDate ? new Date(data.sinceDate) : null;
            const toDate = data.toDate ? new Date(data.toDate) : new Date();

            // Validate dates
            if (sinceDate && isNaN(sinceDate.getTime())) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid sinceDate format');
            }
            if (toDate && isNaN(toDate.getTime())) {
                throw new functions.https.HttpsError('invalid-argument', 'Invalid toDate format');
            }

            // Get the projects
            const projects = await _getPublicProjectsSinceDate(sinceDate, toDate);

            // print all project titles
            // projects.forEach(project => {
            //     console.log(project.project.title);
            // });
            // Generate the report
            const report = await generateInitiativeReport(projects);

            return report;
        } catch (error) {
            console.error('Error in generateInitiativeReport:', error);
            throw new functions.https.HttpsError('internal', error.message);
        }
    });

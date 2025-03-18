// const { getStorage } = require('firebase-admin/storage');
const functions = require("firebase-functions/v1");

const util = require("./util");

const { getIso2CountryName } = require('./gaul2iso');


// async function checkUploadedDocs(projectId) {
//     // check that there are documents in the default bucket under the documents "folder" (bucket don't really have folders)
//     const bucket = getStorage().bucket();
//     const folder = `${projectId}/documents`;
//     console.log('folder: ', folder);

//     const files = await bucket.getFiles({ prefix: folder });
//     console.log(projectId);
//     console.log(files);
//     return files[0].length > 0;
//     // return bucket.getFiles({ prefix: folder }).then(files => {
//     //     return files[0].length > 0;
//     // });
// }

function checkBrakedownByCI(project) {
    const ci1 = project.project.targetAreaCoreIndicator1;
    const ci2 = project.project.targetAreaCoreIndicator2;
    const ci3 = project.project.targetAreaCoreIndicator3;
    const ci4 = project.project.targetAreaCoreIndicator4;
    const ci5 = project.project.targetAreaCoreIndicator5;
    const ci2ldcf = project.project.targetAreaCoreIndicator2LDCF;

    return !!(ci1 ?? ci2 ?? ci3 ?? ci4 ?? ci5 ?? ci2ldcf);
}

function getCoreIndicatorValues(project) {
    return [
        project.project.targetAreaCoreIndicator1,
        project.project.targetAreaCoreIndicator2,
        project.project.targetAreaCoreIndicator3,
        project.project.targetAreaCoreIndicator4,
        project.project.targetAreaCoreIndicator5,
        project.project.targetAreaCoreIndicator2LDCF,
    ];
}

function checkAllPolygons(areas) {
    // TODO
    return 'good';
}

function getAreaValue(area) {
    return Object.values(area)[0];
}

_checkAllAreas = (areas, key) => {
    if (areas.length === 0) {
        return false;
    }

    const values = areas.map(area => getAreaValue(area)[key]);
    return values.every(v => v?.length > 0);
}

function getLastPhase(project) {
    if (project.project?.targetAreaEvaluationPhase) {
        return 'Evaluation';
    }
    if (project.project?.targetAreaReviewPhase) {
        return 'Review';
    }
    if (project.project?.targetAreaDesignPhase) {
        return 'Design';
    }
    return null;
}

function getLastTargetArea(project) {
    return project.project?.targetAreaDesignPhase || project.project?.targetAreaReviewPhase || project.project?.targetAreaEvaluationPhase;
}


function checkSpatial(areas) {
    if (areas.length === 0) {
        return 'bad';
    }

    const uploadTypes = areas.map(area => Object.keys(area)[0]);
    if (uploadTypes.includes('adminArea')) {
        return 'bad';
    }

    return checkAllPolygons(areas);
}

function checkEcosystems(areas) {
    return _checkAllAreas(areas, 'ecosystems');
}

function checkRestorationStatus(project) {
    const status = project.project.restorationStatus;
    return status ? menus.restorationStatuses.find(m => m.value === status).label : null;
}

const menus = {
    restorationStatuses: [
        { value: 1, label: "Design Phase" },
        { value: 2, label: "Implementation Phase" },
        { value: 3, label: "Monitoring Phase" }
    ],
    restorationTypes: [
        { value: 1, label: "Ecological restoration" },
        { value: 2, label: "Rehabilitation" }
    ],
    projectObjectives: [
        { value: 1, label: 'Enhance biodiversity' },
        { value: 2, label: 'Enhance ecosystem functions and services' },
        { value: 3, label: 'Improve ecological integrity' },
        { value: 4, label: 'Improve connectivity' },
    ]
};

function getMultipleMenuValues(menu, values) {
    if (!values?.length) return null;
    return values
        .map(value => {
            const menuItem = menu.find(m => m.value === value);
            return menuItem?.label;
        })
        .filter(Boolean).join(', ');
}

function checkRestorationType(project) {
    const restorationTypes = project.project.restorationTypes;
    return getMultipleMenuValues(menus.restorationTypes, restorationTypes);
}

function checkProjectObjectives(project) {
    const objectives = project.project.objectives;
    return getMultipleMenuValues(menus.projectObjectives, objectives);
}

function checkRestorationActivities(areas) {
    return _checkAllAreas(areas, 'activities');
}

function checkLeadEntity(project) {
    const organizations = project.project.organizations;
    return organizations?.length > 0
        && organizations.some(o => {
            const v = Object.values(o)[0];
            if (!v) return false;
            // check that the object is not empty
            return Object.keys(v).length > 0;
        });
}

function checkTenureStatus(project) {
    const tenureStatuses = project.project.tenureStatuses;
    return tenureStatuses?.length > 0
}

function checkGefCoreIndicators(areas) {
    return _checkAllAreas(areas, 'gefIndicators');
}

function checkProjectIndicatorsAndValues(areas) {
    if (areas.length === 0) {
        return false;
    }

    const indicatorsAndMonitoring = areas.map(area => {
        const areaValue = getAreaValue(area);
        const goalIndicators = areaValue.goalIndicators || [];
        const customIndicators = areaValue.customIndicators || [];
        return goalIndicators.concat(customIndicators);
    });

    if (indicatorsAndMonitoring.filter(Boolean).length === 0) {
        return false;
    }

    const allMonitoring = indicatorsAndMonitoring.map(areaIndicators =>
        areaIndicators.map(indicator => indicator.monitoring || [])
    );

    const atLeastOneAreaWithoutIndicators = allMonitoring.some(areaMonitoring => areaMonitoring.length === 0);

    if (atLeastOneAreaWithoutIndicators) {
        return false;
    }

    const atLeastOneAreaWithoutIndicatorMonitoring = allMonitoring.some(areaMonitoring =>
        areaMonitoring.some(indicatorMonitoring => indicatorMonitoring.length === 0)
    );

    if (atLeastOneAreaWithoutIndicatorMonitoring) {
        return false;
    }

    return true;
}

// function checkGoodPractices(project) {
//     return !!project.bestPracticesCount && project.bestPracticesCount > 0;
// }


function getPolygonsArea(areasObj) {
    try {
        const areas = areasObj.map(a => getAreaValue(a)).map(a => +a.area || 0);
        return areas.reduce((a, b) => a + b, 0);
    } catch (e) {
        console.error('Error calculating polygons area', e);
        return NaN;
    }
}

function performQualityControl(projectAndAreas) {
    const project = projectAndAreas.project;
    const areas = projectAndAreas.areas;

    const [CI1, CI2, CI3, CI4, CI5, CI2LDCF] = getCoreIndicatorValues(project);

    return {
        id: projectAndAreas.id,
        title: project.project.title || null,
        countries: project.project.countries ? project.project.countries.map((iso => getIso2CountryName(iso) || iso)).join(', ') : null,
        totalAreaAchieved: getPolygonsArea(areas),
        gefProjectSymbol: project.project?.gefFaoSymbol || null,
        gefInvestmentType: project.project?.gefInvestmentType || null,
        gefCycle: project.project?.gefCycle,
        lastPhase: getLastPhase(project),
        lastTargetArea: getLastTargetArea(project),
        brakeDownByCI: checkBrakedownByCI(project),
        CI1: CI1,
        CI2: CI2,
        CI3: CI3,
        CI4: CI4,
        CI5: CI5,
        CI2LDCF: CI2LDCF,
        spatial: checkSpatial(areas),
        ecosystems: checkEcosystems(areas),
        restorationStatus: checkRestorationStatus(project),
        restorationType: checkRestorationType(project),
        projectObjectives: checkProjectObjectives(project),
        restorationActivities: checkRestorationActivities(areas),
        leadEntity: checkLeadEntity(project),
        tenureStatus: checkTenureStatus(project),
        gefCoreIndicators: checkGefCoreIndicators(areas),
        projectIndicatorsAndValues: checkProjectIndicatorsAndValues(areas),
        nGoodPractices: project.bestPracticesCount || 0,
    };
}

async function getAllGefprojectsAndAreas() {
    // Retrieve all GEF projects
    const projects = await util.registryCollection.where('reportingLine', '==', 'GEF').get();

    // if the query returns no results, return an empty array
    if (projects.empty) {
        return [[], []];
    }

    const ret = [];

    // Retrieve all areas related to the GEF projects
    const getPromises = [];
    projects.forEach(project => {
        getPromises.push(util.areasCollection.doc(project.id).get());
    });
    const areas = await Promise.all(getPromises);

    projects.forEach(project => {
        const projectData = project.data();

        // if area doesn't exist for the project, add an empty object
        // TODO

        const areaData = areas.find(area => area.id === project.id).data();
        ret.push({
            id: project.id,
            project: projectData,
            areas: areaData?.areas || [],
        });
    });

    return ret;
}

exports.qcGef = functions.https.onCall(async (_, context) => {
    if (!context.auth?.token?.admin) {
        throw new functions.https.HttpsError('permission-denied', 'You must be an admin to invoke this function.');
    }

    const projectsAndAreas = await getAllGefprojectsAndAreas();

    const results = [];
    projectsAndAreas.forEach(project => {
        results.push(performQualityControl(project));
    });

    return results;
});

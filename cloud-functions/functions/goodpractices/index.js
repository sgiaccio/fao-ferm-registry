// Deploy:
// gcloud functions deploy publishGoodPractice --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --no-allow-unauthenticated
//
// Add the following roles to the service account
// gcloud run services add-iam-policy-binding publishgoodpractice \
//   --member="serviceAccount:fermgprev@fao-ferm.iam.gserviceaccount.com" \
//   --role="roles/run.invoker" \
//   --region=europe-west3 \
//   --project=fao-ferm \
//   --platform=managed
//
// gcloud functions deploy getPublishedGoodPractices --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --no-allow-unauthenticated --timeout=5m
//
// gcloud run services add-iam-policy-binding getpublishedgoodpractices \
//   --member="serviceAccount:fermgprev@fao-ferm.iam.gserviceaccount.com" \
//   --role="roles/run.invoker" \
//   --region=europe-west3 \
//   --project=fao-ferm \
//   --platform=managed
//
// gcloud functions deploy getSubmittedGoodPractices --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --no-allow-unauthenticated --timeout=5m
//
// gcloud run services add-iam-policy-binding getsubmittedgoodpractices \
//   --member="serviceAccount:fermgprev@fao-ferm.iam.gserviceaccount.com" \
//   --role="roles/run.invoker" \
//   --region=europe-west3 \
//   --project=fao-ferm \
//   --platform=managed
//
//
// TEST:
// gcloud functions deploy callPublishGoodPractice --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --service-account=fermgprev@fao-ferm.iam.gserviceaccount.com --allow-unauthenticated
// gcloud functions deploy callGetSubmittedGoodPractices --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --service-account=fermgprev@fao-ferm.iam.gserviceaccount.com --allow-unauthenticated
// gcloud functions deploy callGetPublishedGoodPractices --gen2 --runtime=nodejs18 --trigger-http --region=europe-west3 --service-account=fermgprev@fao-ferm.iam.gserviceaccount.com --allow-unauthenticated
// curl 'https://europe-west3-fao-ferm.cloudfunctions.net/callPublishGoodPractice'
// curl 'https://europe-west3-fao-ferm.cloudfunctions.net/callGetSubmittedGoodPractices'
// curl 'https://europe-west3-fao-ferm.cloudfunctions.net/callGetPublishedGoodPractices'
//
//
// URLS
// https://europe-west3-fao-ferm.cloudfunctions.net/publishGoodPractice
// https://europe-west3-fao-ferm.cloudfunctions.net/getSubmittedGoodPractices

// const { GoogleAuth } = require('google-auth-library');

const admin = require('firebase-admin');


admin.initializeApp(); // Initialize the Firebase admin SDK
const db = admin.firestore();

function _publishGoodPractice(goodPracticeRef) {
    return goodPracticeRef.update({
        status: 'published',
        publishedTime: admin.firestore.FieldValue.serverTimestamp()
    });
}

exports.publishGoodPractice = async (req, res) => {
    const projectId = req.query.projectId || req.body.projectId;
    const goodPracticeId = req.query.goodPracticeId || req.body.goodPracticeId;

    if (!projectId || !goodPracticeId) {
        res.status(400).send('Missing parameters');
        return;
    }

    const goodPracticeRef = db
        .collection('registry')
        .doc(projectId)
        .collection('bestPractices')
        .doc(goodPracticeId);

    try {
        const doc = await goodPracticeRef.get();

        if (!doc.exists) {
            res.status(404).send('Good practice not found');
            return;
        }

        const data = doc.data();
        if (data.status === 'published') {
            res.status(400).send('Good practice already published');
            return;
        }
        if (data.status !== 'submitted') {
            res.status(400).send('Good practice not submitted');
            return;
        }

        await _publishGoodPractice(goodPracticeRef);
        res.send('Good practice published');
    } catch (error) {
        console.error('Error handling good practice publication:', error);
        res.status(500).send('Internal server error: ' + error);
    }
};

async function getGoodPracticesByStatus(status) {
    const registryRef = db.collection('registry');
    const projectsSnapshot = await registryRef.get();
    const goodPractices = [];

    for (const projectDoc of projectsSnapshot.docs) {
        const bestPracticesRef = projectDoc.ref.collection('bestPractices');
        const submittedPracticesSnapshot = await bestPracticesRef.where('status', '==', status).get();

        submittedPracticesSnapshot.forEach(practiceDoc => {
            goodPractices.push({
                id: practiceDoc.id,
                projectId: projectDoc.id,
                data: practiceDoc.data()
            });
        });
    }

    return goodPractices;
}

exports.getSubmittedGoodPractices = async (_req, res) => {
    try {
        const goodPractices = await getGoodPracticesByStatus('submitted');
        res.send(goodPractices);
    } catch (error) {
        console.error('Error getting submitted good practices:', error);
        res.status(500).send('Internal server error: ' + error);
    }
};

exports.getPublishedGoodPractices = async (_req, res) => {
    try {
        const goodPractices = await getGoodPracticesByStatus('published');
        res.send(goodPractices);
    } catch (error) {
        console.error('Error getting published good practices:', error);
        res.status(500).send('Internal server error: ' + error);
    }
}

// exports.callPublishGoodPractice = async (req, res) => {
//     // Base URL without query parameters for the audience
//     const baseURL = 'https://europe-west3-fao-ferm.cloudfunctions.net/publishGoodPractice';

//     // The query parameter you want to add
//     const projectId = '0JKiKBPOE6SltEgujr2Z';
//     const goodPracticeId = 'SdRCXEgd5frW4mFDwSUu';

//     // The URL you actually want to call, including query parameters
//     const requestURL = `${baseURL}?projectId=${projectId}&goodPracticeId=${goodPracticeId}`;

//     const auth = new GoogleAuth();
//     const client = await auth.getIdTokenClient(baseURL);

//     try {
//         // Call the function with the query parameters added to the request URL (not the audience)
//         const response = await client.request({ url: requestURL });
//         res.send(response.data);
//     } catch (error) {
//         console.error('Error calling publishGoodPractice:', error);
//         res.status(500).send('Internal server error ' + error);
//     }
// };

// exports.callGetSubmittedGoodPractices = async (req, res) => {
//     const baseURL = 'https://europe-west3-fao-ferm.cloudfunctions.net/getSubmittedGoodPractices';

//     const auth = new GoogleAuth();
//     const client = await auth.getIdTokenClient(baseURL);

//     try {
//         const response = await client.request({ url: baseURL });
//         res.send(response.data);
//     } catch (error) {
//         console.error('Error calling getSubmittedGoodPractices:', error);
//         res.status(500).send('Internal server error');
//     }
// }

// exports.callGetPublishedGoodPractices = async (req, res) => {
//     const baseURL = 'https://europe-west3-fao-ferm.cloudfunctions.net/getPublishedGoodPractices';

//     const auth = new GoogleAuth();
//     const client = await auth.getIdTokenClient(baseURL);

//     try {
//         const response = await client.request({ url: baseURL });
//         res.send(response.data);
//     } catch (error) {
//         console.error('Error calling getPublishedGoodPractices:', error);
//         res.status(500).send('Internal server error');
//     }
// }

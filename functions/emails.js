const util = require("./util");

const functions = require("firebase-functions/v1");


const beginDate = new Date("2024-04-16");

exports.resendEmails = functions.pubsub
    .schedule("6 0 * * *") // run every day at 6:00 AM
    .onRun(async (_context) => {
        try {
            // get all the emails that were supposed to be sent after the given date but were not sent
            const snapshot = await util.db.collection("mail").where("delivery.startTime", ">", beginDate).where("delivery.state", "==", "ERROR").get();
            const emails = snapshot.docs;

            const batch = util.db.batch();
            emails.forEach(email => {
                const data = email.data();

                if (data.message.subject === 'Email check') {
                    return;
                }

                console.log(`resending email ${email.id}`);

                // update the email status to 'RETRY'
                batch.update(email.ref, { 'delivery.state': 'RETRY' });
            });

            await batch.commit();
        } catch (error) {
            console.error("An error occurred:", error);
        }
    });

const functions = require("firebase-functions");
const { defineString } = require("firebase-functions/params");

const { mailCollection, applicationStateCollection, firestore } = require('./util');


const emailCheck = defineString("EMAIL_CHECK");


exports.checkEmailSend = functions
    // schedule the function to run every day at 9am
    .region('europe-west3')
    .pubsub.schedule('0 9 * * *')
    .onRun(async (_context) => {
        try {
            const mailDoc = {
                // TODO: put the email in a config parameter.
                to: emailCheck.value(),
                message: {
                    subject: "Email check",
                    text: "Make sure that you get this email every day",
                },
            };
            const mail = await mailCollection.add(mailDoc);
            const mailId = mail.id;

            // now check if the email was sent - try every five seconds until status is either 'SUCCESS' or 'ERROR', for maximum 10 tiumes
            let i = 0;
            let state = "";
            while (i < 10 && state !== "SUCCESS" && state !== "ERROR") {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                const mailDoc = await mailCollection.doc(mailId).get();
                state = mailDoc.data().delivery?.state;
                i++;
            }

            let docRef = applicationStateCollection.doc("mail");

            if (state === "SUCCESS") {
                console.log('Email check successful');
                // set application mail status to SUCCESS on firestore
                await docRef.set({
                    state: "SUCCESS",
                    mailId,
                    timestamp: firestore.Timestamp.now()
                });
            } else {
                console.log('Email check failed - last state:', state);
                // set application mail status to ERROR on firestore
                await docRef.set({
                    state: "ERROR",
                    mailId,
                    timestamp: firestore.Timestamp.now(),
                    message: `Email check failed after ${i} attempts to check the email state. Last state: ${state}`,
                });
            }
        } catch (error) {
            console.error("Error checking email:", error);
            // set application mail state to ERROR on firestore
            docRef = applicationStateCollection.doc("mail");
            await docRef.set({
                state: "ERROR",
                timestamp: firestore.Timestamp.now(),
                message: error.message,
            });
        }
    });

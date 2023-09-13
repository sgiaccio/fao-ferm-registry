// Start the emulator with `firebase emulators:start --export-on-exit --import=./emulator_data_5 --only auth,firestore,hosting,pubsub,storage,extensions`
// Run this test with `npm run test:firestore`

const { readFileSync, createWriteStream } = require('fs');
const http = require("http");

const testing = require('@firebase/rules-unit-testing');
const { initializeTestEnvironment, assertFails, assertSucceeds } = testing;

const { doc, getDoc, setDoc, deleteDoc, setLogLevel, collection, getDocs } = require('firebase/firestore');


/** @type testing.RulesTestEnvironment */
let testEnv;

before(async () => {
  // Silence expected rules rejections from Firestore SDK. Unexpected rejections
  // will still bubble up and will be thrown as an error (failing the tests).
  setLogLevel('error');

  testEnv = await initializeTestEnvironment({
    projectId: "demo-ferm",
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: readFileSync('firestore.rules', 'utf8')
    },
  });
});

after(async () => {
  // Delete all the FirebaseApp instances created during testing.
  // Note: this does not affect or clear any data.
  await testEnv.cleanup();

  // Write the coverage report to a file
  const coverageFile = 'firestore-coverage.html';
  const fstream = createWriteStream(coverageFile);
  await new Promise((resolve, reject) => {
    const { host, port } = testEnv.emulators.firestore;
    const quotedHost = host.includes(':') ? `[${host}]` : host;
    http.get(`http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`, (res) => {
      res.pipe(fstream, { end: true });

      res.on("end", resolve);
      res.on("error", reject);
    });
  });

  console.log(`View firestore rule coverage information at ${coverageFile}\n`);
});

let unauthedDb;

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// If you want to define global variables for Rules Test Contexts to save some
// typing, make sure to initialize them for *every test* to avoid cache issues.
//
//     let unauthedDb;
//     beforeEach(() => {
//       unauthedDb = testEnv.unauthenticatedContext().database();
//     });
//
// Or you can just create them inline to make tests self-contained like below.


// async function deleteAllDocumentsInSubcollection(db, collectionPath) {
//   // Get a reference to the subcollection
//   const subcollectionRef = collection(db, collectionPath);

//   // Get all documents in the subcollection
//   const querySnapshot = await getDocs(subcollectionRef);

//   // Delete each document
//   const deletePromises = querySnapshot.docs.map(doc => {
//     return deleteDoc(doc.ref);
//   });

//   // Execute all delete operations
//   await Promise.all(deletePromises);
// }


describe('Goog practices', () => {

  let aliceGroupProjectId;

  beforeEach(async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      // Create a group
      // await setDoc(doc(context.firestore(), 'groups/aliceGroup',), { name: 'Alice Group' });

      // Create a project in the registry collection with a group
      const newAliceGroupProjectRef = doc(context.firestore(), 'registry/aliceGroupProject');
      await setDoc(newAliceGroupProjectRef, {
        group: 'aliceGroup'
      });

      // Capture the projectId for use in tests
      aliceGroupProjectId = newAliceGroupProjectRef.id;
    });
  });

  // afterEach(async () => {
  //   // Delete the project in the registry collection
  //   await testEnv.withSecurityRulesDisabled(async context => {
  //     const firestoreInstance = context.firestore();

  //     // Delete the project
  //     await deleteDoc(doc(firestoreInstance, `registry/${aliceGroupProjectId}`));
  // });


  // CREATE

  it('should not allow anyone to create a good practice', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(unauthedDb, `registry/${aliceGroupProjectId}/goodPractice/dummyGoodPractice`), {}));
  });

  it('should allow users to create a good practice if they are superadmin', async () => {
    const superadminDb = testEnv.authenticatedContext('superadmin', { admin: true }).firestore();

    await assertSucceeds(setDoc(doc(superadminDb, `registry/${aliceGroupProjectId}/bestPractices/dummyGoodPractice`), { created_by: 'superadmin' }));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), `registry/${aliceGroupProjectId}/bestPractices/dummyGoodPractice`));
    // });
  });

  it('should allow users to create a good practice if they are group admin or group editors', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, `registry/${aliceGroupProjectId}/bestPractices/goodPractice1`), { created_by: 'alice' }));
    await assertSucceeds(setDoc(doc(bobDb, `registry/${aliceGroupProjectId}/bestPractices/goodPractice2`), { created_by: 'bob' }));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   const firestore = context.firestore();
    //   await deleteDoc(doc(firestore, `registry/${aliceGroupProjectId}/bestPractices/goodPractice1`));
    //   await deleteDoc(doc(firestore, `registry/${aliceGroupProjectId}/bestPractices/goodPractice2`));
    // });
  });

  it('should not allow users to create a good practice if they are do not belong to the group or they are guests', async () => {
    let otherGroupProjectId;
    await testEnv.withSecurityRulesDisabled(async context => {
      const otherGroupProjectRef = doc(context.firestore(), 'registry/otherGroupProject');
      await setDoc(otherGroupProjectRef, {
        group: 'otherGroup'
      });

      otherGroupProjectId = otherGroupProjectRef.id;
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: {} }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: {} }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { otherGroup: 'guest' } }).firestore();

    await assertFails(setDoc(doc(aliceDb, `registry/${otherGroupProjectId}/bestPractices/goodPractice1`), { created_by: 'alice' }));
    await assertFails(setDoc(doc(bobDb, `registry/${otherGroupProjectId}/bestPractices/goodPractice2`), { created_by: 'bob' }));
    await assertFails(setDoc(doc(guestDb, `registry/${otherGroupProjectId}/bestPractices/goodPractice3`), { created_by: 'guest' }));
  });

  it('should not allow users to create a best practice where created_by != uid', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertFails(setDoc(doc(aliceDb, `registry/${aliceGroupProjectId}/bestPractices/goodPractice2`), { public: false, created_by: 'bob' }));
  });


  // READ

  it('should allow users to read a best practice if they are superadmin', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), `registry/${aliceGroupProjectId}/bestPractices/goodPractice`,), { public: false });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(aliceDb, `registry/${aliceGroupProjectId}/bestPractices/goodPractice`)));
  });

  it('should allow users to read a best practice if they are group admin or group editors or group guests', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, path), { public: false });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(getDoc(doc(aliceDb, path)));
    await assertSucceeds(getDoc(doc(bobDb, path)));
    await assertSucceeds(getDoc(doc(guestDb, path)));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  it('should not allow users to read a best practice if they are not in the group', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, path), { public: false });
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();

    await assertFails(getDoc(doc(bobDb, path)));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  // it('should allow everyone to read public best practices', async () => {
  //   // Setup: Create documents in DB for testing (bypassing Security Rules).
  //   const path = `registry/${aliceGroupProjectId}/bestPractices/publicBestPractice`;
  //   await testEnv.withSecurityRulesDisabled(async context => {
  //     await setDoc(doc(context.firestore(), path), { public: true });
  //   });

  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();

  //   await assertSucceeds(getDoc(doc(unauthedDb, path)));

  //   // Cleanup
  //   await testEnv.withSecurityRulesDisabled(async context => {
  //     await deleteDoc(doc(context.firestore(), path));
  //   });
  // });

  // it('should not allow anyone to read not public projects', async () => {
  //   // Setup: Create documents in DB for testing (bypassing Security Rules).
  //   await testEnv.withSecurityRulesDisabled(async context => {
  //     await setDoc(doc(context.firestore(), 'registry/public',), { public: false });
  //   });

  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();

  //   await assertFails(getDoc(doc(unauthedDb, 'registry/public')));
  // });


  // UPDATE

  it('should allow users to update a best practice if they are superadmin', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), path), { dummy: 'dummy' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, path), { dummy: 'gummy' }));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  it('should not allow user to update created_by', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), path), { created_by: 'alice' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertFails(setDoc(doc(aliceDb, path), { created_by: 'bob' }));

    // cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  it('should allow users to update a best practice in their group only if they are group admin or editors and creators of the best practice', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, path), { dummy: 'dummy', created_by: 'bob' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, path), { dummy: 'gummy' }, { merge: true }));
    await assertSucceeds(setDoc(doc(bobDb, path), { dummy: 'mummy' }, { merge: true }));
    await assertFails(setDoc(doc(guestDb, path), { dummy: 'tummy' }, { merge: true }));

    // cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  it('should not allow users to update a best practice if they are not in the group', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, path), { dummy: 'dummy', created_by: 'bob' });
    });

    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "any": "editor", } }).firestore();

    await assertFails(setDoc(doc(bobDb, path), { dummy: 'gummy' }, { merge: true }));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });


  // DELETE

  it('should allow users to delete a best practice if they are superadmin', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), path), {});
    });

    const superAdminDb = testEnv.authenticatedContext('superAdmin', { admin: true }).firestore();

    await assertSucceeds(deleteDoc(doc(superAdminDb, 'registry/project')));

    // Cleanup
    // await testEnv.withSecurityRulesDisabled(async context => {
    //   await deleteDoc(doc(context.firestore(), path));
    // });
  });

  it('should allow users to delete a best practice in their group only if they are group admin or editors and creators of the best practice', async () => {
    const path1 = `registry/project1/bestPractices/goodPractice`;
    const path2 = `registry/project2/bestPractices/goodPractice`;
    const path3 = `registry/project3/bestPractices/goodPractice`;
    const path4 = `registry/project4/bestPractices/goodPractice`;


    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'registry/project1'), { group: 'aliceGroup' });
      await setDoc(doc(firestore, 'registry/project2'), { group: 'aliceGroup' });
      await setDoc(doc(firestore, 'registry/project3'), { group: 'aliceGroup' });
      await setDoc(doc(firestore, 'registry/project4'), { group: 'aliceGroup' });

      await setDoc(doc(firestore, path1), { created_by: 'bob' });
      await setDoc(doc(firestore, path2), { created_by: 'bob' });
      await setDoc(doc(firestore, path3), { created_by: 'bob' });
      await setDoc(doc(firestore, path4), { created_by: 'bob' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();
    const charlieDb = testEnv.authenticatedContext('charlie', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(deleteDoc(doc(aliceDb, path1)));
    await assertSucceeds(deleteDoc(doc(bobDb, path2)));
    await assertFails(deleteDoc(doc(charlieDb, path3)));
    await assertFails(deleteDoc(doc(guestDb, path4)));
  });

  it('should not allow users to delete a best practice if they are not in the group', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice1`;
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), path), {});
    });

    const bobDb = testEnv.authenticatedContext('bob').firestore();

    await assertFails(deleteDoc(doc(bobDb, path)));
  });

  it('should not allow to delete a best practice if not draft status and user is editor', async () => {
    const path = `registry/${aliceGroupProjectId}/bestPractices/goodPractice`;
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), path), { status: 'public' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: false, privileges: { aliceGroup: 'editor' } }).firestore();

    await assertFails(deleteDoc(doc(aliceDb, path)));
  });
});


describe('Projects', () => {

  // CREATE

  it('should not allow anyone to create a project', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(setDoc(doc(unauthedDb, 'registry/project'), { public: false }));
  });

  it('should allow users to create a project if they are superadmin', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/aliceGroup',), { name: 'Alice Group' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'registry/project'), { group: 'aliceGroup', created_by: 'alice' }));
  });

  it('should allow users to create a project if they are group admin or group editors', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/aliceGroup',), { name: 'Alice Group' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'registry/project'), { group: 'aliceGroup', created_by: 'alice' }));
    await assertSucceeds(setDoc(doc(bobDb, 'registry/project2'), { group: 'aliceGroup', created_by: 'bob' }));
  });

  it('should not allow users to create a project if they are not group admin or group editors', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'groups/otherGroup'), { name: 'Other Group' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { group: 'otherGroup', created_by: 'alice' }));
    await assertFails(setDoc(doc(bobDb, 'registry/project2'), { group: 'otherGroup', created_by: 'bob' }));
    await assertFails(setDoc(doc(guestDb, 'registry/project3'), { group: 'otherGroup', created_by: 'guest' }));
  });

  it('should not allow guests to create a project in their group', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'groups/aliceGroup',), { name: 'Alice Group' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { group: 'aliceGroup', created_by: 'alice' }));
  });

  it('should not allow users to create a project where created_by != uid', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { public: false, created_by: 'bob' }));
  });

  it('should not allow users to create a project where group is not a valid group', async () => {
    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { public: false, group: 'invalidGroup', created_by: 'alice' }));
  });


  // READ

  it('should allow users to read a project if they are superadmin', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'registry/project',), { public: false });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(getDoc(doc(aliceDb, 'registry/project')));
  });

  it('should allow users to read a project if they are group admin or group editors or group guests', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'registry/project',), { public: false, group: 'aliceGroup' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(getDoc(doc(aliceDb, 'registry/project')));
    await assertSucceeds(getDoc(doc(bobDb, 'registry/project')));
    await assertSucceeds(getDoc(doc(guestDb, 'registry/project')));
  });

  it('should not allow users to read a project if they are not in the group', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'registry/project',), { public: false, group: 'aliceGroup' });
    });

    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    const bobDb = testEnv.authenticatedContext('bob').firestore();
    const guestDb = testEnv.authenticatedContext('guest').firestore();

    await assertFails(getDoc(doc(aliceDb, 'registry/project')));
    await assertFails(getDoc(doc(bobDb, 'registry/project')));
    await assertFails(getDoc(doc(guestDb, 'registry/project')));
  });

  // it('should allow anyone to read public projects', async () => {
  //   // Setup: Create documents in DB for testing (bypassing Security Rules).
  //   await testEnv.withSecurityRulesDisabled(async context => {
  //     await setDoc(doc(context.firestore(), 'registry/public',), { public: true });
  //   });

  //   const unauthedDb = testEnv.unauthenticatedContext().firestore();

  //   await assertSucceeds(getDoc(doc(unauthedDb, 'registry/public')));
  // });

  it('should not allow anyone to read not public projects', async () => {
    // Setup: Create documents in DB for testing (bypassing Security Rules).
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'registry/public',), { public: false });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    await assertFails(getDoc(doc(unauthedDb, 'registry/public')));
  });


  // UPDATE

  it('should allow users to update a project if they are superadmin', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'registry/project'), { dummy: 'dummy' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'registry/project'), { dummy: 'gummy' }));
  });

  it('should not allow user to update created_by', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'registry/project',), { created_by: 'alice' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { created_by: 'bob' }));
  });

  it('should allow users to update a project in their group only if they are group admin or editors and creators of the project', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'registry/project',), { dummy: 'dummy', group: 'aliceGroup', created_by: 'bob' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor", } }).firestore();
    const charlieDb = testEnv.authenticatedContext('charlie', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(setDoc(doc(aliceDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
    await assertSucceeds(setDoc(doc(bobDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
    await assertFails(setDoc(doc(charlieDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
    await assertFails(setDoc(doc(guestDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
  });

  it('should not allow users to update a project if they are not in the group', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'registry/project',), { dummy: 'dummy', group: 'otherGroup', created_by: 'bob' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor", } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertFails(setDoc(doc(aliceDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
    await assertFails(setDoc(doc(bobDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
    await assertFails(setDoc(doc(guestDb, 'registry/project'), { dummy: 'gummy' }, { merge: true }));
  });


  // DELETE

  it('should allow users to delete a project if they are superadmin', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), 'registry/project'), { dummy: 'dummy' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { admin: true }).firestore();

    await assertSucceeds(deleteDoc(doc(aliceDb, 'registry/project')));
  });

  it('should allow users to delete a project in their group only if they are group admin or editors and creators of the project', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });
      await setDoc(doc(firestore, 'registry/project1'), { dummy: 'dummy', group: 'aliceGroup', created_by: 'bob' });
      await setDoc(doc(firestore, 'registry/project2'), { dummy: 'dummy', group: 'aliceGroup', created_by: 'bob' });
      await setDoc(doc(firestore, 'registry/project3'), { dummy: 'dummy', group: 'aliceGroup', created_by: 'bob' });
      await setDoc(doc(firestore, 'registry/project4'), { dummy: 'dummy', group: 'aliceGroup', created_by: 'bob' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor", } }).firestore();
    const charlieDb = testEnv.authenticatedContext('charlie', { privileges: { "aliceGroup": "editor" } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertSucceeds(deleteDoc(doc(aliceDb, 'registry/project1')));
    await assertSucceeds(deleteDoc(doc(bobDb, 'registry/project2')));
    await assertFails(deleteDoc(doc(charlieDb, 'registry/project3')));
    await assertFails(deleteDoc(doc(guestDb, 'registry/project4')));
  });

  it('should not allow users to delete a project if they are not in the group', async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'groups/aliceGroup'), { name: 'Alice Group' });

      await setDoc(doc(firestore, 'registry/project1'), { dummy: 'dummy', group: 'otherGroup', created_by: 'alice' });
      await setDoc(doc(firestore, 'registry/project2'), { dummy: 'dummy', group: 'otherGroup', created_by: 'bob' });
      await setDoc(doc(firestore, 'registry/project3'), { dummy: 'dummy', group: 'otherGroup', created_by: 'guest' });
    });

    const aliceDb = testEnv.authenticatedContext('alice', { privileges: { "aliceGroup": "admin" } }).firestore();
    const bobDb = testEnv.authenticatedContext('bob', { privileges: { "aliceGroup": "editor", } }).firestore();
    const guestDb = testEnv.authenticatedContext('guest', { privileges: { "aliceGroup": "guest" } }).firestore();

    await assertFails(deleteDoc(doc(aliceDb, 'registry/project1')));
    await assertFails(deleteDoc(doc(bobDb, 'registry/project2')));
    await assertFails(deleteDoc(doc(guestDb, 'registry/project3')));
  });

});


// describe("Public user profiles", () => {
//   it('should let anyone read any profile', async function () {
//     // Setup: Create documents in DB for testing (bypassing Security Rules).
//     await testEnv.withSecurityRulesDisabled(async (context) => {
//       await setDoc(doc(context.firestore(), 'users/foobar'), { foo: 'bar' });
//     });

//     const unauthedDb = testEnv.unauthenticatedContext().firestore();

//     // Then test security rules by trying to read it using the client SDK.
//     await assertSucceeds(getDoc(doc(unauthedDb, 'users/foobar')));
//   });

//   it('should not allow users to read from a random collection', async () => {
//     unauthedDb = testEnv.unauthenticatedContext().firestore();

//     await assertFails(getDoc(doc(unauthedDb, 'foo/bar')));
//   });

//   it("should allow ONLY signed in users to create their own profile with required `createdAt` field", async () => {
//     const aliceDb = testEnv.authenticatedContext('alice').firestore();

//     await assertSucceeds(setDoc(doc(aliceDb, 'users/alice'), {
//       birthday: "January 1",
//       createdAt: serverTimestamp(),
//     }));

//     // Signed in user with required fields for others' profile
//     await assertFails(setDoc(doc(aliceDb, 'users/bob'), {
//       birthday: "January 1",
//       createdAt: serverTimestamp(),
//     }));

//     // Signed in user without required fields
//     await assertFails(setDoc(doc(aliceDb, 'users/alice'), {
//       birthday: "January 1",
//     }));

//   });
// });

// describe("Chat rooms", () => {
//   it('should ONLY allow users to create a room they own', async function () {
//     const aliceDb = testEnv.authenticatedContext('alice').firestore();

//     await assertSucceeds(setDoc(doc(aliceDb, 'rooms/snow'), {
//       owner: "alice",
//       topic: "All Things Snowboarding",
//     }));

//   });

//   it('should not allow room creation by a non-owner', async function () {
//     const aliceDb = testEnv.authenticatedContext('alice').firestore();

//     await assertFails(setDoc(doc(aliceDb, 'rooms/boards'), {
//       owner: "bob",
//       topic: "All Things Snowboarding",
//     }));
//   });

//   it('should not allow an update that changes the room owner', async function () {
//     const aliceDb = testEnv.authenticatedContext('alice').firestore();

//     await assertFails(setDoc(doc(aliceDb, 'rooms/snow'), {
//       owner: "bob",
//       topic: "All Things Snowboarding",
//     }));
//   });
// });

import { dbWrapper } from '../db.ts';
import couchDbBackup from './import/couchDbBackup.js';
import importPrereviewOrg from './import/prereviewOrg.js';
import importOSrPRE from './import/OSrPRE.js';

async function main() {
  const [db] = await dbWrapper();
  try {
    await importPrereviewOrg(db);
    console.log('Finished importing PREreview.org');
  } catch (err) {
    console.error('Error importing PREreview.org:', err);
  }

  try {
    await couchDbBackup(db);
    console.log('Finished backing-up OSrPRE couchdb');
  } catch (err) {
    console.error('Error backing-up OSrPRE couchdb:', err);
  }

  try {
    await importOSrPRE(db);
    console.log('Finished importing OSrPRE');
  } catch (err) {
    console.error('Error importing OSrPRE:', err);
  }

  await db.close();
}

main();

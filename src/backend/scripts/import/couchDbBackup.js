import couchbackup from '@cloudant/couchbackup';
import fs from 'fs';

export default async function run() {
  const tasks = [];
  tasks.push(
    new Promise((resolve, reject) => {
      couchbackup.backup(
        `https://${process.env.COUCH_USERNAME}:${process.env.COUCH_PASSWORD}@${
          process.env.COUCH_HOST
        }:${process.env.COUCH_PORT}/rapid-prereview-docs`,
        fs.createWriteStream(
          `${process.env.COUCH_OUTDIR}/rapid-prereview-docs.jsonl`,
        ),
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            console.error('Failed! ', err);
            reject(err);
          } else {
            console.error('Success! ', data);
            resolve(data);
          }
        },
      );
    }),
  );

  tasks.push(
    new Promise((resolve, reject) => {
      couchbackup.backup(
        `https://${process.env.COUCH_USERNAME}:${process.env.COUCH_PASSWORD}@${
          process.env.COUCH_HOST
        }:${process.env.COUCH_PORT}/rapid-prereview-users`,
        fs.createWriteStream(
          `${process.env.COUCH_OUTDIR}/rapid-prereview-users.jsonl`,
        ),
        { parallelism: 2 },
        (err, data) => {
          if (err) {
            console.error('Failed! ', err);
            reject(err);
          } else {
            console.error('Success! ', data);
            resolve(data);
          }
        },
      );
    }),
  );

  return Promise.all(tasks);
}

/* eslint-disable no-console */
import yargs from 'yargs';
import { Client } from '@cesarbr/knot-cloud-sdk-js';
import isBase64 from 'is-base64';
import chalk from 'chalk';
import options from './utils/options';
import getFileCredentials from './utils/getFileCredentials';

const publishData = async (args) => {
  const data = [{ sensorId: args.sensorId, value: args.value }];
  const client = new Client({
    hostname: args.server,
    port: args.port,
    protocol: args.protocol,
    username: args.username,
    password: args.password,
    token: args.token,
  });
  await client.connect();
  await client.publishData(args.thingId, data);
  await client.close();
};

yargs
  .config('credentials-file', path => getFileCredentials(path))
  .command({
    command: 'publish-data <thing-id> <sensor-id> <value>',
    desc: 'Publish <sensor-id> <value> as <thing-id>',
    builder: (_yargs) => {
      _yargs
        .options(options)
        .positional('sensor-id', {
          describe: 'ID of the sensor that is publishing the data',
        })
        .positional('value', {
          describe: 'Value to be published. Supported types: boolean, number or Base64 strings.',
          coerce: (value) => {
            if (isNaN(value)) { // eslint-disable-line no-restricted-globals
              if (value === 'true' || value === 'false') {
                return (value === 'true');
              }
              if (!isBase64(value)) {
                throw new Error('Supported types are boolean, number or Base64 strings');
              }
              return value;
            }

            return parseFloat(value);
          },
        });
    },
    handler: async (args) => {
      try {
        await publishData(args);
        console.log(chalk.green('data published successfully'));
      } catch (err) {
        console.log(chalk.red('it was not possible to publish the data :('));
        console.log(chalk.red(err));
      }
    },
  });

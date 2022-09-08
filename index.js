#!/usr/bin/env node

const exportScript = require('./script-export-strapi-role-permissions');
// const updateScript = require('./script-update-strapi-role-permissions');

const yargs = require('yargs');

async function main() {

  /**
   * Get cli options
   * 
   * @property {object} options
   * @property {string} s - The url of the strapi server
   * @property {string} [v] - The version number of Strapi
   * @property {string} [k] - Strapi v4 api key
   * @property {string} [u] - Strapi v3 user email
   * @property {string} [p] - Strapi v3 user password
   */
  const options = await yargs
    .usage('Usage: -key <api-key> -s <server-url>')
    .usage('Usage: -v 3 -user <user> -pass <pass> -s <server-url>')
    .option('s', { alias: 'strapi-server', describe: 'Strapi server url', type: 'string', demandOption: true })
    .option('v', { alias: 'strapi-version', describe: 'Strapi version', type: 'number', demandOption: false })
    .option('k', { alias: 'api-key', describe: 'v4: Strapi API Key. Use user/pass for v3', type: 'string', demandOption: false })
    .option('u', { alias: 'user', describe: 'v3 Strapi Username', type: 'string', demandOption: false })
    .option('p', { alias: 'pass', describe: 'v3 Strapi Password', type: 'string', demandOption: false })
    .argv;
  if (!options.v) options.v = 4;
  // if (!options.k) options.k = '';
  // if (!options.u) options.u = '';
  // if (!options.p) options.p = '';

  console.dir(options, { depth: null, colors: true });

  const greeting = `Strapi version: ${options.v}`;
  console.log(greeting);

  // Check server url
  if (!options.s.includes('http://') && !options.s.includes('https://')) {
    console.log('Strapi url must contain http:// or https://');
    return;
  } else if (options.s[-1] === '/') {
    console.log('Strapi url must not end with /');
    return;
  }

  if (options.v === 4) {
    exportScript(options.s, options.v, options.k);
  } else if (options.v === 3) {
    exportScript(options.s, options.v, options.k, options.u, options.p);
  }
}

main();

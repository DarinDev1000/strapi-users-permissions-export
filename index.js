#!/usr/bin/env node

const exportScript = require('./script-export-strapi-role-permissions');
const importScript = require('./script-import-strapi-role-permissions');

const yargs = require('yargs');

async function main() {

  const FOLDER_PATH = './strapi-users-permissions-export';

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
    .usage('Strapi should be running alongside this cli tool.')
    .usage('')
    .usage('The api-key/user should have these permissions under userspermissions:')
    .usage('- createrole getrole getroles updaterole')
    .usage('')
    .usage('Strapi Version 4 (default)')
    .usage('- Usage: -s <server-url> -key <api-key> export')
    .usage('- Example: -s http://localhost:1337 -key apikey export')
    .usage('- Example: -s http://localhost:1337 -key apikey import')
    .usage('')
    .usage('Strapi Version 3')
    .usage('- Usage: -s <server-url> -v 3 -user <user-email> -pass <password> export')
    .usage('- Example: -s http://localhost:1337 -v 3 -u export@example.com -p "password" export')
    .usage('- Example: -s http://localhost:1337 -v 3 -u export@example.com -p "password" import')
    .usage('')
    .option('s', { alias: 'strapi-server', describe: 'Strapi server url', type: 'string', demandOption: true })
    .option('v', { alias: 'strapi-version', describe: 'Strapi version', type: 'number', demandOption: false })
    .option('k', { alias: 'api-key', describe: 'v4: Strapi API Key. Use user/pass for v3', type: 'string', demandOption: false })
    .option('u', { alias: 'user', describe: 'v3 Strapi Username', type: 'string', demandOption: false })
    .option('p', { alias: 'pass', describe: 'v3 Strapi Password', type: 'string', demandOption: false })
    .option('o', { alias: 'output-folder', describe: 'Custom export path', type: 'string', demandOption: false })
    .command('export', 'Export Role Permissions from strapi database to json')
    .command('import', 'Import Role Permissions back into strapi database from json')
    .argv;
  if (!options.v) options.v = 4;
  // if (!options.k) options.k = '';
  // if (!options.u) options.u = '';
  // if (!options.p) options.p = '';

  // console.dir(options, { depth: null, colors: true });

  // const greeting = `Strapi version: ${options.v}`;
  // console.log(greeting);

  // Check server url
  if (!options.s.includes('http://') && !options.s.includes('https://')) {
    console.log('Strapi url must contain http:// or https://');
    return;
  } else if (options.s[-1] === '/') {
    console.log('Strapi url must not end with /');
    return;
  }

  let folderPath = FOLDER_PATH;
  if (options.o) {
    folderPath = options.o;
  }

  if (options._[0] === 'export') {
    console.log('Exporting Permissions...');
    exportScript(options.s, options.v, folderPath, options.k, options.u, options.p);
    // if (options.v === 4) {
    //   exportScript(options.s, options.v, folderPath, options.k);
    // } else if (options.v === 3) {
    //   exportScript(options.s, options.v, folderPath, options.k, options.u, options.p);
    // }
  } else if (options._[0] === 'import') {
    console.log('Importing Permissions...');
    importScript(options.s, options.v, folderPath, options.k, options.u, options.p);
  } else {
    console.log('Please specify a command: export or import');
  }
}

// Can I use this as a cli and an export?

if (require.main === module) {
  main();
}

// module.exports = {
//   exportScript: exportScript,
//   importScript: importScript,
// }

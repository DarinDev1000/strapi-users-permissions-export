#!/usr/bin/env node

// const exportScript = require('./script-export-strapi-role-permissions');
// const updateScript = require('./script-update-strapi-role-permissions');

const yargs = require("yargs");

const options = yargs
  .usage("Usage: -key <api-key>")
  .usage("Usage: -v 3 -user <user> -pass <pass>")
  .option("url", { alias: "strapi-url", describe: "Strapi server url", type: "string", demandOption: true })
  .option("k", { alias: "api-key", describe: "v4: Strapi API Key. Use user/pass for v3", type: "string", demandOption: false })
  .option("v", { alias: "strapi-version", describe: "Strapi version", type: "number", demandOption: false })
  .option("u", { alias: "user", describe: "v3 Strapi Username", type: "string", demandOption: false })
  .option("p", { alias: "pass", describe: "v3 Strapi Password", type: "string", demandOption: false })
  .argv

const greeting = `Hello, ${options.strapi_version}!`;

console.log(greeting);

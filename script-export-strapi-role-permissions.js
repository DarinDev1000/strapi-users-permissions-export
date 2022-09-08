#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios').default;
// require('dotenv').config();

// Permissions can either be edited in the export files or in the strapi web admin and saved with this script

async function authLoginV3(serverUrl, strapiUserEmail, strapiUserPassword) {
  // console.log(process.env.STRAPI_SUPER_USER_EMAIL);
  // console.log(process.env.STRAPI_SUPER_USER_PASSWORD);
  if (!strapiUserEmail || !strapiUserPassword) {
    throw new Error('Missing --user or --pass for Strapi v3\n');
  }
  const res = await axios.post(`${serverUrl}/auth/local`, {
    identifier: strapiUserEmail,
    password: strapiUserPassword
  });
  // console.log(res.data)
  const jwt = res.data.jwt;
  return jwt;
}

async function getRoles(serverUrl, jwt) {
  const res = await axios.get(`${serverUrl}/users-permissions/roles`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data.roles;
}

async function getRolePermissions(serverUrl, jwt, roleId) {
  const res = await axios.get(`${serverUrl}/users-permissions/roles/${roleId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data;
}

async function readJsonFile(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(file);
}

function recursiveUpdate(originalObject, newObject) {
  for (const key in newObject) {
    // If the both objects have the key, update it, else create it
    if (newObject[key] instanceof Object && originalObject[key] instanceof Object) {
      originalObject[key] = recursiveUpdate(originalObject[key], newObject[key]);
    } else {
      originalObject[key] = newObject[key];
    }
  }
  return originalObject;
}


async function main(serverUrl, strapiVersion, strapiApiKey='', strapiUserEmail='', strapiUserPassword='') {
  console.log('serverUrl ', serverUrl)
  console.log('strapiVersion ', strapiVersion)
  console.log('strapiApiKey ', strapiApiKey)
  console.log('strapiUserEmail ', strapiUserEmail)
  console.log('strapiUserPassword ', strapiUserPassword)

  // Default jwt to api key for strapi v4
  let jwt = strapiApiKey
  // ---- Login if strapi v3----
  if (strapiVersion === 3) {
    jwt = await authLoginV3(serverUrl, strapiUserEmail, strapiUserPassword);
  }

  if (!jwt) {
    console.error('ERROR: Auth failed');
    return;
  }

  // ---- Get all roles ----
  let roles = await getRoles(serverUrl, jwt);
  console.log(roles);
  const publicRole = roles.find(role => role.type === 'public'); // Default role
  const authenticatedRole = roles.find(role => role.type === 'authenticated'); // Default role
  let customerSupportRole = roles.find(role => role.type === 'customer_support');
  let analystRole = roles.find(role => role.type === 'analyst');
  let superRole = roles.find(role => role.type === 'super');

  // ---- Get permissions for each role ----
  const publicRolePermissions = await getRolePermissions(serverUrl, jwt, publicRole.id);
  console.log('Fetched public role permissions');
  const authenticatedRolePermissions = await getRolePermissions(serverUrl, jwt, authenticatedRole.id);
  console.log('Fetched authenticated role permissions');
  const customerSupportRolePermissions = await getRolePermissions(serverUrl, jwt, customerSupportRole.id);
  console.log('Fetched customer support role permissions');
  const analystRolePermissions = await getRolePermissions(serverUrl, jwt, analystRole.id);
  console.log('Fetched analyst role permissions');
  const superRolePermissions = await getRolePermissions(serverUrl, jwt, superRole.id);
  console.log('Fetched super role permissions');

  // ---- Read stored permission files ----
  const filePublicRolePermissions = await readJsonFile('./publicRolePermissions.json');
  const fileAuthenticatedRolePermissions = await readJsonFile('./authenticatedRolePermissions.json');
  const fileCustomerSupportRolePermissions = await readJsonFile('./customerSupportRolePermissions.json');
  const fileAnalystRolePermissions = await readJsonFile('./analystRolePermissions.json');
  const fileSuperRolePermissions = await readJsonFile('./superRolePermissions.json');
  // ---- Reorder to match current files ----
  const reorderedPublicRolePermissions = recursiveUpdate(filePublicRolePermissions, {...publicRolePermissions.role, id: undefined});
  const reorderedAuthenticatedRolePermissions = recursiveUpdate(fileAuthenticatedRolePermissions, {...authenticatedRolePermissions.role, id: undefined});
  const reorderedCustomerSupportRolePermissions = recursiveUpdate(fileCustomerSupportRolePermissions, {...customerSupportRolePermissions.role, id: undefined});
  const reorderedAnalystRolePermissions = recursiveUpdate(fileAnalystRolePermissions, {...analystRolePermissions.role, id: undefined});
  const reorderedSuperRolePermissions = recursiveUpdate(fileSuperRolePermissions, {...superRolePermissions.role, id: undefined});


  fs.writeFile('./publicRolePermissions.json', JSON.stringify(reorderedPublicRolePermissions, null, 4), err => {
    if (err) {
      console.error(err);
    }
    console.log('Saved publicRolePermissions.json');
  });
  fs.writeFile('./authenticatedRolePermissions.json', JSON.stringify(reorderedAuthenticatedRolePermissions, null, 4), err => {
    if (err) {
      console.error(err);
    }
    console.log('Saved authenticatedRolePermissions.json');
  });
  fs.writeFile('./customerSupportRolePermissions.json', JSON.stringify(reorderedCustomerSupportRolePermissions, null, 4), err => {
    if (err) {
      console.error(err);
    }
    console.log('Saved customerSupportRolePermissions.json');
  });
  fs.writeFile('./analystRolePermissions.json', JSON.stringify(reorderedAnalystRolePermissions, null, 4), err => {
    if (err) {
      console.error(err);
    }
    console.log('Saved analystRolePermissions.json');
  });
  fs.writeFile('./superRolePermissions.json', JSON.stringify(reorderedSuperRolePermissions, null, 4), err => {
    if (err) {
      console.error(err);
    }
    console.log('Saved superRolePermissions.json');
  });
}
// main();

module.exports = main;

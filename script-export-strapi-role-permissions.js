#!/usr/bin/env node

const fs = require('fs');
// require('dotenv').config();

// Permissions can either be edited in the export files or in the strapi web admin and saved with this script

async function authLogin() {
  // console.log(process.env.STRAPI_SUPER_USER_EMAIL);
  // console.log(process.env.STRAPI_SUPER_USER_PASSWORD);
  if (!process.env.STRAPI_SUPER_USER_EMAIL || !process.env.STRAPI_SUPER_USER_PASSWORD) {
    throw new Error('Missing STRAPI_SUPER_USER_EMAIL or STRAPI_SUPER_USER_PASSWORD in env file\n');
  }
  const res = await fetch('http://localhost:1337/auth/local', {
    method: 'POST',
    body: JSON.stringify({
      identifier: process.env.STRAPI_SUPER_USER_EMAIL,
      password: process.env.STRAPI_SUPER_USER_PASSWORD
    }),
  });
  const json = await res.json();
  const jwt = json.jwt;
  return jwt;
}

async function getRoles(jwt) {
  const res = await fetch('http://localhost:1337/users-permissions/roles', {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  const json = await res.json();
  return json.data.roles;
}

async function getRolePermissions(jwt, roleId) {
  const res = await fetch(`http://localhost:1337/users-permissions/roles/${roleId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  const json = await res.json();
  return json.data;
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


async function main() {
  // ---- Login ----
  const jwt = await authLogin();


  // ---- Get all roles ----
  let roles = await getRoles(jwt);
  // console.log(roles);
  const publicRole = roles.find(role => role.type === 'public'); // Default role
  const authenticatedRole = roles.find(role => role.type === 'authenticated'); // Default role
  let customerSupportRole = roles.find(role => role.type === 'customer_support');
  let analystRole = roles.find(role => role.type === 'analyst');
  let superRole = roles.find(role => role.type === 'super');

  // ---- Get permissions for each role ----
  const publicRolePermissions = await getRolePermissions(jwt, publicRole.id);
  console.log('Fetched public role permissions');
  const authenticatedRolePermissions = await getRolePermissions(jwt, authenticatedRole.id);
  console.log('Fetched authenticated role permissions');
  const customerSupportRolePermissions = await getRolePermissions(jwt, customerSupportRole.id);
  console.log('Fetched customer support role permissions');
  const analystRolePermissions = await getRolePermissions(jwt, analystRole.id);
  console.log('Fetched analyst role permissions');
  const superRolePermissions = await getRolePermissions(jwt, superRole.id);
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
main();

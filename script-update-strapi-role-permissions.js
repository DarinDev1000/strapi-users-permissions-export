// For running a local copy of docker postgres db
// docker run --name main-postgres -e POSTGRES_USER=epro-dev -e POSTGRES_PASSWORD=123 -e POSTGRES_DB=epro-dev -p 5455:5432 -d postgres

/* If this is a new database
  Register user with frontend
  Save new RT user details to .env file
  Manually give authenticated role permissions to USERS-PERMISSIONS select all USERSPERMISSIONS and save
  Run update script
  change your user role to super
*/

// Permissions can either be edited in the files or in the web and saved with the script-save-current-strapi-role-permissions.js script

const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

async function authLogin() {
  // console.log(process.env.STRAPI_SUPER_USER_EMAIL);
  // console.log(process.env.STRAPI_SUPER_USER_PASSWORD);
  const res = await axios.post('http://localhost:1337/auth/local', {
    identifier: process.env.STRAPI_SUPER_USER_EMAIL,
    password: process.env.STRAPI_SUPER_USER_PASSWORD
  });
  const jwt = res.data.jwt;
  return jwt;
}

async function getRoles(jwt) {
  const res = await axios.get('http://localhost:1337/users-permissions/roles', {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data.roles;
}

async function createRole(jwt, name, description, type) {
  const res = await axios.post('http://localhost:1337/users-permissions/roles', {
    name: name,
    description: description,
    type: type
  }, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data.roles;
}

async function createRoleWithPermissions(jwt, roleData) {
  const res = await axios.post('http://localhost:1337/users-permissions/roles', roleData, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data.roles;
}

async function getRolePermissions(jwt, roleId) {
  const res = await axios.get(`http://localhost:1337/users-permissions/roles/${roleId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data;
}

async function updateRolePermissions(jwt, roleId, rolePermissions) {
  const res = await axios.put(`http://localhost:1337/users-permissions/roles/${roleId}`, rolePermissions, {
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


async function main() {
  // ---- Login ----
  const jwt = await authLogin();


  // ---- Get all roles ----
  let roles = await getRoles(jwt);

  const publicRole = roles.find(role => role.type === 'public'); // Default role
  const authenticatedRole = roles.find(role => role.type === 'authenticated'); // Default role
  let customerSupportRole = roles.find(role => role.type === 'customer_support');
  let analystRole = roles.find(role => role.type === 'analyst');
  let superRole = roles.find(role => role.type === 'super');


    // ---- Read stored permission files ----
    const setPublicRolePermissions = await readJsonFile('./publicRolePermissions.json');
    const setAuthenticatedRolePermissions = await readJsonFile('./authenticatedRolePermissions.json');
    const setCustomerSupportRolePermissions = await readJsonFile('./customerSupportRolePermissions.json');
    const setAnalystRolePermissions = await readJsonFile('./analystRolePermissions.json');
    const setSuperRolePermissions = await readJsonFile('./superRolePermissions.json');


  // ---- Create roles if missing ----
  if (!customerSupportRole) {
    console.log('Creating customer-support role');
    // await createRole(jwt, 'Customer Support', 'Customer Support Agent', 'customer_support'); // This messes up the permissions object
    await createRoleWithPermissions(jwt, setCustomerSupportRolePermissions);
    roles = await getRoles(jwt);
    customerSupportRole = roles.find(role => role.type === 'customer_support');
  }
  if (!analystRole) {
    console.log('Creating analyst role');
    // await createRole(jwt, 'Analyst', 'Analyst', 'analyst'); // This messes up the permissions object
    await createRoleWithPermissions(jwt, setAnalystRolePermissions);
    roles = await getRoles(jwt);
    analystRole = roles.find(role => role.type === 'analyst');
  }
  if (!superRole) {
    console.log('Creating super role');
    // await createRole(jwt, 'Super', 'Super User', 'super'); // This messes up the permissions object
    await createRoleWithPermissions(jwt, setSuperRolePermissions);
    roles = await getRoles(jwt);
    superRole = roles.find(role => role.type === 'super');
  }


  // ---- Update permissions for each role ----
  // Update public permissions
  const publicPermissionsResponse = await updateRolePermissions(jwt, publicRole.id, setPublicRolePermissions);
  console.log('publicPermissionsResponse ', publicPermissionsResponse)
  // Update customerSupport permissions
  const customerSupportPermissionsResponse = await updateRolePermissions(jwt, customerSupportRole.id, setCustomerSupportRolePermissions);
  console.log('customerSupportPermissionsResponse', customerSupportPermissionsResponse)
  // Update analyst permissions
  const analystPermissionsResponse = await updateRolePermissions(jwt, analystRole.id, setAnalystRolePermissions);
  console.log('analystPermissionsResponse', analystPermissionsResponse)
  // Update super permissions
  const superPermissionsResponse = await updateRolePermissions(jwt, superRole.id, setSuperRolePermissions);
  console.log('superPermissionsResponse', superPermissionsResponse)
  // Update authenticated permissions (this last because it's the roles we're using for a new database)
  const authenticatedPermissionsResponse = await updateRolePermissions(jwt, authenticatedRole.id, setAuthenticatedRolePermissions);
  console.log('authenticatedPermissionsResponse', authenticatedPermissionsResponse)

  // If this is a new database, change your role to super after the update
}
main();

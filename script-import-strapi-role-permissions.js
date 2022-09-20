// For running a local copy of docker postgres db
// docker run --name main-postgres -e POSTGRES_USER=epro-dev -e POSTGRES_PASSWORD=123 -e POSTGRES_DB=epro-dev -p 5455:5432 -d postgres

/* If this is a new database
  Register user with frontend
  Save new user-permissions user details to .env file
  Manually give authenticated role permissions to USERS-PERMISSIONS select all USERSPERMISSIONS and save
  Run update script
  change your user role to super
*/

// Permissions can either be edited in the files or in the web and saved with the script-save-current-strapi-role-permissions.js script

const fs = require('fs');
const axios = require('axios').default;
// require('dotenv').config();

async function authLoginV3(serverUrl, strapiUserEmail, strapiUserPassword) {
  // console.log(process.env.STRAPI_SUPER_USER_EMAIL);
  // console.log(process.env.STRAPI_SUPER_USER_PASSWORD);
  const res = await axios.post(`${serverUrl}/auth/local`, {
    identifier: strapiUserEmail,
    password: strapiUserPassword
  });
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

async function createRole(serverUrl, jwt, name, description, type) {
  const res = await axios.post(`${serverUrl}/users-permissions/roles`, {
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

async function createRoleWithPermissions(serverUrl, jwt, roleData) {
  const res = await axios.post(`${serverUrl}/users-permissions/roles`, roleData, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data;
}

async function getRolePermissions(serverUrl, jwt, roleId) {
  const res = await axios.get(`${serverUrl}/users-permissions/roles/${roleId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`
    }
  });
  return res.data;
}

async function updateRolePermissions(serverUrl, jwt, roleId, rolePermissions) {
  const res = await axios.put(`${serverUrl}/users-permissions/roles/${roleId}`, rolePermissions, {
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

async function findExportedFileNames(folderPath) {
  const filesInFolderPath = fs.readdirSync(folderPath);
  filesInFolderPath.filter(value => value.endsWith('_role_permissions.json'));
  return filesInFolderPath;
}


async function importScript(serverUrl, strapiVersion, folderPath, strapiApiKey='', strapiUserEmail='', strapiUserPassword='') {
  // console.log('serverUrl ', serverUrl)
  // console.log('strapiVersion ', strapiVersion)
  // console.log('strapiApiKey ', strapiApiKey)
  // console.log('strapiUserEmail ', strapiUserEmail)
  // console.log('strapiUserPassword ', strapiUserPassword)

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
  let databaseRoles = await getRoles(serverUrl, jwt);
  // console.log(databaseRoles);

  // ---- Find stored permission json files ----
  const exportedFileNames = await findExportedFileNames(folderPath)

  const exportedPermissions = await Promise.all(
    exportedFileNames.map(
      async (fileName) => {
        return await readJsonFile(`${folderPath}/${fileName}`);
      }
    )
  );

  // ---- Create/Update role permissions ----
  await Promise.all(
    exportedPermissions.map(
      async (exportedRolePermission) => {
        const roleExist = databaseRoles.find(role => role.type === exportedRolePermission.type);
        if (!roleExist) {
          console.log(`Creating ${exportedRolePermission.type} role`);
          const createRoleWithPermissionsResponse = await createRoleWithPermissions(serverUrl, jwt, exportedRolePermission);
          // databaseRoles = await getRoles(serverUrl, jwt);
          console.log(`${exportedRolePermission.type}`, createRoleWithPermissionsResponse);
        } else {
          console.log(`Updating ${exportedRolePermission.type} role`);
          const updateRolePermissionsResponse = await updateRolePermissions(serverUrl, jwt, roleExist.id, exportedRolePermission);
          console.log(`${exportedRolePermission.type}`, updateRolePermissionsResponse)
        }
      }
    )
  ).catch((error) => {
    console.error(error);
  });







  // const publicRole = databaseRoles.find(role => role.type === 'public'); // Default role
  // const authenticatedRole = databaseRoles.find(role => role.type === 'authenticated'); // Default role
  // let customerSupportRole = databaseRoles.find(role => role.type === 'customer_support');
  // let analystRole = databaseRoles.find(role => role.type === 'analyst');
  // let superRole = databaseRoles.find(role => role.type === 'super');


  //   // ---- Read stored permission files ----
  //   const setPublicRolePermissions = await readJsonFile('./publicRolePermissions.json');
  //   const setAuthenticatedRolePermissions = await readJsonFile('./authenticatedRolePermissions.json');
  //   const setCustomerSupportRolePermissions = await readJsonFile('./customerSupportRolePermissions.json');
  //   const setAnalystRolePermissions = await readJsonFile('./analystRolePermissions.json');
  //   const setSuperRolePermissions = await readJsonFile('./superRolePermissions.json');


  // // ---- Create roles if missing ----
  // if (!customerSupportRole) {
  //   console.log('Creating customer-support role');
  //   // await createRole(jwt, 'Customer Support', 'Customer Support Agent', 'customer_support'); // This messes up the permissions object
  //   await createRoleWithPermissions(serverUrl, jwt, setCustomerSupportRolePermissions);
  //   databaseRoles = await getRoles(serverUrl, jwt);
  //   customerSupportRole = databaseRoles.find(role => role.type === 'customer_support');
  // }
  // if (!analystRole) {
  //   console.log('Creating analyst role');
  //   // await createRole(jwt, 'Analyst', 'Analyst', 'analyst'); // This messes up the permissions object
  //   await createRoleWithPermissions(serverUrl, jwt, setAnalystRolePermissions);
  //   databaseRoles = await getRoles(serverUrl, jwt);
  //   analystRole = databaseRoles.find(role => role.type === 'analyst');
  // }
  // if (!superRole) {
  //   console.log('Creating super role');
  //   // await createRole(jwt, 'Super', 'Super User', 'super'); // This messes up the permissions object
  //   await createRoleWithPermissions(jwt, setSuperRolePermissions);
  //   databaseRoles = await getRoles(jwt);
  //   superRole = databaseRoles.find(role => role.type === 'super');
  // }


  // // ---- Update permissions for each role ----
  // // Update public permissions
  // const publicPermissionsResponse = await updateRolePermissions(serverUrl, jwt, publicRole.id, setPublicRolePermissions);
  // console.log('publicPermissionsResponse ', publicPermissionsResponse)
  // // Update customerSupport permissions
  // const customerSupportPermissionsResponse = await updateRolePermissions(jwt, customerSupportRole.id, setCustomerSupportRolePermissions);
  // console.log('customerSupportPermissionsResponse', customerSupportPermissionsResponse)
  // // Update analyst permissions
  // const analystPermissionsResponse = await updateRolePermissions(jwt, analystRole.id, setAnalystRolePermissions);
  // console.log('analystPermissionsResponse', analystPermissionsResponse)
  // // Update super permissions
  // const superPermissionsResponse = await updateRolePermissions(jwt, superRole.id, setSuperRolePermissions);
  // console.log('superPermissionsResponse', superPermissionsResponse)
  // // Update authenticated permissions (this last because it's the roles we're using for a new database)
  // const authenticatedPermissionsResponse = await updateRolePermissions(jwt, authenticatedRole.id, setAuthenticatedRolePermissions);
  // console.log('authenticatedPermissionsResponse', authenticatedPermissionsResponse)

  // If this is a new database, change your role to super after the update
}
// importScript();

module.exports = importScript;

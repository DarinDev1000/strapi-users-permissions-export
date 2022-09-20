# Strapi Users Permissions Export

This is a cli tool to export strapi role permissions to a json file.
Also, it can import the json file to strapi database.

This can be useful when switching branches with different permissions

## Setup
Create an api-key or user with these permissions:
- userspermissions/createrole
- userspermissions/getrole
- userspermissions/getroles
- userspermissions/updaterole

**Strapi should be running alongside this cli tool.**

## Export Role Permissions from strapi database to json

**Navigate to the root of your strapi project and run the following command:**  
`npx strapi-users-permissions-export`

This will show the help and run again with the flags to export your permissions.

Example:  
- v4 `npx strapi-users-permissions-export -s http://localhost:1337 -k <api-key> export`
- v3 `npx strapi-users-permissions-export -v 3 -s http://localhost:1337 -u <email> -p <password> export`


## Import Role Permissions back into strapi database from json
**Navigate to the root of your strapi project and run the following command:**  
`npx strapi-users-permissions-export`

This will show the help and run again with the flags to export your permissions.

Example:  
- v4 `npx strapi-users-permissions-export -s http://localhost:1337 -k <api-key> import`
- v3 `npx strapi-users-permissions-export -v 3 -s http://localhost:1337 -u <email> -p <password> import`

#### <ins>[Npm](https://www.npmjs.com/package/strapi-users-permissions-export)<ins>

#### <ins>[Github](https://github.com/DarinDev1000/strapi-users-permissions-export)<ins>

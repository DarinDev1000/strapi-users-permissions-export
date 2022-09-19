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

```bash
npx strapi-users-permissions-export
```

This will show the help and run again with the flags to export your permissions.


## Import Role Permissions back into strapi database from json
WIP: Not implemented yet

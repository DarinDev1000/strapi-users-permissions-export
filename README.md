# Strapi Users Permissions Export

This is a cli tool to export strapi role permissions to a json file.
Also, it can import the json file to strapi database.

## Usage
1. Run your strapi backend

2. Navigate to the root of your strapi project and run the following command:  
  `npx strapi-users-permissions-export`

This will show the help and run again with the flags to export your permissions.

Example:  
`npm run strapi-users-permissions-export -- -s http://localhost:1337 -k apikey`


## Importing permissions back into Strapi database
WIP: Not implemented yet

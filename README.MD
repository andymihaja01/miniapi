# MiNi API
Hi! This is an api for the MiNi project, written in node.js, uses express and MongoDB.
## Run instructions
Before running the project, make sure to:
 - Install dependencies with `npm install`
 - Have a MongoDB instance to connect to and setup the config file accordingly
 - Have a mock MiNi Factory and setup the config file accordingly 
 - Run `npm run start`
## Test instructions
- The tests can be run using `npm run test` command.
- The tests use [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) so a little time is required to download the binaries locally  on the first run.
- Specific tests can be run using mocha's grep flag: 
	- `npm run test -- -g "Test the mini process" ` will run only the tests relative to the overall MiNi process ( i.e. from creating a profile and order to the notification about the order)

## Misc
The factory is mocked using sinon in the tests, and the notification is just a call to the notification service that is spied to make sure a notification to the end user is triggered at the right moment
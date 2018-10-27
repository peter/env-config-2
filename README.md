# env-config-2: Node.js Package to Handle Environment Variables and Config

The goals of this package are:

* To adhere to the Twelve Factor App principle of allowing config to be specified via environment variables so that we can have complete control over it for each environment that we may need (development, staging, production etc.)
* To support setting config variables with environment variables so that we can avoid having sensitive information such as passwords in the source code
* To be able to have convenient non-sensitive config defaults in the source code for the development environment to avoid the developer having to set a bunch of environment variables just to run the application in dev.
* To support a .env file that is not under version control where developers can conveniently override config settings on a case-by-case basis in development

## Installation

With npm:

```
npm install env-config-2 --save
```

With yarn:

```
yarn add env-config-2
```

## Example Usage in an API Node.js App

```javascript
# File: config.js
const envConfig = require('env-config-2')

const {NODE_ENV} = process.env
const defaultConfig ={
  NODE_ENV,
  PORT: (NODE_ENV === 'development' ? 3000 : null),
  MONGODB_URL: `mongodb://localhost:27017/node_env_config_example_${NODE_ENV}`,
  JWT_SECRET: (NODE_ENV === 'development' ? 'foobar' : null),
  JWT_EXPIRY: (3600 * 24 * 30),
  RATE_LIMIT: (NODE_ENV === 'production' ? 5 : 0),
  API_BASE_URL: (NODE_ENV === 'development' ? 'http://localhost:3000/v1' : 'https://api.versioned.io/v1')
}
const requiredKeys = ['ALGOLIASEARCH_APPLICATION_ID', 'ALGOLIASEARCH_API_KEY', 'ALGOLIASEARCH_API_KEY_SEARCH']
module.exports = envConfig.generateConfig({defaultConfig, requiredKeys})
```

```javascript
# File: index.js
const http = require('http')
const config = require('config')

function handler (request, response) {
   response.writeHead(200, {'Content-Type': 'text/plain'})
   response.end('Hello World')
}

const server = http.createServer(handler).listen(config.PORT)
console.log('Server started with config:', config)
```

```
# File .env
RATE_LIMIT=1000
```

Start the app with missing env variables:

```
RATE_LIMIT=5000 node index.js
```

Output:

```
AssertionError [ERR_ASSERTION]: Config is missing the following keys that can be set as environment variables: ALGOLIASEARCH_APPLICATION_ID, ALGOLIASEARCH_API_KEY, ALGOLIASEARCH_API_KEY_SEARCH
```

Start the app with all needed env variables:

```
RATE_LIMIT=5000 ALGOLIASEARCH_APPLICATION_ID=foobar ALGOLIASEARCH_API_KEY=foobar ALGOLIASEARCH_API_KEY_SEARCH=foobar node index.js
```

Output:

```
Server started with config: { ALGOLIASEARCH_APPLICATION_ID: 'foobar',
  ALGOLIASEARCH_API_KEY: 'foobar',
  ALGOLIASEARCH_API_KEY_SEARCH: 'foobar',
  NODE_ENV: 'development',
  PORT: 3000,
  MONGODB_URL: 'mongodb://localhost:27017/node_env_config_example_development',
  JWT_SECRET: 'foobar',
  JWT_EXPIRY: 2592000,
  RATE_LIMIT: 5000,
  API_BASE_URL: 'http://localhost:3000/v1' }
```

## Resources

* [The Twelve Factor App - Config](https://12factor.net/config)
* [dotenv package](https://www.npmjs.com/package/dotenv)
* [config package](https://www.npmjs.com/package/config)
* [env-config package](https://www.npmjs.com/package/env-config)

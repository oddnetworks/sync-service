Oddworks Sync Service
=====================

[![Build Status](https://travis-ci.org/oddnetworks/sync-service.svg?branch=master)](https://travis-ci.org/oddnetworks/sync-service)

## Overview

Oddworks Sync Service is a microservice that syncs data with various external sources. The currently supported sources are:

1. Ooyala
2. Brighcove
3. iTunes RSS
4. RSS (for Articles and Events)

## Usage

Sync jobs are stored in a MongoDB database that consist of:

- **id**: UUID of the job within the system
- **agent**: name of the agent to run the job
- **organization**: organization to run the job for
- **active**: true|false to turn jobs on and off

In addition to the properties above, each job has addition information required for the specific agent to do its work. A few examples:

```js
// An Ooyala job for Odd Networks
{
	id: '3a423706-f56e-44cc-b4a6-182917356832',
	agent: 'ooyala',
	organization: 'odd-networks',
	key: 'OOYALA_API_KEY',
	secret: 'OOYALA_API_SECRET',
	active: true
}

// An iTunes job for Odd Networks
{
	id: '3c2f1335-1b29-4c46-979d-889ab737b87e',
	agent: 'itunes',
	organization: 'odd-networks',
	url: 'ITUNES_RSS_URL',
	active: true
}
```

## Writing an Agent

Each agent exports a single function that gets passed 2 arguments:

- **job**: the job data from the database
- **events**: the events channel for OddCast the job should broadcast its entities to for syncing

An agent should also return a promise so the main `service.js` can run each job asynchronously and collect the results at the end.

For testability and modularity each agent has its own `transform.js` library that exposes functions to transform entities from the source into an Odd entity.

## License

Apache 2.0 © [Odd Networks](http://oddnetworks.com)

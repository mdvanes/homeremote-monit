console.log("testing...");

const monit = require('./index.js');

const res = { send: (...params) => { console.log("Mock send", ...params) }, statusCode: 200, headers: [] };

monit.getStatus(res, { info: (...params) => { console.log("Mock info:", ...params)}, error: (...params) => { console.log("Mock info:", ...params)}});

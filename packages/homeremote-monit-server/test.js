console.log("testing...");

const monit = require('./index.js');

const res = { send: (...params) => {
  console.log("Mock send", ...params);
  console.assert(params[0].list[0].name === "broek", "name of the first server")
  }, statusCode: 200, headers: [] };

const mockSettings = {
  monit: [
    {
      host: '127.0.0.1', port: '2812', path: '/_status?format=xml',
      monitUser: 'a',
      monitPass: 'b'
    }
  ]
};

monit.getStatus(res, mockSettings, { info: (...params) => { console.log("Mock info:", ...params)}, error: (...params) => { console.log("Mock info:", ...params)}});

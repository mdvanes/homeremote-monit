#!/usr/bin/env node
/* eslint-env node */

const { httpGetPromise } = require('./httpGetPromise');
const parseString = require('xml2js').parseString;

const bind = (app, settings, log) => {

  app.get('/monit/status', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
    getStatus(res, settings);

  });
};

const createMonitPromise = (monitSettings) => {
  const { monitUser, monitPass, ...otherSettings } = monitSettings;
  if(monitUser && monitPass) {
    const encodedAuthHeader = Buffer.from(`${monitUser}:${monitPass}`).toString('base64');
    otherSettings.headers = {'Authorization': `Basic ${encodedAuthHeader}`};
  }
  // const encodedAuthHeader = Buffer.from(`${monitUser}:${monitPass}`).toString('base64');
  // const newMonitSettings = {
  //   headers: {'Authorization': `Basic ${encodedAuthHeader}`},
  //   ...otherSettings
  // };

  return httpGetPromise(otherSettings);
};

const translateMonitObject = monitObj => ({
  // TODO reduce [0] and reduce multiple filters/selections on .server and .service
  name: monitObj.monit.server[0].localhostname[0],
  ip: monitObj.monit.server[0].httpd[0].address[0],
  status: monitObj.monit.service.filter(service => service.$.type === '5')[0].status[0] === '0' ? "OK" : "NOK",
  cpu: parseFloat(monitObj.monit.service.filter(service => service.$.type === '5')[0].system[0].cpu[0].system[0])
});

const getStatus = (res, settings, log) => {
  log.info('Call to /monit/status');

  // TODO aggregate over multiple monit instances
  if(!settings.monit || settings.monit.length === 0) {
    res.send({status: 'error', message: 'no Monit settings found'});
    return;
  }

  const promises = settings.monit.map(monitSettings => createMonitPromise(monitSettings));

  // createMonitPromise(settings.monit[0])
  Promise.all(promises)
    .then(xmlResponses => {
      // TODO convert each xmlResponse to JSON, but parseString returns a promise and should use resolve to trigger a second "then"
      return Promise.all(xmlResponses.map(xmlResponse => new Promise((resolve) => parseString(xmlResponse, (err, result) => resolve(result)))));
      // return Promise.all(xmlResponses.map(xmlResponse => parseString(xmlResponse, (err, result) => console.log(result))));
    })
    .then(jsonResponses => {
      const translated = jsonResponses.map(jsonResponse => translateMonitObject(jsonResponse));
      res.send({status: 'ok', list: [translated]});
    })
    // .then(x => console.dir(x))
    // .then(xmlResponses => {
    //   //console.dir(xmlData)
    //   // xmlResponses.map(xmlResponse => )
    //   parseString(xmlResponses[0], (err, result) => {
    //     // console.dir(result);
    //     // console.dir(translateMonitObject(result));
    //     const translated = translateMonitObject(result);
    //     res.send({status: 'ok', list: [translated]});
    //   });
    //   // if(data.queue) {
    //   //     return data.queue.slots.map( entry => {
    //   //         return {
    //   //             type: 'sbq',
    //   //             name: entry.filename,
    //   //             percentage: entry.percentage,
    //   //             status: entry.status
    //   //         };
    //   //     });
    //   // } else {
    //   //     return data;
    //   // }
    // })
    .catch(err => {
      log.error(err);
      res.send({status: 'error'});
    });
};

module.exports = { bind, getStatus };

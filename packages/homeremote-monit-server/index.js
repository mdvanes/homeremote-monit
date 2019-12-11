#!/usr/bin/env node
/* eslint-env node */

const { httpGetPromise } = require('./httpGetPromise');

const bind = (app, log) => {
  // api?mode=queue&output=json&apikey=3
  //
  // queue.slots[0].filename
  // queue.slots[0].percentage

  // api?mode=history&output=json&apikey=3
  //
  // history.slots[0].name
  // history.slots[0].status

  app.get('/monit/status', require('connect-ensure-login').ensureLoggedIn(), function (req, res) {
    getStatus(res);

    // const promiseArr = [];

    // if(settings.gears.sn) {
    //     const sbQueueUri = `${settings.gears.sn.uri}sabnzbd/api?mode=queue&output=json&apikey=${settings.gears.sn.apikey}`;
    //     const sbHistoryUri = `${settings.gears.sn.uri}sabnzbd/api?mode=history&output=json&apikey=${settings.gears.sn.apikey}`;
    //     promiseArr.push(sbQueuePromise(sbQueueUri));
    //     promiseArr.push(sbHistoryPromise(sbHistoryUri));
    // }
    //
    // if(settings.gears.tr) {
    //     const transmission = new Transmission({
    //         host: settings.gears.tr.host,
    //         port: settings.gears.tr.port,
    //         username: settings.gears.tr.user,
    //         password: settings.gears.tr.password
    //     });
    //     promiseArr.push(transmissionPromise(transmission));
    // }
    //
    // // Combine all calls with Promise.all(iterable);
    // Promise.all(promiseArr)
    // .then(data => {
    //     return data.reduce((aList, otherList) => {
    //         return aList.concat(otherList);
    //     });
    // })
    // .then(data => {
    //     res.send({status: 'ok', list: data});
    // })
    // .catch(err => {
    //     log.error(err);
    //     res.send({status: 'error'});
    // });
  });
};

const getStatus = (res, log) => {
  log.info('Call to /monit/status');

  // example: http://192.168.0.8:2812/_status?format=xml

  // TODO aggregate over multiple monit instances
  const url = 'http://192.168.0.8:2812/_status?format=xml';
  httpGetPromise(url)
    .then(data => {
      console.log(data);
      res.send({status: 'ok', list: ''});
      // if(data.queue) {
      //     return data.queue.slots.map( entry => {
      //         return {
      //             type: 'sbq',
      //             name: entry.filename,
      //             percentage: entry.percentage,
      //             status: entry.status
      //         };
      //     });
      // } else {
      //     return data;
      // }
    }).catch(err => {
    log.error(err);
    res.send({status: 'error'});
  });
};

module.exports = { bind, getStatus };

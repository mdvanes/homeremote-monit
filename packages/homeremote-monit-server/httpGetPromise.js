const http = require('http');

const httpGetPromise = url => {
  const expectedContentType = 'xml';
  return new Promise((resolve, reject) => {
//        http.get({ url, headers: {'Authorization': 'Basic YWRtaW46YWRtaW4='} }, (res) => {
    http.get({ host: '192.168.0.8', port: '2812', path: '/_status?format=xml', headers: {'Authorization': 'Basic YWRtaW46bW9uaXQ='} }, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];

      // console.log(res);

      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\n
                    Status Code: ${statusCode}`);
      } else if (expectedContentType === 'xml' && contentType !== 'text/xml') {
        error = new Error(`Invalid content-type.\n
                    Expected text/xml but received ${contentType}`);
      } else if (!expectedContentType && !/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n
                    Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.log(error.message);
        // consume response data to free up memory
        res.resume();
        return;
      }

      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        try {
          if(expectedContentType === 'xml') {
            resolve(rawData);
          } else {
            let parsedData = JSON.parse(rawData);
            //console.log(parsedData); // TODO
            //res1.send({status: 'ok'});
            resolve(parsedData);
          }
        } catch (e) {
          console.log(e.message);
          reject('zzz failed:' + e.message); // TODO reject
        }
      });
    }).on('error', (e) => {
      console.log(`Got error: ${e.message}`); // TODO reject
    });
  });
};

module.exports = { httpGetPromise };
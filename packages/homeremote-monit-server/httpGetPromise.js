const http = require('http');

const httpGetPromise = urlObj => {
  const expectedContentType = 'xml';
  return new Promise((resolve, reject) => {
    http.get(urlObj, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];

      // console.log(res);

      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\n
                    Status Code: ${statusCode} ${statusCode === 401 ? 'Probably the supplied Monit username or password is wrong' : ''}`);
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
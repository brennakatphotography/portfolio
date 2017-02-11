const makeHeaders = require('./makeHeaders');
const ajax = {
  'http:': require('http'),
  'https:': require('https')
};
const fs = require('fs');
const { PHOTO_API } = process.env;
const url = require('url');

const fetch = (location, Authorization, cb) => {
  const config = {
    ...url.parse(location),
    ...makeHeaders({ Authorization })
  };
  return ajax[config.protocol || 'http:'].get(config, cb);
};

const streamFile = (resource, token) => {
  return new Promise((resolve, reject) => {
    const filename = `/tmp/${Date.now()}-${Math.floor(Math.random() * 5000)}.jpg`;
    const file = fs.createWriteStream(filename);
    file.on('open', () => {
        return fetch(`${PHOTO_API}${resource}`, token, stream => stream.pipe(file));
      }).on('finish', () => resolve(filename))
      .on('error', reject);
  });
};

const sendFile = response => file => {
  return new Promise((resolve, reject) => {
    response.sendFile(file, err => {
      if (err) return reject(err);
      resolve(file);
    });
  });
};

module.exports = {
  sendFile,
  streamFile
};

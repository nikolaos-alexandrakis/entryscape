#!/usr/bin/env node
const http = require('https');
const _ = require('lodash');

const request = http.get('https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json', (response) => {

  response.setEncoding('utf8');
  let rawData = '';
  response.on('data', (chunk) => { rawData += chunk; });
  response.on('end', () => {
    try {
      const publicLicenseInformation = JSON.parse(rawData);
      const stdin = process.openStdin();

      let data = '';

      stdin.on('data', (chunk) => {
        data += chunk;
      });

      stdin.on('end', () => {
        const licenses = JSON.parse(data);

        Object.entries(licenses).forEach((keyVal) => {
          const license = keyVal[1];
          const name = keyVal[0];
          const licenseID = license.licenses;
          let licenseIDAndUrl = '';
          if (typeof licenseID === 'string') {
            const publicLicense = _.find(publicLicenseInformation.licenses, (publicLicenseInfo) => publicLicenseInfo.licenseId === licenseID.split('*').join(''));

            let licenseURL = '';
            if (publicLicense) {
              licenseURL = publicLicense.seeAlso.length > 0 ? publicLicense.seeAlso[0] : publicLicense.detailsUrl;
            }
            licenseIDAndUrl = `${licenseID}, ${licenseURL}`;

          } else {
            licenseIDAndUrl = `Unknown license`;
          }

          const licenseText = `${name}, ${license.repository}
License: ${licenseIDAndUrl}
`;

          console.log(licenseText);
        });
      });
    } catch (e) {
      console.error(e.message);
    }
  });
});




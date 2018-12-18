#!/usr/bin/env node
const _ = require('lodash');
const fs = require('fs');
const publicLicenseInformation = JSON.parse(fs.readFileSync('./scripts/licenses/licenses.json'));

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

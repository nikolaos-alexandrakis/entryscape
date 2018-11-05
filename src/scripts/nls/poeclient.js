const request = require('request');

module.exports = (apiToken, projectId) => {
  const apiURL = 'https://poeditor.com/api/';
  const getURLForLanguage = lang => new Promise((resolve, reject) => {
    const options = {
      url: apiURL,
      method: 'POST',
      form: {
        action: 'export',
        api_token: apiToken,
        id: projectId,
        language: lang,
        type: 'json',
        filters: ['translated'],
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).item);
      }
    });
  });

  const exportTermsAndDefinitions = lang => getURLForLanguage(lang).then(url =>
    new Promise((resolve, reject) => {
      if (url && url.length > 0) {
        request(url, (error, response, body) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(JSON.parse(body));
          }
        });
      } else {
        reject();
      }
    }));

  const listProjects = () => new Promise((resolve, reject) => {
    const options = {
      url: apiURL,
      method: 'POST',
      form: {
        action: 'list_projects',
        api_token: apiToken,
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).list);
      }
    });
  });

  const listProjectLanguages = () => new Promise((resolve, reject) => {
    const options = {
      url: apiURL,
      method: 'POST',
      form: {
        action: 'list_languages',
        api_token: apiToken,
        id: projectId,
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body).list);
      }
    });
  });

  const syncTerms = terms => new Promise((resolve, reject) => {
    const options = {
      url: apiURL,
      method: 'POST',
      form: {
        action: 'sync_terms',
        api_token: apiToken,
        id: projectId,
        data: JSON.stringify(terms),
      },
    };
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });

  const uploadDefinitions = (defs, language) => new Promise((resolve, reject) => {
    const options = {
      url: apiURL,
      formData: {
        action: 'upload',
        api_token: apiToken,
        id: projectId,
        updating: 'definitions',
        overwrite: 1,
        sync_terms: 0,
        language,
        fuzzy_trigger: 1,
        file: {
          value: JSON.stringify(defs),
          options: {
            filename: 'termsdefs.json',
            contentType: 'application/json',
          },
        },
      },
    };

    request.post(options, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    });
  });

  return {
    getURLForLanguage,
    exportTermsAndDefinitions,
    listProjects,
    listProjectLanguages,
    syncTerms,
    uploadDefinitions,
  };
};

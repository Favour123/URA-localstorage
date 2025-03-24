let auth2Instance = null;

export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    // Check if the Google API script is loaded
    if (!window.gapi) {
      reject(new Error('Google API not loaded'));
      return;
    }

    window.gapi.load('auth2', () => {
      window.gapi.auth2
        .init({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        })
        .then((auth2) => {
          auth2Instance = auth2;
          resolve(auth2);
        })
        .catch(reject);
    });
  });
};

export const getGoogleAuth = () => {
  return auth2Instance;
}; 
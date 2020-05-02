const hostConfig = {
  dev: {
    host: 'http://localhost:3000',
    appHost: 'https://devapp.bocommlife.com'
  },
  sit: {
    host: 'https://devapp.bocommlife.com/pta/gateway',
    appHost: 'https://devapp.bocommlife.com'
  },
  prod: {
    host: 'https://app.bocommlife.com/pta/gateway',
    appHost: 'https://ydrs.bocommlife.com'
  }
};

// const env = 'dev';
const env = 'sit';

export const appHost = hostConfig[env].appHost;

const APICodeToPath = {
  '020002': '/aiuw/underwritingService/020002',
  '020003': '/aiuw/underwritingService/020003',
  '020004': '/aiuw/underwritingService/020004'
};

export const getAPIRequestUrl = (APICode = '') => {
  // @ts-ignore
  return `${hostConfig[env].host}${APICodeToPath[APICode]}`;
};

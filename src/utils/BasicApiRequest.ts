// 统一的请求方法
import { getAPIRequestUrl } from '@config/APIConfig';
import { timeout } from './promise';
import get from 'get-value';
import Modal from 'antd-mobile/lib/modal';
import Toast from 'antd-mobile/lib/toast';
import moment from 'moment';
import md5 from 'crypto-js/md5';
// @ts-ignore
import { hex2b64, RSAKey } from 'jsrsasign';
import { getPublicKey } from './security';
import Tools from './Tools';
import Aes from './Aes';

const alert = (msg: string) => {
  Modal.alert('', msg);
};
const prvkey =
  '-----BEGIN RSA PRIVATE KEY-----' +
  'MIICXQIBAAKBgQCWs6oRT3yb3phJrnuxIfsT+X4tF/pbVTW5tv6sDq7Tc+JLFYUI83eAtwt5TxhmweaSC5l+WZuF6MVuvn5QAlgccrwL8bMZyx37vw1EWi3I8rBgc7Ayee9E+Irf6xZLAesR3wIcm4uOWzUP4oqhTJiO3mgAaNK5holjWQjzWDY26wIDAQABAoGAYhGY4prvZB9+yrQZGjQax+zcB0xLR5Qz2h8Tq7QCYOhQorvmTuThJ4n2lYK7RmN4QCH8SRTW+FV55Y9hc3+TBi5yytDmTfGYJbQEBoqR+S1YG+KsC6L6aDni0uEW9DCBC76e8VeHj4GCrL05I9+JQvLjE/XqC5xsKaMH/iLimcECQQDfx4xRuBtF9lkyBYd+tQZCcBI0ArUVb0l9KEgkvMdDhu3EnIB+dZFwN6s8iMOYmx7+Qn1tYlEOon9I72S/dnmHAkEArGZ+KYGCDN+n2zKzgGu5bK2Ly4Pp7QkQJzvoSFTfd5OoBNHA294xfpfjIuwztGQv4v3abCgIANv0J57O7XQgfQJBALSU/UD8xtWAZJ4fJCY1wuVeNvJNtP+lHLKpDP7IcCyn97uPZ4mlKkZaRg7FdsHxe+NGmJzql+qtavXaaXywCIUCQF4Juh+hyPKEvObQDSGroQUq1Oo6Fkt5ehosj1OFGC/9ltSqJWzJEm5fI0JVXQ6053oFxjLg0xzE3bUO5wiXI3ECQQDGRo+3cjUB0z1ouV8ThgqeRqssDCxTOjj5X7pXVGEoNE2gwQOXwLAhaqXuolTDcd4/I8ALh5V5CxvZyYtFPTy2' +
  '-----END RSA PRIVATE KEY-----';

export const APIDeps = {
  encryParams: '',
  accessCode: '',
  uniqueId: '',
  times: 0
};

function getRandomNumStr(len: number) {
  let str = '';
  while (str.length < len) {
    str += String(Math.floor(Math.random() * 10));
  }
  return str.substr(0, len);
}

function getReqUrl(url = '') {
  return new URL(url).pathname;
}

export async function fetchAPI(
  APICode = '', // 接口编号
  params = {}, // 请求数据
  requestTimeout = 15 * 1000 // 超时时间（非必传,默认15秒）
) {
  const url = getAPIRequestUrl(APICode);

  const exedata = moment().format('YYYY-MM-DD');
  const exetime = moment().format('HH:mm:ss');

  const body = {
    head: {
      client: 'IXX',
      channel: '10',
      contorgin: '13',
      transactionno: getRandomNumStr(16),
      transactiontype: 'lis',
      transactionexedate: exedata,
      transactionexetime: exetime
    },
    body: params
  };

  const data = JSON.stringify(body);

  const config = {
    body: data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',

      'access-token': 'dGVkIjoxNTAyNDQ5NTgwMTg3LCJleH',
      'sign-data': '',
      'source-code': 'bocoixx',
      'ixx-ebt-token': APIDeps.accessCode,

      clientid: 'aixx',
      signature: '',
      timestamp: '',
      nonce: '',
      signatureversion: ''
    },
    method: 'POST'
  };

  // --------------------RSA开始-----------------------
  const rsa = new RSAKey();
  rsa.readPrivateKeyFromPEMString(prvkey);
  const sigVal = rsa.sign(data, 'sha1');
  const hex2b64Val = hex2b64(sigVal);

  config.headers = {
    ...config.headers,

    'sign-data': hex2b64Val
  };
  // --------------------RSA结束-----------------------

  // --------------------安全加固开始-----------------------
  const secret = '992453';
  const time = moment(Date.now()).valueOf();
  const randNo = 100 + Math.floor(Math.random() * 900);

  const requestUrl = getReqUrl(url);
  const dataWithoutSpace = data.replace(/\s+/g, '');

  const sign = `${secret}${String(time)}${String(
    randNo
  )}${requestUrl}${dataWithoutSpace}`;
  const signMd5 = md5(sign).toString();
  const signVersion = '1.3.0';

  config.headers = {
    ...config.headers,

    signature: signMd5,
    timestamp: String(time),
    nonce: String(randNo),
    signatureversion: signVersion
  };
  // --------------------安全加固结束-----------------------

  // 2019-04 body加密
  config.body = Aes.encrypt(data, APIDeps.encryParams);
  // 2019-04 body加密结束

  Toast.loading('加载中...', requestTimeout / 1000);
  try {
    const response = await timeout(requestTimeout)(fetch(url, config)).catch(
      e => {
        alert(e.message);
      }
    );
    Toast.hide();

    let res = await response.text();
    if (!Tools.isJson(res)) {
      res = Aes.decrypt(res, APIDeps.encryParams);
    }
    res = JSON.parse(res);

    console.log({ 请求地址: url, 请求数据: body, 返回报文: res });
    // console.log(
    //   JSON.stringify({ 请求地址: url, 请求数据: params, 返回报文: res })
    // );

    if (res.status === 412 || res.status === 510) {
      const times = APIDeps.times++;
      if (times >= 5) {
        return alert('系统繁忙');
      }
      return new Promise(reslove => {
        getPublicKey({
          uniqueId: APIDeps.uniqueId || Tools.getRandomStr(10),
          callBack: () => {
            reslove(fetchAPI(APICode, params, requestTimeout));
          },
          test: true
        });
        Toast.loading('签名验证中,请稍后！', 2);
      });
    }

    if (get(res, 'status.statuscode') !== '01') {
      alert(get(res, 'status.statusmessage') || '系统繁忙，请稍后再试');
      return null;
    }

    return get(res, 'result');
  } catch (e) {
    alert(e.message);
    return null;
  }
}

//2019年4月安全加密改造
import md5 from 'crypto-js/md5';
import { appHost } from '@config/APIConfig';
import Tools from './Tools';
import { KJUR, KEYUTIL, hex2b64 } from 'jsrsasign';
import { APIDeps } from './BasicApiRequest';


const defaultParams = {
  publicKeyUrl: `${appHost}/sgw/encryptParams/getPublicKey?clientid=aixx`,
  saveAesKey: `${appHost}/sgw/encryptParams/saveAESKey`,
  clientType: 'ixx',
  uniqueId: Tools.getRandomNumStr(15),
  callBack: () => { },
  test: false,

};
const jsonToXFrameStr = data => Object.keys(data).map((item) => `${item}=${data[item]}`).join('&');

/**
 * 2019年4月安全加密改造
 * @param {*}
 * publicKeyUrl获取公钥的地址
 * saveAesKey 保存密钥的地址
 * clientType 客户端
 * uniqueId 唯一标识
 * callBack 验证成功之后的回调函数，当握手失败的时候，调用接口返回412的时候有效
 */
const curSecurity = Tools.getRandomStr(16);
const curUniqueId =  Tools.getRandomStr(16);

export const getPublicKey = (params) => {
  params = { ...defaultParams, ...params };
  const {
    publicKeyUrl,
    saveAesKey,
    clientType,
    // uniqueId,
    callBack,
    // test
  } = params;
  const uniqueId = curUniqueId;
  APIDeps.uniqueId = curUniqueId;
  Tools.fetchData(publicKeyUrl, (pubKeyData) => {
    //随机生成16位字符串当私钥
    const security =  curSecurity;
    const headData = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    // if(APIDeps.uniqueId!=='')return;
    // 生成公钥publicKey
    const publicKeys = '-----BEGIN PUBLIC KEY-----'
      + pubKeyData.publicKey
      + '-----END PUBLIC KEY-----';
    const pubkey = KEYUTIL.getKey(publicKeys);
    //使用公钥通过RSA加密私钥
    const enc = hex2b64(KJUR.crypto.Cipher.encrypt(security, pubkey));
    const encryptStr = md5(uniqueId);
    // console.log(uniqueId);
    const accesscode = `${clientType}${encryptStr}`;
    const bodyData = {
      accesscode,
      key: encodeURIComponent(enc),
      clientid: 'aixx'
    };
    //将json对象转化为x-www-form需要的数据格式
    const bodyStr = jsonToXFrameStr(bodyData);
    // console.log(bodyStr);
    Tools.fetchPostData(saveAesKey, headData, bodyStr, (data) => {
      // console.log(data);
      /* if (test)  */
      if (data.code === '1') {
        APIDeps.accessCode = accesscode;
        APIDeps.encryParams = security;
        // Promise.resolve(1);
        // callBack && callBack();
        callBack();
      }
    });
  });
};

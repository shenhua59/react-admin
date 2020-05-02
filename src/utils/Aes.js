import CryptoJS from 'crypto-js/crypto-js';

/**
 * 加密（依赖aes.js）
 * @param word 加密的字符串
 * @returns {*}
 */
const sec_Key = '^BJSHGZ!@#ZZZDGJ';
function encrypt(word, secKey = sec_Key) {
  var key = CryptoJS.enc.Utf8.parse(secKey);
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var iv = CryptoJS.enc.Utf8.parse('0108489312380708');
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,//CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

/**
 * 解密
 * @param word 解密的字符串
 * @returns {*}
 */
function decrypt(word, secKey = sec_Key) {
  var key = CryptoJS.enc.Utf8.parse(secKey);
  var iv = CryptoJS.enc.Utf8.parse('0108489312380708');
  var decrypt = CryptoJS.AES.decrypt(word, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

export default {
  encrypt,
  decrypt
};

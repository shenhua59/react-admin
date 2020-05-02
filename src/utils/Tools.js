import FetchHelper from "./FetchHelper";

class Tools {
  //生成随机码
  static getRandomStr(len) {
    let str = '';
    for (; str.length < len; str += Math.random().toString(36).substr(2));
    return str.substr(0, len);
  }
  //生成随机码(数字)
  static getRandomNumStr(len) {
    let str = '';
    for (; str.length < len; str += String(Math.floor(Math.random() * 10)));
    return str.substr(0, len);
  }
  static fetchData = (url, handleSuccess) => {
    fetch(url)
      .then(FetchHelper.checkStatus)
      .then(FetchHelper.parseJSON)
      .then(handleSuccess)
      .catch(FetchHelper.fetchDataFailed);
  }
  static fetchPostData = (url, headData, bodyData, handleSuccess) => {
    fetch(url, {
      method: 'POST',
      headers: headData,
      //mode: 'no-cors',
      body: bodyData,
    })
      .then(FetchHelper.checkStatus)
      .then(FetchHelper.parseJSON)
      .then(FetchHelper.parsePostData)
      .then(handleSuccess)
      .catch(FetchHelper.fetchDataFailed);
  }
    // 安全改造
    static isJson(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          // console.log('error：'+str+'!!!'+e);
          return false;
        }
      }
    }
}

export default Tools;

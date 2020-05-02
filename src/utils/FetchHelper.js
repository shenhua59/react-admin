class FetchHelper {
  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
  static parseJSON(response) {
    return response.json();
  }
  static fetchDataFailed(error) {
    return error;
  }
  static parseData(obj) {
    if (obj.msg === 'ok') {
      return obj.value;
    }
    const error = new Error('数据内容错误');
    error.obj = obj;
    throw error;
  }
}

export default FetchHelper;

function svoeFermerstvoHelpers() {
  const userDeviceArray = [
    { device: "Android", platform: /Android/ },
    { device: "iPhone", platform: /iPhone/ },
    { device: "iPad", platform: /iPad/ },
    { device: "iPod", platform: /iPod/ },
    { device: "webOS", platform: /webOS/ },
    { device: "IEMobile", platform: /IEMobile/ },
    { device: "Opera Mini", platform: /Opera Mini/ },
    { device: "BlackBerry", platform: /BlackBerry/ },
    { device: "Symbian", platform: /Symbian/ },
    { device: "Windows Phone", platform: /Windows Phone/ },
    { device: "Tablet OS", platform: /Tablet OS/ },
    { device: "Linux", platform: /Linux/ },
    { device: "Windows", platform: /Windows NT/ },
    { device: "Macintosh", platform: /Macintosh/ },
  ];

  const browserArray = [
    { name: "Mozila", family: /mozila|firefox|fxios/i },
    { name: "Chrome", family: /chrome|chromium|crios/i },
    { name: "Safari", family: /safari/i },
    { name: "Opera", family: /opera|opr\//i },
    { name: "Edge", family: /edg/i },
  ];

  /**
   *
   * @param {Navigator.userAgent|string} [userAgent=navigator.userAgent]
   * @return {string|Navigator.userAgent}
   */
  function getUserDevice(userAgent = navigator.userAgent) {
    for (const userDeviceArrayElement of userDeviceArray) {
      if (userDeviceArrayElement.platform.test(userAgent)) {
        return userDeviceArrayElement.device;
      }
    }
    return userAgent;
  }

  /**
   *
   * @param {Navigator.userAgent|string} [userAgent=navigator.userAgent]
   * @return {string|Navigator.userAgent}
   */
  function getUserBrowser(userAgent = navigator.userAgent) {
    userAgent = userAgent.toLowerCase();
    for (const browserListElement of browserArray) {
      if (browserListElement.family.test(userAgent)) {
        return browserListElement.name;
      }
    }
    return userAgent;
  }

  /**
   *
   * @param {Document.cookie|string} [cookieStr=document.cookie]
   * @return {string}
   */
  function getCookieMB(cookieStr = document.cookie) {
    const cookieArray = cookieStr.split(";");
    for (const string of cookieArray) {
      if (string.includes("mindboxDeviceUUID")) {
        const cookieArray = string.split("=");
        return cookieArray[1];
      }
    }
    return "";
  }

  /**
   *
   * @param {Object} customerAction
   * @param {'async'|'sync'} [requestType = 'async']
   * @param {Object} customer
   * @param {String} [operationName='']
   * @param {Function} onSuccess
   * @param {Function} onError
   */
  function sendMBEvent({ customerAction = {}, requestType = "async", customer, operationName = "", onSuccess = () => {}, onError = () => {} }) {
    mindbox(requestType, {
      operation: operationName,
      data: {
        customer,
        customerAction,
      },
      onSuccess,
      onError,
    });
  }

  /**
   *
   * @param {Navigator.userAgent|string} [userAgent=navigator.userAgent]
   * @return {"mobile"|"PC"}
   */
  function getDeviceType(userAgent = navigator.userAgent) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return "mobile";
    } else {
      return "PC";
    }
  }

  /**
   *
   * @param {Navigator} [navigatorObj=navigator]
   * @return {{latitude: number, longitude: number}|{}}
   */
  function getGeolocation(navigatorObj = navigator) {
    if ("geolocation" in navigatorObj) {
      navigatorObj.geolocation.getCurrentPosition(function (position) {
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      });
    }
    return {};
  }

  /**
   * @description меотод принимает строку адреса и префикс параметра который должен быть найден. Возвращает значение параметра по префиксу.
   * @param {document.location.href|string} [str=""]
   * @param {string} [utm="source"] префикс по которому будет искаться нужный параметр в строке.
   * @return {string}
   */
  function getUtm(str = "", utm = "source") {
    let result = "";
    if (str) result = new RegExp("utm_" + utm + "(%3D|=)[\\w\\d_.-]+(%26|&)?", "g").exec(str);
    if (result && result.length) {
      let resultStr = new RegExp(/(%3D|=)[\w\d_.-]+(%26|&)?/).exec(result[0]);
      if (resultStr) {
        resultStr = resultStr[0];
        resultStr = resultStr.replaceAll(/%26|&/g, "");
        resultStr = resultStr.replaceAll(/%3D|=/g, "");
        resultStr = resultStr.slice(0, 1000);
        return resultStr;
      }
    }
    return "";
  }

  /**
   * @description метод обрезает строку до 1000 символов и заменяет все не декодированные "=" и "&" на нормальные.
   * @param {document.location.href|string} [url=""]
   * @return {string}
   */
  function replaceUrlSymbols(url = "") {
    let resultStr = url.slice(0, 1000);
    resultStr = resultStr.replaceAll(/%3D/g, "=");
    resultStr = resultStr.replaceAll(/%26/g, "&");
    return resultStr;
  }

  /**
   * @description метод получает строку адреса и отдаёт резанные
   * @param {document.location.href|string} [url = document.location.href]
   * @return {{utmcontent: string, utmmedium: string, utmcampaign: string, location: string, utmterm: string, utmsource: string}}
   */
  function prepareUrl(url = window.location.href) {
    let originalDecodeUrl = decodeURI(url),
      location = replaceUrlSymbols(url),
      utmsource = getUtm(originalDecodeUrl),
      utmmedium = getUtm(originalDecodeUrl, "medium"),
      utmcampaign = getUtm(originalDecodeUrl, "campaign"),
      utmterm = getUtm(originalDecodeUrl, "term"),
      utmcontent = getUtm(originalDecodeUrl, "content");

    return { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent };
  }

  return {
    getUserDevice,
    getUserBrowser,
    getCookieMB,
    sendMBEvent,
    getDeviceType,
    getGeolocation,
    replaceUrlSymbols,
    prepareUrl,
  };
}
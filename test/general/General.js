(function inite () {function svoeFermerstvoHelpers() {
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

{
  class FirstSession {
    constructor() {
      this._window = window;
      this._navigator = navigator;
      this._cookie = document.cookie;
      this.referrer = document.referrer;
      this.userDeviceArray = [
        { device: "Android", platform: /Android/i },
        { device: "iPhone", platform: /iPhone/i },
        { device: "iPad", platform: /iPad/i },
        { device: "iPod", platform: /iPod/i },
        { device: "webOS", platform: /webOS/i },
        { device: "IEMobile", platform: /IEMobile/i },
        { device: "Opera Mini", platform: /Opera Mini/i },
        { device: "BlackBerry", platform: /BlackBerry/i },
        { device: "Symbian", platform: /Symbian/i },
        { device: "Windows Phone", platform: /Windows Phone/i },
        { device: "Tablet OS", platform: /Tablet OS/i },
        { device: "Linux", platform: /Linux/i },
        { device: "Windows", platform: /Windows NT/i },
        { device: "Macintosh", platform: /Macintosh/i },
      ];
      this._browser = [
        { name: "Mozila", family: /mozila|firefox|fxios/i },
        { name: "Chrome", family: /chrome|chromium|crios/i },
        { name: "Safari", family: /safari/i },
        { name: "Opera", family: /Opera|opr\//i },
        { name: "Edge", family: /edg/i },
      ];
    }

    getCookie(cookie = "") {
      const cookieArray = cookie.split(";");
      for (const string of cookieArray) {
        if (string.includes("mindboxDeviceUUID")) {
          const cookieArray = string.split("=");
          return cookieArray[1];
        }
      }
      return "";
    }

    init() {
      const cookie = this.getCookie(this._cookie);
      this.checkSessionStatus(cookie, (status) => {
        if (!status) {
          const payload = this.prepareSendPayload();
          this.sendSessionEvent(payload);
        }
      });
    }

    /**
     * @description меотод принимает строку адреса и префикс параметра который должен быть найден. Возвращает значение параметра по префиксу.
     * @param {document.location.href|string} [str=""]
     * @param {string} [utm="source"] префикс по которому будет искаться нужный параметр в строке.
     * @return {string}
     */
    getUtm(str = "", utm = "source") {
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
    replaceUrlSymbols(url = "") {
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
    prepareUrl(url = window.location.href) {
      let originalDecodeUrl = decodeURI(url),
        location = replaceUrlSymbols(url),
        utmsource = getUtm(originalDecodeUrl),
        utmmedium = getUtm(originalDecodeUrl, "medium"),
        utmcampaign = getUtm(originalDecodeUrl, "campaign"),
        utmterm = getUtm(originalDecodeUrl, "term"),
        utmcontent = getUtm(originalDecodeUrl, "content");

      return { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent };
    }

    prepareSendPayload() {
      const cookie = this.getCookie(this._cookie);
      const device = this.getUserDevice(this._navigator.userAgent);
      const { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent } = this.prepareUrl(this._window.location.href);
      const path = this._window.location.pathname;
      const { latitude, longitude } = this.getGeolocation(this._navigator);
      const browser = this.getBrowser(this._navigator.userAgent.toLowerCase(), this._browser);
      const os = this.getPlatform(this.userDeviceArray, this._navigator.userAgent);
      return {
        os,
        referrer: this.referrer,
        location,
        device,
        mindboxDeviceUUID: cookie,
        path,
        latitude,
        longitude,
        browser,
        utmsource,
        utmmedium,
        utmcampaign,
        utmterm,
        utmcontent,
      };
    }

    getBrowser(userAgent, browserList) {
      for (const browserListElement of browserList) {
        if (browserListElement.family.test(userAgent)) {
          return browserListElement.name;
        }
      }
      return userAgent;
    }

    getPlatform(userDeviceArray, userAgent) {
      for (const userDeviceArrayElement of userDeviceArray) {
        if (userDeviceArrayElement.platform.test(userAgent)) {
          return userDeviceArrayElement.device;
        }
      }
      return userAgent;
    }

    checkSessionStatus(mindboxDeviceUUID, callBack = () => {}) {
      mindbox("sync", {
        operation: "Sfgetstartsessionflag",
        data: {
          customer: {
            ids: {
              cookiemindbox: this.getCookie(this._cookie),
            },
          },
        },
        onSuccess: function (response) {
          if (response && "customer" in response && "customFields" in response.customer && "sfsessionflag" in response.customer.customFields) {
            callBack(response.customer.customFields.sfsessionflag);
          } else callBack(false);
        },
      });
    }

    getGeolocation(navigator) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          return { latitude: position.coords.latitude, longitude: position.coords.longitude };
        });
      }
      return {};
    }

    getUserDevice(userAgent = "") {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return "mobile";
      } else {
        return "PC";
      }
    }

    sendSessionEvent({ mindboxDeviceUUID, browser, city, device, location, os, path, referrer, ip, country, state, latitude, longitude, source }) {
      const getCookieLocal = this.getCookie;
      mindbox("sync", {
        operation: "Sfsessionstart",
        data: {
          customer: {
            ids: {
              cookiemindbox: mindboxDeviceUUID,
            },
          },
          customerAction: {
            customFields: {
              browser: browser,
              city: city,
              cookieMB: mindboxDeviceUUID,
              device: device,
              location: location,
              os: os,
              path: path,
              referrer: referrer,
              ip, // силами js получить нельзя.
              country: country,
              state: state,
              latitude: latitude,
              longitude: longitude,
              source: source,
            },
          },
        },
        onSuccess: function () {
          mindbox("sync", {
            operation: "Sfupdatestartsessionflag",
            data: {
              customer: {
                ids: {
                  cookiemindbox: getCookieLocal(document.cookie),
                },
              },
            },
            onSuccess: function () {},
            onError: function (error) {},
          });
        },
        onError: function (error) {},
      });
    }
  }

  function firstSessionReload(count = 0) {
    if (count < 5) {
      ++count;
      if ("mindbox" in window) {
        const sessionStartObj = new SessionStart();

        const cookie = sessionStartObj.getCookie(document.cookie);
        if (!cookie || cookie === "") {
          setTimeout(firstSessionReload, 1000, count);
        } else {
          sessionStartObj.init();
        }
      } else {
        setTimeout(firstSessionReload, 1000, count);
      }
    }
  }

  firstSessionReload();
}
{

  class MindboxPageVisit {
    constructor() {
      this.userDeviceArray = [
        { device: "Android", platform: /Android/i },
        { device: "iPhone", platform: /iPhone/i },
        { device: "iPad", platform: /iPad/i },
        { device: "Symbian", platform: /Symbian/i },
        { device: "Windows Phone", platform: /Windows Phone/i },
        { device: "Tablet OS", platform: /Tablet OS/i },
        { device: "Linux", platform: /Linux/i },
        { device: "Windows", platform: /Windows NT/i },
        { device: "Macintosh", platform: /Macintosh/i },
      ];
      this.browser = [
        { name: "Mozila", family: /mozila|firefox|fxios/i },
        { name: "Chrome", family: /chrome|chromium|crios/i },
        { name: "Safari", family: /safari/i },
        { name: "Opera", family: /Opera|opr\//i },
        { name: "Edge", family: /edg/i },
      ];

      this.$_window = window;
      this._navigator = navigator;
      this.$_cookie = document.cookie;
      this.referrer = document.referrer;
      this.prevLocation = null;
    }

    init() {
      if (!this.prevLocation) {
        this.sendEvent();

        var target = document.getElementsByTagName("html")[0];

        const observer = new MutationObserver(() => {
          if (this.prevLocation !== window.location.href) {
            this.sendEvent();
          }
        });

        observer.observe(target, { attributes: true });
      }
    }

    /**
     * @description меотод принимает строку адреса и префикс параметра который должен быть найден. Возвращает значение параметра по префиксу.
     * @param {document.location.href|string} [str=""]
     * @param {string} [utm="source"] префикс по которому будет искаться нужный параметр в строке.
     * @return {string}
     */
    getUtm(str = "", utm = "source") {
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
    replaceUrlSymbols(url = "") {
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
    prepareUrl(url = window.location.href) {
      let originalDecodeUrl = decodeURI(url),
        location = replaceUrlSymbols(url),
        utmsource = getUtm(originalDecodeUrl),
        utmmedium = getUtm(originalDecodeUrl, "medium"),
        utmcampaign = getUtm(originalDecodeUrl, "campaign"),
        utmterm = getUtm(originalDecodeUrl, "term"),
        utmcontent = getUtm(originalDecodeUrl, "content");

      return { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent };
    }

    sendEvent() {
      this.prevLocation = window.location.href;

      const device = this.getUserDevice(this._navigator.userAgent);
      const cookie = this.getCookie(this.$_cookie);
      const { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent } = this.prepareUrl(this.$_window.location.href);
      const path = this.$_window.location.pathname;
      const { latitude, longitude } = this.getGeolocation(this._navigator);
      const browser = this.getBrowser(this._navigator.userAgent.toLowerCase(), this.browser);
      const os = this.getPlatform(this.userDeviceArray, this._navigator.userAgent);
      this.pageVisitEvent({
        device,
        mindboxDeviceUUID: cookie,
        location,
        path,
        latitude,
        longitude,
        browser,
        os,
        utmsource,
        utmmedium,
        utmcampaign,
        utmterm,
        utmcontent,
      });
    }

    getBrowser(userAgent, browserList) {
      for (const browserListElement of browserList) {
        if (browserListElement.family.test(userAgent)) {
          return browserListElement.name;
        }
      }
      return userAgent;
    }

    getPlatform(userDeviceArray, userAgent) {
      for (const userDeviceArrayElement of userDeviceArray) {
        if (userDeviceArrayElement.platform.test(userAgent)) {
          return userDeviceArrayElement.device;
        }
      }
      return userAgent;
    }

    getGeolocation(navigator) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          return { latitude: position.coords.latitude, longitude: position.coords.longitude };
        });
      }
      return {};
    }

    getCookie(cookie = "") {
      const cookieArray = cookie.split(";");
      for (const string of cookieArray) {
        if (string.includes("mindboxDeviceUUID")) {
          const cookieArray = string.split("=");
          return cookieArray[1];
        }
      }
      return "";
    }

    getUserDevice(userAgent = "") {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return "mobile";
      } else {
        return "PC";
      }
    }

    pageVisitEvent({ mindboxDeviceUUID, browser, city, device, location, os, path, referrer, ip, country, state, latitude, longitude, source }) {
      mindbox("sync", {
        operation: "Sfpagevisit",
        data: {
          customer: {
            ids: {
              cookiemindbox: mindboxDeviceUUID,
              mindboxDeviceID: mindboxDeviceUUID,
            },
          },
          customerAction: {
            customFields: {
              browser,
              city,
              cookieMB: mindboxDeviceUUID,
              device,
              location,
              os,
              path,
              referrer,
              ip, // силами js получить нельзя.
              country,
              state,
              latitude,
              longitude,
              source,
            },
          },
        },
        onSuccess: function () {},
        onError: function (error) {},
      });
    }
  }

  function pageVisitReload(count = 0) {
    if (count < 5) {
      if ("mindbox" in window) {
        const pageVisit = new MindboxPageVisit();
        const cookie = pageVisit.getCookie(document.cookie);

        if (!cookie || cookie === "") {
          setTimeout(pageVisitReload, 1000, count);
        } else {
          pageVisit.init();
        }
      } else {
        setTimeout(pageVisitReload, 1000, count);
      }
    }
  }

  pageVisitReload();
}
(function () {


  function getCookie(cookieName) {

    let cookie = {};

    document.cookie.split(';').forEach(function(el) {
      let [key,value] = el.split('=');
      cookie[key.trim()] = value;
    })

    return cookie[cookieName];
  }

  function identifyMindboxStep1 (customerId) {
    // console.log("ID step 1");
    mindbox("sync", {
      operation: "Sfloginhard",
      data: {customer:{ids: {sfmagento: customerId}}},
      onSuccess: function() {identifyMindboxStep2(customerId)},
      onError: function(error) { console.log("Error on step 1: " + error.message); }
    });
  }

  function identifyMindboxStep2 (customerId) {
    // console.log("ID step 2");
    mindbox("sync", {
      operation: "Sfloginhard",
      data: {customer:{ids: {
            sfmagento: customerId,
            cookiemindbox: cookieMB
          }}},
      onSuccess: function() {identifyMindboxStep3(customerId)},
      onError: function(error) { console.log("Error on step 2: " + error.message); }
    });
  }

  function identifyMindboxStep3 (customerId) {
    // console.log("ID step 3");
    mindbox("sync", {
      operation: "Sfloginsoft",
      data: {customer:{ids: {
            sfmagento: customerId,
            cookiemindbox: cookieMB
          }}},
      onSuccess: function() { console.log("Successfully identified") },
      onError: function(error) { console.log("Error on step 3: " + error.message); }
    });
  }

  let cookieMB = getCookie("mindboxDeviceUUID")

  const $app = document.querySelector('#app');
  if($app) {
    sessionStorage.setItem('dataCustomerId', $app.attributes["data-customer"].value);
  }
  const mutationObserv = new MutationObserver((mutations,observer) => {
    for (const mutation of mutations) {
      if (mutation.target.attributes["data-customer"].value !== sessionStorage.getItem("dataCustomerId")) {
        // console.log("Identify tag loaded");
        var exponeaIdName = "magento_id";
        // console.log("exponeaIdName: " + exponeaIdName);

        var customerId = document.querySelector("#app").getAttribute("data-customer");
        // console.log("customerId: " + customerId);

        if (customerId) {
          // console.log("customerId true: " + customerId);
          // customerIds = {};
          // customerIds[exponeaIdName] = customerId;
          identifyMindboxStep1(customerId);
        }
      }

    }

  });

  const mutatorConfig = {
    attributes: true,
  };

  if ($app) mutationObserv.observe($app, mutatorConfig);

}());
(function () {
  function getDevice() {
    const devices = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini", "i");
    if (devices.test(navigator.userAgent)) {
      return "mobile";
    } else {
      return "PC";
    }
  }

  var userDeviceArray = [
    { device: "Android", platform: /Android/ },
    { device: "iPhone", platform: /iPhone/ },
    { device: "iPad", platform: /iPad/ },
    { device: "Symbian", platform: /Symbian/ },
    { device: "Windows Phone", platform: /Windows Phone/ },
    { device: "Tablet OS", platform: /Tablet OS/ },
    { device: "Linux", platform: /Linux/ },
    { device: "Windows", platform: /Windows NT/ },
    { device: "Macintosh", platform: /Macintosh/ },
  ];

  var platform = navigator.userAgent;

  function getPlatform() {
    for (var i in userDeviceArray) {
      if (userDeviceArray[i].platform.test(platform)) {
        return userDeviceArray[i].device;
      }
    }
    return "other" + platform;
  }
  function get_name_browser() {
    // получаем данные userAgent
    var ua = navigator.userAgent;
    // с помощью регулярок проверяем наличие текста,
    // соответствующие тому или иному браузеру
    if (ua.search(/Chrome/) > 0) return "Google Chrome";
    if (ua.search(/Firefox/) > 0) return "Firefox";
    if (ua.search(/Opera/) > 0) return "Opera";
    if (ua.search(/Safari/) > 0) return "Safari";
    if (ua.search(/MSIE/) > 0) return "Internet Explorer";
    // условий может быть и больше.
    // сейчас сделаны проверки только
    // для популярных браузеров
    return "other";
  }
  function getCookie(cookieName) {
    let cookie = {};
    document.cookie.split(";").forEach(function (el) {
      let [key, value] = el.split("=");
      cookie[key.trim()] = value;
    });
    return cookie[cookieName];
  }

  function acceptAgrListener() {
    let cookiemindbox = getCookie("mindboxDeviceUUID"),
      browser = get_name_browser(),
      location = window.location.href,
      os = getPlatform(),
      device = getDevice(),
      timestamp = Date.now();

    mindbox("async", {
      operation: "Sfconsent",
      data: {
        customer: {
          ids: {
            cookiemindbox,
          },
        },
        customerAction: {
          customFields: {
            browser,
            device,
            location,
            os,
            action: "accept",
            category: "cookie",
            timestamp,
            valid_until: "unlimited",
          },
        },
      },
      onSuccess: function () {},
      onError: function (error) {},
    });
  }
  function addAcceptAgreement($agreementBtn) {
    $agreementBtn.addEventListener("click", acceptAgrListener);
  }

  function init() {
    let $agreementBtn =
      document.querySelector("#cookie-notification-block button.cookie__button") || document.querySelector(".z-index--notification [role='button']");
    if ($agreementBtn) addAcceptAgreement($agreementBtn);
    else setTimeout(init, 500);
  }
  init();
})();
})();
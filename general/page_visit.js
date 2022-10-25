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
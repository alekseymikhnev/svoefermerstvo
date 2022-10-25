{
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
   * @param {Element} target
   */
  function getTargetSwapTab(target = null) {
    if (target) {
      let targetClasses = [...target.classList];
      targetClasses = targetClasses.join(".");
      const currentTab = document.querySelector(".credit__tabs ." + targetClasses);
      if (currentTab) {
        const activeValue = currentTab.querySelector(".nav-bar-content__item-value");
        if (activeValue) return activeValue.innerText;
      }
    } else return "";
  }

  function swapListener(event) {
    const cookiemindbox = getCookieMB(),
      browser = getUserBrowser(),
      device = getDeviceType(),
      location = document.location.href,
      os = getUserDevice(),
      action = getTargetSwapTab(event.target),
      params = {
        operationName: "Sfapplswitchtab",
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
            action,
            cookieMB: cookiemindbox,
          },
        },
      };
    sendMBEvent(params);
  }

  function init() {
    let $swappers = document.querySelectorAll(".credit__tabs .nav-bar-content__item");
    if ($swappers && $swappers.length) {
      $swappers = [...$swappers];
      for (const $swapper of $swappers) {
        $swapper.addEventListener("click", swapListener);
      }
    }
  }

  init();
}
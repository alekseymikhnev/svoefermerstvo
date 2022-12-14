if (!window.corporateCardInit) {
  window.corporateCardInit = true;
  let formIntersectingObserver = null;
  const browserArray = [
    { name: "Mozila", family: /mozila|firefox|fxios/i },
    { name: "Chrome", family: /chrome|chromium|crios/i },
    { name: "Safari", family: /safari/i },
    { name: "Opera", family: /opera|opr\//i },
    { name: "Edge", family: /edg/i },
  ];

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

  {
    /**
     * ?????????????????? ?????????????????????? ?????????????? ?? ?????????? ??????????
     * @param {Element.className|string} formClassName
     */
    const addEventListeners = (formClassName) => {
      const frm = document.querySelector(formClassName);

      if (frm) {
        const $submitBtn = document.querySelector(formClassName + " [type='submit']");
        $submitBtn.addEventListener("click", () => {
          trackClickEvent("submit - " + formClassName, "Sfonlineform");
          setTimeout(() => {
            addEventListeners(".credit-form-modal form.credit__form");
          }, 500);
        });

        for (let i = 0; i < frm.elements.length; i++) {
          const elm = frm.elements[i];

          if (elm.tagName === "INPUT") {
            elm.addEventListener(
              "click",
              (e) => {
                trackClickEvent(getFieldNm(e.target));
                console.debug("click", getFieldNm(e.target));
              },
              { once: true }
            );
          }
        }
      }
    };

    /**
     * ???????????????????? ???????????????????????? ???????? ??????????
     * @param {Element} fieldElm DOM ?????????????? ????????
     * @returns {string} ????????????????????????
     */
    const getFieldNm = (fieldElm) => {
      const parentElm = getParentFieldElm(fieldElm);
      if (parentElm) {
        const label = parentElm.querySelector("label");

        if (label) {
          return label.textContent;
        }

        return "unknown";
      }
    };

    /**
     * ???????????????????????? ?????????? ?????????????????????????? DOM ???????????????? ???????? ??????????
     * ???????????????? ?? ???????????????????????? ???????????? ???????????????? '__field'
     * @param {Element} target DOM ?????????????? ?????? ???????????????? ???????? ????????????????
     * @returns {*} ???????????????????? undefined ???????? ???????????????? ???? ????????????????????
     */
    const getParentFieldElm = (target) => {
      if (target && target.parentElement) {
        if (!target.parentElement.className.match(/(__field)|(--filled)/gm)) {
          return getParentFieldElm(target.parentElement);
        } else {
          return target.parentElement;
        }
      }
    };

    const trackClickEvent = (interaction, operation = "Sfforminput") => {
      const browser = getUserBrowser();
      const os = getUserDevice();
      const cookie = getCookieMB();
      const device = getDeviceType();
      const params = {
        operationName: operation,
        customer: {
          ids: {
            cookiemindbox: cookie,
          },
        },
        customerAction: {
          customFields: {
            browser,
            device,
            interaction,
            location: window.location.href,
            os,
            type: window.location.pathname.split("/")[2],
          },
        },
      };
      sendMBEvent(params);
    };

    function corporateCardScrollWatcher() {
      const browser = getUserBrowser();
      const os = getUserDevice();
      const cookie = getCookieMB();
      const device = getDeviceType();
      const params = {
        operationName: "Sfscroll",
        customer: {
          ids: {
            cookiemindbox: cookie,
          },
        },
        customerAction: {
          customFields: {
            browser,
            device,
            location: window.location.href,
            os,
          },
        },
      };
      sendMBEvent(params);
      if (formIntersectingObserver) formIntersectingObserver.disconnect();
    }

    const intersectingCallback = function ([entries]) {
      if (entries.isIntersecting) {
        corporateCardScrollWatcher();
      }
    };
    function scrollWatcher() {
      const options = {
        rootMargin: "0px",
        threshold: 0.5,
      };
      formIntersectingObserver = new IntersectionObserver(intersectingCallback, options);

      const $formBody = document.querySelector(".request__body .request__form");
      if ($formBody)
        //?????????? ?????????????????? ??????????????????????
        formIntersectingObserver.observe($formBody);
    }

    scrollWatcher();
    addEventListeners("form.credit__form");
  }
}
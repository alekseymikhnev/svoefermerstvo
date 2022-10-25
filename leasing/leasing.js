if (!window.liasingFormInit) {
  window.liasingFormInit = true;
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

  /**
   * @description форма с бегунками
   */
  {
    function sendEvent({ operation = "Sfforminput", interaction = "", type = window.location.pathname.split("/")[2] }) {
      const device = getDeviceType();
      const { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent } = prepareUrl();
      const os = getUserDevice();
      const browser = getUserBrowser();

      mindbox("async", {
        operation: operation,
        data: {
          customer: {
            ids: {
              cookiemindbox: getCookieMB(),
            },
          },
          customerAction: {
            customFields: {
              browser,
              device,
              interaction,
              location,
              utmsource,
              utmmedium,
              utmcampaign,
              utmterm,
              utmcontent,
              os,
              type,
            },
          },
        },
      });
    }

    function leasingSetListeners() {
      const $techPriceField = document.querySelector(".calculator__form-fields .custom-input"),
        $monthlyPayment = document.querySelector(".counting__block-value.counting__block-value_green"),
        $totalSum = document.querySelectorAll(".calculator__form-counting.counting .counting__block-value"),
        $btnSend = document.querySelector(".calculator__form .custom-button.custom-button_main"),
        $advanceFields = document.querySelector(
          ".calculator__form .calculator__form-range.calculator__form-range_double .calculator__form-range-top"
        ),
        $leaseTerm = document.querySelector(
          ".calculator__form .calculator__form-range:not(.calculator__form-range_double) .calculator__form-range-value"
        ),
        $spanAdvice = $advanceFields.children[1].querySelector("span");

      function techPriceListener() {
        sendEvent({ operation: "Sfforminput", interaction: "price" });
      }

      if ($techPriceField) {
        $techPriceField.removeEventListener("click", techPriceListener);
        $techPriceField.addEventListener("click", techPriceListener, {
          once: true,
        });
      }

      function getValue() {
        const resultObj = {};
        if ($techPriceField) {
          resultObj.price = $techPriceField.querySelector("input").value;
        }
        if ($monthlyPayment) {
          resultObj.monthlyPayment = $monthlyPayment.innerText;
        }
        if ($totalSum.length > 1) {
          resultObj.totalSum = $totalSum[1].innerText;
        }
        if ($advanceFields) {
          resultObj.advancePayment = $advanceFields.children[0].querySelector("span").innerText;
          resultObj.advancePercent = $advanceFields.children[1].querySelector("span").innerText;
        }
        if ($leaseTerm) {
          resultObj.leaseTerm = $leaseTerm.innerText;
        }

        return { ...resultObj, interaction: "online-form" };
      }

      const mutationObservAdvance = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            sendEvent({
              operation: "Sfforminput",
              interaction: "advance",
            });
            mutationObservAdvance.disconnect();
          }
        }
      });

      const mutatorConfig = {
        characterData: true,
        subtree: true,
      };
      const mutationObservTotal = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "characterData") {
            sendEvent({
              operation: "Sfforminput",
              interaction: "lease-term",
            });
            mutationObservTotal.disconnect();
          }
        }
      });

      /**
       * @description параметры для обзёрвера пересечения
       * @type {{rootMargin: string, threshold: number}}
       */
      const options = {
        rootMargin: "0px",
        threshold: 0.25,
      };
      const IntersectingCallback = function ([entries]) {
        if (entries.isIntersecting) {
          startMutantObserv();
        } else {
          cancelMutantObserv();
        }
      };
      const leasingFormObserver = new IntersectionObserver(IntersectingCallback, options);

      const $calculatorBody = document.querySelector(".calculator .calculator__body");
      //старт обзервера пересечения
      leasingFormObserver.observe($calculatorBody);

      function startMutantObserv() {
        if ($spanAdvice) mutationObservAdvance.observe($spanAdvice, mutatorConfig);

        if ($leaseTerm) mutationObservTotal.observe($leaseTerm, mutatorConfig);
      }

      function cancelMutantObserv() {
        if ($spanAdvice) mutationObservAdvance.disconnect();

        if ($leaseTerm) mutationObservTotal.disconnect();
      }

      function sendBtnListener() {
        const interaction = getValue();
        sendEvent({ operation: "form-input", interaction });
      }

      if ($btnSend) {
        $btnSend.removeEventListener("click", sendBtnListener);
        $btnSend.addEventListener("click", sendBtnListener);
      }

      function leasingScrollWatcher() {
        if (document.querySelector(".leasing section.calculator")) {
          const $sendRequestBlock = document.querySelector(".leasing section.calculator").getBoundingClientRect();
          if ($sendRequestBlock && $sendRequestBlock.y < 700) {
            sendEvent({ operation: "Sfscroll" });
            window.removeEventListener("scroll", leasingScrollWatcher);
          }
        }
      }

      window.addEventListener("scroll", leasingScrollWatcher);
    }

    function leasingSetTimer() {
      if (
        document.querySelector(".calculator__form-fields .custom-input") &&
        document.querySelector(".counting__block-value.counting__block-value_green") &&
        document.querySelectorAll(".calculator__form-counting.counting .counting__block-value") &&
        document.querySelector(".calculator__form .custom-button.custom-button_main") &&
        document.querySelector(".calculator__form .calculator__form-range.calculator__form-range_double .calculator__form-range-top") &&
        document.querySelector(".calculator__form .calculator__form-range:not(.calculator__form-range_double) .calculator__form-range-value")
      ) {
        leasingSetListeners();
      } else setTimeout(leasingSetTimer, 1000);
    }

    leasingSetTimer();
  }
  /**
   * @description форма с лизингом
   */

  {
    /**
     * Добавляет обработчики событий к полям формы
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
     * Определяет наименование поля формы
     * @param {Element} fieldElm DOM элемент поля
     * @returns {string} Наименование
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
     * Осуществляет поиск родительского DOM элемента поля формы
     * имеющего в наименовании класса значение '__field'
     * @param {Element} target DOM элемент для которого ищем родителя
     * @returns {*} Возвращает undefined если родителя не обнаружили
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
      const { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent } = prepareUrl();
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
            location,
            utmsource,
            utmmedium,
            utmcampaign,
            utmterm,
            utmcontent,
            os,
            type: window.location.pathname.split("/")[2],
          },
        },
      };
      sendMBEvent(params);
    };

    addEventListeners("form.credit__form");
  }
}
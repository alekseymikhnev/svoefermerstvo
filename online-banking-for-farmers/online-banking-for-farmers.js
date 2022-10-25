{
  const devices = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini", "i");
  let device = "";
  if (devices.test(navigator.userAgent)) {
    device = "mobile";
  } else {
    device = "PC";
  }

  let formIntersectingObserver = null;

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

  let userDeviceArray = [
    { device: "Android", platform: /Android/ },
    {
      device: "iPhone",
      platform: /iPhone/,
    },
    { device: "iPad", platform: /iPad/ },
    { device: "Symbian", platform: /Symbian/ },
    {
      device: "Windows Phone",
      platform: /Windows Phone/,
    },
    { device: "Tablet OS", platform: /Tablet OS/ },
    { device: "Linux", platform: /Linux/ },
    {
      device: "Windows",
      platform: /Windows NT/,
    },
    { device: "Macintosh", platform: /Macintosh/ },
  ];

  let platform = navigator.userAgent;

  function getPlatform() {
    for (let i in userDeviceArray) {
      if (userDeviceArray[i].platform.test(platform)) {
        return userDeviceArray[i].device;
      }
    }
    return "other" + platform;
  }

  function get_name_browser() {
    // получаем данные userAgent
    let ua = navigator.userAgent;
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

  function scrollCallBack([entries], className) {
    if (entries.isIntersecting) {
      trackClickEvent("scroll - " + className, "Sfscroll");
      formIntersectingObserver.disconnect();
    }
  }

  function scrollWatcher(target) {
    const options = {
      rootMargin: "0px",
      threshold: 0.5,
    };
    formIntersectingObserver = new IntersectionObserver((event) => scrollCallBack(event, target.className), options);

    if (target)
      //старт обзервера пересечения
      formIntersectingObserver.observe(target);
  }

  /**
   * Добавляет обработчики событий к полям формы
   * @param {Element.className|string} formClassName
   */
  const addEventListeners = (formClassName) => {
    const frm = document.querySelector(formClassName);
    if (frm) {
      scrollWatcher(frm);
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

  function trackClickEvent(interaction, field = "Sfforminput") {
    const browser = get_name_browser();
    const os = getPlatform();
    const cookie = getCookieMB();

    mindbox("async", {
      operation: field,
      data: {
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
            interaction,
            os,
          },
        },
      },
    });
  }

  addEventListeners("form.credit__form");
}
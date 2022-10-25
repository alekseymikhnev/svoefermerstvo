if (!window.creditFormInit) {
  window.creditFormInit = true;
  //-----------------------

  const devices = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini", "i");
  console.log("beginCredit");
  var device = "";
  if (devices.test(navigator.userAgent)) {
    device = "mobile";
  } else {
    device = "PC";
  }

  var userDeviceArray = [
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

  //-----------------------
  const trackedEvent = new Set();

  //список событий mindbox
  var eventOperationObject ={
    submit: 'Sfcreditform',
    scroll: 'Sfscroll'
  };


  var Visible = function (target, visibleHandler) {
    var headerHeight = document.querySelector('header.theme-header')?.offsetHeight || 0;
    // Все позиции элемента
    var targetPosition = {
          top: window.pageYOffset - headerHeight + target.getBoundingClientRect().top,
          bottom: window.pageYOffset - headerHeight + target.getBoundingClientRect().bottom
        },
        // Получаем позиции окна
        windowPosition = {
          top: window.pageYOffset,
          bottom: window.pageYOffset + document.documentElement.clientHeight
        };

    if (targetPosition.bottom > windowPosition.top &&
        targetPosition.top < windowPosition.bottom) {
      visibleHandler && visibleHandler();
    }
  };

  //переменная для записи скролхендлера что бы после срабатывания можно было удалить обработчик на скролл
  var scrollHandler;
  /**
   * Добавляет обработчики событий к полям формы
   * @param {Element.className|string} formClassName
   */
  const addEventListeners = (formClassName) => {
    const frm = document.querySelector(formClassName);

    if (frm) {
      frm.addEventListener("submit", () => {
        trackClickEvent("submit-" + formClassName);
      });

      window.addEventListener('scroll', scrollHandler = () =>{
        Visible (frm, () =>trackClickEvent("scroll-" + formClassName));
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
   * @param fieldElm DOM элемент поля
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
   * @param target DOM элемент для которого ищем родителя
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

  const trackClickEvent = (interaction, field = "form-input") => {
    if (trackedEvent.has(interaction)) {
      return;
    };

    let operation = 'Sfforminput'
    const event = interaction.split('-')?.[0];
    if (event && eventOperationObject.hasOwnProperty(event)) {
      operation = eventOperationObject[event]
    }

    mindbox("async", {
      operation: operation,
      data: {
        customer: {
          ids: {
            cookiemindbox: getCookie("mindboxDeviceUUID"),
          },
        },
        customerAction: {
          customFields: {
            browser: get_name_browser(),
            device: device,
            interaction: interaction,
            location: window.location.href,
            os: getPlatform(),
          },
        },
      },
      onSuccess: () => {
        trackedEvent.add(interaction);
        if(event === 'scroll'){
          window.removeEventListener('scroll', scrollHandler);
        }
      },
      onError: (error) => {},
    });
  };

  addEventListeners("form.credit__form");
}
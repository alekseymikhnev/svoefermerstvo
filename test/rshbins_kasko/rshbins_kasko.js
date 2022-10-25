if (!window.kaskoListenerInit) {
  window.kaskoListenerInit = true;
  const devices = new RegExp("Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini", "i");
  var device = "";
  if (devices.test(navigator.userAgent)) {
    device = "mobile";
  } else {
    device = "PC";
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

  let kaskoCookieMB = getCookie("mindboxDeviceUUID");

  function sendEvent({ operation = "Sfforminput", interaction = "", type = "" }) {
    mindbox("async", {
      operation: operation,
      data: {
        customer: {
          ids: {
            cookiemindbox: kaskoCookieMB,
          },
        },
        customerAction: {
          customFields: {
            browser: get_name_browser(),
            device: device,
            interaction,
            location: window.location.href,
            os: getPlatform(),
            type,
          },
        },
      },
    });
  }
  function kaskoSetListeners() {
    const $emailField = document.querySelector(".email-input"),
      $phoneField = document.querySelector(".phone-input"),
      $fioField = document.querySelector(".custom-input__field"),
      $commentField = document.querySelector(".custom-textarea"),
      $sendBtn = document.querySelector(".form__actions-btn");

    function emailListener() {
      sendEvent({ operation: "Sfforminput", interaction: "email" });
    }

    if ($emailField) {
      $emailField.removeEventListener("click", emailListener);
      $emailField.addEventListener("click", emailListener, { once: true });
    }

    function phoneListener() {
      sendEvent({ operation: "Sfforminput", interaction: "phone" });
    }

    if ($phoneField) {
      $phoneField.removeEventListener("click", phoneListener);
      $phoneField.addEventListener("click", phoneListener, { once: true });
    }

    function fioListener() {
      sendEvent({ operation: "Sfforminput", interaction: "name" });
    }

    if ($fioField) {
      $fioField.removeEventListener("click", fioListener);
      $fioField.addEventListener("click", fioListener, { once: true });
    }

    function commentListener() {
      sendEvent({ operation: "Sfforminput", interaction: "comment" });
    }

    if ($commentField) {
      $commentField.removeEventListener("click", commentListener);
      $commentField.addEventListener("click", commentListener, { once: true });
    }

    function sendBtnListener() {
      sendEvent({ operation: "Sfonlineform", interaction: "send", type: "kasko" });
    }

    if ($sendBtn) {
      $sendBtn.removeEventListener("click", sendBtnListener);
      $sendBtn.addEventListener("click", sendBtnListener);
    }
  }

  function kaskoScrollWatcher() {
    const $sendRequestBlock = document.querySelector(".send-request.kasko__section").getBoundingClientRect();
    if ($sendRequestBlock && $sendRequestBlock.y < 700) {
      sendEvent({ operation: "Sfscroll" });

      window.removeEventListener("scroll", kaskoScrollWatcher);
    }
  }

  window.addEventListener("scroll", kaskoScrollWatcher);

  function kaskoSetTimer() {
    setTimeout(() => {
      if (
        document.querySelector(".email-input") &&
        document.querySelector(".phone-input") &&
        document.querySelector(".custom-input__field") &&
        document.querySelector(".custom-textarea") &&
        document.querySelector(".form__actions-btn")
      ) {
        kaskoSetListeners();
      } else kaskoSetTimer();
    }, 1000);
  }

  kaskoSetTimer();
}
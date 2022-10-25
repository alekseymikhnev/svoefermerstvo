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
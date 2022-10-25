{
  function getCookie(cookieName) {
    let cookie = {};

    document.cookie.split(";").forEach(function (el) {
      let [key, value] = el.split("=");
      cookie[key.trim()] = value;
    });

    return cookie[cookieName];
  }

  function deviceDetection() {
    let device = "Other";
    if (navigator.userAgent.indexOf("Win") != -1) device = "PC/Laptop";
    if (navigator.userAgent.indexOf("Mac") != -1) device = "PC/Laptop";
    if (navigator.userAgent.indexOf("X11") != -1) device = "PC/Laptop";
    if (navigator.userAgent.indexOf("Linux") != -1) device = "PC/Laptop";
    if (navigator.userAgent.indexOf("Android") != -1) device = "Mobile";
    if (navigator.userAgent.indexOf("like Mac") != -1) device = "Mobile";

    return device;
  }

  function browserDetection() {
    let userAgent = navigator.userAgent;
    let browserName;

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "Other";
    }

    return browserName;
  }

  function osDetection() {
    let OS = "Other";
    if (navigator.userAgent.indexOf("Win") !== -1) OS = "Windows";
    if (navigator.userAgent.indexOf("Mac") !== -1) OS = "MacOS";
    if (navigator.userAgent.indexOf("X11") !== -1) OS = "UNIX";
    if (navigator.userAgent.indexOf("Linux") !== -1) OS = "Linux";
    if (navigator.userAgent.indexOf("Android") !== -1) OS = "Android";
    if (navigator.userAgent.indexOf("like Mac") !== -1) OS = "iOS";

    return OS;
  }

  function trackEventMB(interaction) {
    let cookieMB = getCookie("mindboxDeviceUUID");
    const browser = browserDetection();
    const device = deviceDetection();
    const location = window.location.href;
    const os = osDetection();
    const path = document.location.pathname;
    mindbox("async", {
      operation: "Sfpricerequest",
      data: {
        customer: { ids: { cookiemindbox: cookieMB } },
        customerAction: {
          customFields: {
            interaction: interaction,
            browser,
            device,
            location,
            os,
            path,
          },
        },
      },
    });
  }

  function addListener() {
    const $sendPotrebBtn = document.querySelector("#product div.product-seller-info__purchase button");
    if ($sendPotrebBtn)
      $sendPotrebBtn.addEventListener("click", () => {
        trackEventMB("click");
      });
  }

  addListener();
}
{
  const userOsArray = [
    { name: "Windows", family: /Win/ },
    { name: "MacOS", family: /Mac/ },
    { name: "UNIX", family: /X11/ },
    { name: "Linux", family: /Linux/ },
    { name: "Android", family: /Android/ },
    { name: "iOS", family: /like Mac/ },
  ];

  const userDeviceArray = [
    { name: "Android", family: /Android/ },
    { name: "iPhone", family: /iPhone/ },
    { name: "iPad", family: /iPad/ },
    { name: "iPod", family: /iPod/ },
    { name: "webOS", family: /webOS/ },
    { name: "IEMobile", family: /IEMobile/ },
    { name: "Opera Mini", family: /Opera Mini/ },
    { name: "BlackBerry", family: /BlackBerry/ },
    { name: "Symbian", family: /Symbian/ },
    { name: "Windows Phone", family: /Windows Phone/ },
    { name: "Tablet OS", family: /Tablet OS/ },
    { name: "Linux", family: /Linux/ },
    { name: "Windows", family: /Windows NT/ },
    { name: "Macintosh", family: /Macintosh/ },
  ];

  const browserArray = [
    { name: "Mozila", family: /mozila|firefox|fxios/i },
    { name: "Chrome", family: /chrome|chromium|crios/i },
    { name: "Safari", family: /safari/i },
    { name: "Opera", family: /Opera|opr\//i },
    { name: "Edge", family: /edg/i },
  ];

  /**
   *
   * @param {document.cookie|string} cookie
   * @return {string}
   */
  function getCookie(cookie = "") {
    const cookieArray = cookie.split(";");
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
   * @param {[{name:string, family: RegExp}]} list
   * @param {navigator.userAgent|string} userAgent
   * @return {string}
   */
  function getType(list, userAgent) {
    for (const browserListElement of list) {
      if (browserListElement.family.test(userAgent)) {
        return browserListElement.name;
      }
    }
    return userAgent;
  }

  /**
   *
   * @return {{os: string, cookie: string, browser: string, location: string, device: string}}
   */
  function prepareParams() {
    const os = getType(userOsArray, navigator.userAgent);
    const device = getType(userDeviceArray, navigator.userAgent);
    const browser = getType(browserArray, navigator.userAgent);
    const cookie = getCookie(document.cookie);
    const location = window.location.href;
    return { os, cookie, location, device, browser };
  }

  /**
   *
   * @param {'start'|'close'|'open'} action
   * @param {{os: string, cookie: string, browser: string, location: string, device: string}} params
   */
  function sendEvent(action, params) {
    mindbox("async", {
      operation: "Sfchatseller",
      data: {
        customer: {
          ids: {
            cookiemindbox: params.cookie,
          },
        },
        customerAction: {
          customFields: {
            browser: params.browser,
            cookieMB: params.cookie,
            device: params.device,
            location: params.location,
            os: params.os,
            INTERACTION: action,
          },
        },
      },
      onSuccess: function () {},
      onError: function (error) {},
    });
  }

  function checkChatExpand() {
    let expandFlag = false;
    const $miniChatContainer = document.querySelector(".mini-chat.mini-chat_wrapper-is-mounted");
    if ($miniChatContainer) {
      const classList = [...$miniChatContainer.classList];
      expandFlag = classList.includes("mini-chat_expand");
    }
    return expandFlag;
  }

  function toggleBtnListener() {
    const expandFlag = checkChatExpand();
    const params = prepareParams();
    sendEvent(expandFlag ? "close" : "open", params);
    setTimeout(addToggleBtnListener, 700);
  }

  function openBtnListener() {
    const params = prepareParams();
    sendEvent("start", params);
  }

  function addToggleBtnListener() {
    let $toggleBtn = document.querySelector(".mini-chat-header [class*='icon-thin-caret']");
    if ($toggleBtn) {
      $toggleBtn = $toggleBtn.parentElement;
      if ($toggleBtn) $toggleBtn.addEventListener("click", toggleBtnListener, { once: true });
    }
  }

  function init() {
    addToggleBtnListener();
    const $chatToolBar = document.querySelector(".chat-toolbar-grid_mini");
    const $openChatBtn = document.querySelector(".seller-deatails__actions_has-chat .chat-with-seller");
    if ($openChatBtn) $openChatBtn.addEventListener("click", openBtnListener);
    if ($chatToolBar) $chatToolBar.addEventListener("click", toggleBtnListener);
  }

  function reload() {
    if (document.querySelector(".seller-deatails__actions_has-chat .chat-with-seller")) {
      init();
    } else {
      setTimeout(reload, 1000);
    }
  }
  reload();
}
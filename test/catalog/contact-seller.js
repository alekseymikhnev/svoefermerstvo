{
  const userDeviceArray = [
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

  function getCookie(cookieName) {
    let cookie = {};
    document.cookie.split(";").forEach(function (el) {
      let [key, value] = el.split("=");
      cookie[key.trim()] = value;
    });
    return cookie[cookieName];
  }

  let cookieMB = getCookie("mindboxDeviceUUID");

  function getPlatform() {
    for (const userDeviceArrayElement of userDeviceArray) {
      if (userDeviceArrayElement.platform.test(navigator.userAgent)) {
        return userDeviceArrayElement.device;
      }
    }
    return navigator.userAgent;
  }

  function getDevice() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return "mobile";
    } else {
      return "PC";
    }
  }

  function contactSellerBtnEvent() {
    mindbox("async", {
      operation: "Sfcontactseller",
      data: {
        customer: { ids: { cookiemindbox: cookieMB } },
        customerAction: {
          customFields: {
            interaction: "click",
            browser: navigator.userAgent,
            device: getDevice(),
            location: window.location.href,
            os: getPlatform(),
          },
        },
      },
    });
  }

  function setEvent() {
    const $title = document.querySelectorAll(".seller-feedback .custom-input input")[1],
      $name = document.querySelector(".seller-feedback [name='contactFIO']"),
      $message = document.querySelector(".seller-feedback textarea"),
      $email = document.querySelector(".seller-feedback [name='email']"),
      $phone = document.querySelector(".seller-feedback .phone-container input"),
      $sendBtn = document.querySelector(".seller-feedback-modal .modal-dialog__bot-actions button");

    $sendBtn.addEventListener("click", function sendBtnListener() {
      if ($title.value && $message.value && $name.value && $email.value && $phone.value) {
        mindbox("async", {
          operation: "Sfcontactseller",
          data: {
            customer: { ids: { cookiemindbox: cookieMB } },
            customerAction: {
              customFields: {
                interaction: "send",
                browser: navigator.userAgent,
                device: getDevice(),
                location: window.location.href,
                os: getPlatform(),
                message: $message.value,
                title: $title.value,
                name: $name.value,
                email: $email.value,
                phone: $phone.value,
              },
            },
          },
        });
        $sendBtn.removeEventListener("click", sendBtnListener);
      }
    });
  }

  function setEventCatalog() {
    const $writeToSellerArray = [...document.querySelectorAll(".product-tile .write-to-seller")];

    if (!$writeToSellerArray.length) setTimeout(setEventCatalog, 1000);
    else
      for (const $writeToSellerArrayElement of $writeToSellerArray) {
        $writeToSellerArrayElement.addEventListener("click", contactSellerBtnEvent);
      }
  }

  function setTimer() {
    if (document.querySelector(".seller-feedback [name='contactFIO']")) {
      setEvent();
    } else
      setTimeout(() => {
        setTimer();
      }, 1000);
  }

  function productPageCase() {
    const $sendPotrebBtn = document.querySelector(
      "#product div.description-outer-grid__sidebar div.product-seller-info__seller-details .write-to-seller"
    );
    if ($sendPotrebBtn) $sendPotrebBtn.addEventListener("click", contactSellerBtnEvent);
    setTimer();
  }

  function otherPageCase() {
    const mutationObserv = new MutationObserver(setEventCatalog);
    const mutatorConfig = {
      childList: true,
    };
    const catalogBlock = document.querySelector(".catalog-block .product-listing");

    if (catalogBlock) mutationObserv.observe(catalogBlock, mutatorConfig);

    setTimer();
    setEventCatalog();
  }

  function init() {
    if (new RegExp(/svoefermerstvo\.ru\/product\//).test(window.location.href)) productPageCase();
    else if (
      new RegExp(/svoefermerstvo\.ru\/catalog\/root\/?/).test(window.location.href) ||
      new RegExp(/svoefermerstvo\.ru\/search-result\/?/).test(window.location.href)
    )
      otherPageCase();
  }
  init();
}
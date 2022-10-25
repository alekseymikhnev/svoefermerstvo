{
  /**
   *
   * @return {{$searchInput: null|String,
   * serialNum: null|String,
   * $productId:  null|String,
   * $productImgSrc:  null|String,
   * $units:  null|String,
   * $productDisc:  null|String,
   * $farmerName:  null|String,
   * $productPrice:  null|String}}
   */
  function getFieldsValue() {
    let $searchInput = document.querySelector(".theme-control--search-input input");
    if ($searchInput) $searchInput = $searchInput.value;

    let $productId = document.querySelector(".header-grid__top-wrap .header-grid__top-id");
    if ($productId) {
      $productId = $productId.innerText.split(":")[1];
      $productId = $productId.trim();
    }

    let $productPrice = document.querySelector(".product-price-details__price-final-text");
    if ($productPrice) $productPrice = $productPrice.innerText.replaceAll(/\D/g, "");

    let $productImgSrc = document.querySelector(".server-image img");
    if ($productImgSrc) $productImgSrc = $productImgSrc.src;

    let $productDisc = document.querySelector(".product-price-details__price-info .product-price-details__price-percent");
    if ($productDisc) $productDisc = $productDisc.innerText;

    let $units = document.querySelector(".product-description-sidebar__item .product-price-details__price-unit-measure span");
    if ($units) {
      $units = $units.innerText.replaceAll(/\w/g, "");
      $units = $units.trim();
    }

    let $farmerName = document.querySelector(".seller-deatails__info-list span a");
    if ($farmerName) $farmerName = $farmerName.innerText;

    const serialNum = window.pageProductMap ? window.pageProductMap[$productId] : "";

    return {
      $searchInput,
      $productId,
      $productPrice,
      $productImgSrc,
      $productDisc,
      $units,
      $farmerName,
      serialNum,
    };
  }

  function init() {
    if (new RegExp(/svoefermerstvo.ru\/product/).test(location.href) &&
      svoeFermerstvoHelpers) {
      const { $searchInput, $productId, $productPrice, $productImgSrc, $productDisc, $units, $farmerName, serialNum } = getFieldsValue();
      const { getDeviceType, getCookieMB, getGeolocation, getUserBrowser, getUserDevice, sendMBEvent, prepareUrl, replaceUrlSymbols } =
        svoeFermerstvoHelpers();
      const device = getDeviceType();
      const cookie = getCookieMB();
      const { location, utmsource, utmmedium, utmcampaign, utmterm, utmcontent } = prepareUrl();
      const path = window.location.pathname;
      const { latitude, longitude } = getGeolocation();
      const browser = getUserBrowser();
      const os = getUserDevice();
      const referrer = replaceUrlSymbols(document.referrer);
      const params = {
        operationName: "Sfsearchresultsview",
        customer: {
          ids: {
            cookiemindbox: cookie,
          },
        },
        customerAction: {
          customFields: {
            browser,
            cookieMB: cookie,
            device,
            location,
            os,
            path,
            referrer,
            latitude,
            longitude,
            utmsource,
            utmmedium,
            utmcampaign,
            utmterm,
            utmcontent,
            eventAction: $searchInput,
            productid: $productId,
            price: $productPrice,
            discount: $productDisc,
            farmername: $farmerName,
            units: $units,
            imglink: $productImgSrc,
            serialnum: serialNum,
          },
        },
      };
      sendMBEvent(params);
    }
  }

  init();
}
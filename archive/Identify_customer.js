(function () {


function getCookie(cookieName) {
    
    let cookie = {};

    document.cookie.split(';').forEach(function(el) {
        let [key,value] = el.split('=');
        cookie[key.trim()] = value;
    })
    
    return cookie[cookieName];
}

function identifyMindboxStep1 (customerId) {
    // console.log("ID step 1");
    mindbox("sync", {
        operation: "Sfloginhard",
        data: {customer:{ids: {sfmagento: customerId}}},
        onSuccess: function() {identifyMindboxStep2(customerId)},
        onError: function(error) { console.log("Error on step 1: " + error.message); }
    });
}

function identifyMindboxStep2 (customerId) {
    // console.log("ID step 2");
    mindbox("sync", {
        operation: "Sfloginhard",
        data: {customer:{ids: {
            sfmagento: customerId,
            cookiemindbox: cookieMB
        }}},
        onSuccess: function() {identifyMindboxStep3(customerId)},
        onError: function(error) { console.log("Error on step 2: " + error.message); }
    });
}

function identifyMindboxStep3 (customerId) {
    // console.log("ID step 3");
    mindbox("sync", {
        operation: "Sfloginsoft",
        data: {customer:{ids: {
            sfmagento: customerId,
            cookiemindbox: cookieMB
        }}},
        onSuccess: function() { console.log("Successfully identified") },
        onError: function(error) { console.log("Error on step 3: " + error.message); }
    });
}

let cookieMB = getCookie("mindboxDeviceUUID")

const $app = document.querySelector('#app');
if($app) {
    sessionStorage.setItem('dataCustomerId', $app.attributes["data-customer"].value);
}
const mutationObserv = new MutationObserver((mutations,observer) => {
    for (const mutation of mutations) {
        if (mutation.target.attributes["data-customer"].value !== sessionStorage.getItem("dataCustomerId")) {
            // console.log("Identify tag loaded");
            var exponeaIdName = "magento_id";
            // console.log("exponeaIdName: " + exponeaIdName);

                var customerId = document.querySelector("#app").getAttribute("data-customer");
            // console.log("customerId: " + customerId);

            if (customerId) {
                // console.log("customerId true: " + customerId);
                // customerIds = {};
                // customerIds[exponeaIdName] = customerId;
                identifyMindboxStep1(customerId);
            }
        }

    }
    
});

const mutatorConfig = {
    attributes: true,
};

if ($app) mutationObserv.observe($app, mutatorConfig);

}());

function toggleDebug() {
    var domain = window.location.hostname;
    var udflf = browser.storage.local.get("udflf") || {};
    if (udflf.length == 0) {
        udflf[domain] = {
            status: 1
        };
    }
    browser.storage.local.set({
        udflf: udflf
    });
}

browser.browserAction.onClicked.addListener(toggleDebug);
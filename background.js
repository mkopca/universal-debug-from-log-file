function callActionInContentScripts(actionName, param1) {
    var param1 = param1 || '';
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
            callAction: actionName,
            param1: param1
        });
    });
}

function onError(error) {
    callActionInContentScripts('error', error);
}

function log(message) {
    callActionInContentScripts('log', message);
}

function toggleDebug() {
    callActionInContentScripts('toggleDebug');
}

browser.browserAction.onClicked.addListener(toggleDebug);
/**
 * Addon read log file placed on the website server. Log file is a plain text, or can be a json formatted array of
 * many logs of different types.
 * Addon read and parse this log file. Then show humanized results.
 * Possible structure of json, if we want show some categorized results or if we want filter history records:
 * @todo
 *
 * Another functions of addon:
 * @todo
 *
 * @summary Extension read log file from the website server, parse it and show humanized results
 * author   mkopca
 * version  1.0
 * since    2017-02-14
 */

function getDebugElement(opened = false) {
    var height = 0;
    if (opened) {
        height = 48;
    }
    return "<div id='uniDebugContainer'><div id='uniDebug' style='height: " + height + "px;'>yeah</div></div>";
}

/* generic error handler */
function onError(error) {
    console.log(error);
}

function openDebug() {
    if (jQuery('#uniDebugContainer').length == 0) {
        jQuery('body').prepend(getDebugElement());
    }
    jQuery('#uniDebug').css({height: 48});
}

function closeDebug() {
    jQuery('#uniDebug').css({height: 0});
}

function toggleDebug() {
    var domain = window.location.hostname;
    var storagePromise = browser.storage.local.get(domain);
    storagePromise.then(function(result) {
        var domainSettings = result[0];
        if (!jQuery.isEmptyObject(domainSettings)) {
            domainSettings = domainSettings[domain];
            if (domainSettings.status == 1) {
                browser.storage.local.set({
                    [domain]: {
                        status: 0
                    }
                });
                closeDebug();
            } else {
                browser.storage.local.set({
                    [domain]: {
                        status: 1
                    }
                });
                openDebug();
            }
        } else {
            console.log('setting doesn\'t exist, we must create them.');
            // setting doesn't exist, we must create them.
            browser.storage.local.set({
                [domain]: {
                    status: 1
                }
            });
            openDebug();
        }
    }, onError);

}

function displayAllStorageSettings() {
    var allStorageSettings = browser.storage.local.get(null);
    allStorageSettings.then(function(values) {
        for (var k in values[0]) {
            console.log(k + ': ' + values[0][k]);
        };
    }, onError);
}

function clearAllStorageSettings() {
    browser.storage.local.clear();
}

function performRequestFromBackgroundScript(request, sender, sendResponse) {
    if (request.callAction !== undefined) {
        var actionName = request.callAction;
        switch (actionName) {
            case 'openDebug':
                openDebug();
                break;

            case 'closeDebug':
                closeDebug();
                break;

            case 'toggleDebug':
                toggleDebug();
                break;

            case 'error':
                onError(request.param1);
                break;

            case 'log':
                console.log(request.param1);
                break;

            default:
                onError('Undefined action: ' + actionName);
        }
    }
}
browser.runtime.onMessage.addListener(performRequestFromBackgroundScript);

jQuery(document).ready(function(){
    console.log('document ready');

    browser.storage.local.set({
        test: {
            status: 1
        }
    });

    // clearAllStorageSettings();
    // displayAllStorageSettings();

    var domain = window.location.hostname;
    var storagePromise = browser.storage.local.get(domain);
    storagePromise.then(function(result) {
        var domainSettings = result[0];
        if (!jQuery.isEmptyObject(domainSettings)) {
            domainSettings = domainSettings[domain];
            if (domainSettings.status == 1) {
                jQuery('body').prepend(getDebugElement(true));
            } else {
                jQuery('body').prepend(getDebugElement());
            }
        } else {
            jQuery('body').prepend(getDebugElement());
            console.log('setting doesn\'t exist, but we can\'t create them. It must be made after toggle button click');
        }
    }, onError).then(function() {
        jQuery('#uniDebug').resizable({
            handles: "n",
            containment: "body",
            resize: function( event, ui ) {
                ui.position.top = null;
            }
            // stop: function( event, ui ) {
            //
            // }
            // minHeight: 50,
            // ghost: true
        });
    });
});

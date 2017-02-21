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

var defaultDebugerHeight = 50;

function getDomainSettings(callback = null, param_1 = null, param_2 = null) {
    var domain = window.location.hostname;
    var storagePromise = browser.storage.local.get(domain);

    storagePromise.then(function(result) {
        var domainSettings = result[0];
        console.log(domainSettings);
        if (!jQuery.isEmptyObject(domainSettings)) {
            domainSettings = domainSettings[domain];
        } else {
            console.log('setting doesn\'t exist, we must create them.');
            // setting doesn't exist, we must create them.
            domainSettings = {
                status: 0,
                height: defaultDebugerHeight
            };
            browser.storage.local.set({
                [domain]: domainSettings
            });
        }
        if (callback !== null) {
            if (param_2 !== null) {
                window[callback](true, domainSettings, param_1, param_2);
            } else if (param_1 !== null) {
                window[callback](true, domainSettings, param_1);
            } else {
                window[callback](true, domainSettings);
            }
        }
    }, onError);
}

function setDomainSetting(callback = null, domainSettings = null, name = null, value = null) {
    if (callback === null) {
        getDomainSettings('setDomainSetting', name, value);
    } else {
        var domain = window.location.hostname;
        domainSettings[name] = value;
        browser.storage.local.set({
            [domain]: domainSettings
        });
    }
}

function getDebugElement(height = defaultDebugerHeight) {
    jQuery('body').css({
        marginBottom: height
    });
    return "<div id='uniDebugContainer' style='height: " + height + "px;'>yeah</div>";
}

function hookResizableEvent() {
    jQuery('#uniDebugContainer').resizable({
        handles: "n",
        //grid: defaultDebugerHeight,
        minHeight: defaultDebugerHeight,
        maxHeight: jQuery(),
        resize: function( event, ui ) {
            jQuery('body').css({
                marginBottom: ui.size.height
            });
            $(ui.originalElement).css('top', '');
        },
        stop: function( event, ui ) {
            // save new height
            setDomainSetting(null, null, 'height', ui.size.height);
        }
    });
}

/* generic error handler */
function onError(error) {
    console.log(error);
}

function openDebug() {
    if (jQuery('#uniDebugContainer').length == 0) {
        var domainSettings = getDomainSettings();
        jQuery('body').prepend(getDebugElement());
        hookResizableEvent();
    }
}

function closeDebug() {
    jQuery('#uniDebugContainer').remove();
    jQuery('body').css({
        marginBottom: ''
    })
}

function toggleDebug(callback = true, domainSettings = null) {
    if (callback === null) {
        getDomainSettings('toggleDebug');
    } else {
        if (domainSettings.status == 1) {
            setDomainSetting(null, null, 'status', 0);
            closeDebug();
        } else {
            setDomainSetting(null, null, 'status', 1);
            openDebug();
        }
    }
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

    // clearAllStorageSettings();
    // displayAllStorageSettings();

    var domain = window.location.hostname;
    var storagePromise = browser.storage.local.get(domain);
    storagePromise.then(function(result) {
        var domainSettings = result[0];
        if (!jQuery.isEmptyObject(domainSettings)) {
            domainSettings = domainSettings[domain];
            if (domainSettings.status == 1) {
                jQuery('body').prepend(getDebugElement(domainSettings.height));
                console.log(domainSettings);
            }
        } else {
            console.log('setting doesn\'t exist, but we can\'t create them. It must be made after toggle button click');
        }
    }, onError).then(function() {
        hookResizableEvent();
    });
});

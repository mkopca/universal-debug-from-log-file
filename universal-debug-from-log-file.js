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

var Udflf = {
    initialized: false,
    settings: {
        status: 0,
        height: defaultDebugerHeight,
        logUrl: '/tmp/logs/debug.log'
    }
}

function saveSetting(name = null, value = null) {
    var domain = window.location.hostname;
    Udflf.settings[name] = value;
    browser.storage.local.set({
        [domain]: Udflf.settings
    });
}

function getDebugElement(height = defaultDebugerHeight) {
    jQuery('body').css({
        marginBottom: Udflf.settings.height
    });
    return "<div id='uniDebugContainer' style='height: " + Udflf.settings.height + "px;'></div>";
}

function hookResizableEvent() {
    jQuery('#uniDebugContainer').resizable({
        handles: "n",
        //grid: defaultDebugerHeight,
        minHeight: defaultDebugerHeight,
        resize: function( event, ui ) {
            jQuery('body').css({
                marginBottom: ui.size.height
            });
            $(ui.originalElement).css('top', '');
        },
        stop: function( event, ui ) {
            // save new height
            saveSetting('height', ui.size.height);
        }
    });
}

/* generic error handler */
function onError(error) {
    console.log(error);
}

function absUrl(url) {
    console.log(location.protocol + '//' + window.location.hostname + url);
    return location.protocol + '//' + window.location.hostname + url;
}

function openDebug() {
    if (jQuery('#uniDebugContainer').length == 0) {
        jQuery('body').prepend(getDebugElement());
        // hookResizableEvent();
        // load content of log file
        jQuery.ajax({
            url: absUrl(Udflf.settings.logUrl),
            error: function(x, e, t) {
                jQuery('#uniDebugContainer').html('<div class="error">' + e + ': ' + (t.message ? t.message : t) + '</div>');
            }
        })
        .done(function(data) {
            // parse data
            data = data.split('>> ');
            jQuery('#uniDebugContainer').html('<div class="result">' + data[data.length - 1] + '</div>');
        });
    }
}

function closeDebug() {
    jQuery('#uniDebugContainer').remove();
    jQuery('body').css({
        marginBottom: ''
    })
}

function toggleDebug() {
    if (Udflf.initialized === false) {
        var domain = window.location.hostname;
        var storagePromise = browser.storage.local.get(domain);
        storagePromise.then(function(result) {
            var domainSettings = result[0];
            if (!jQuery.isEmptyObject(domainSettings)) {
                Udflf.settings = domainSettings[domain];
                Udflf.initialized = true;
                if (Udflf.settings.status == 1) {
                    saveSetting('status', 0);
                    closeDebug();
                } else {
                    saveSetting('status', 1);
                    openDebug();
                }
            }
        });
    } else {
        if (Udflf.settings.status == 1) {
            saveSetting('status', 0);
            closeDebug();
        } else {
            saveSetting('status', 1);
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
            Object.assign(Udflf.settings, domainSettings[domain]);
            Udflf.initialized = true;
            if (Udflf.settings.status == 1) {
                openDebug();
            }
        } else {
            console.log('setting doesn\'t exist, but we can\'t create them. It must be made after toggle button click');
        }
    }, onError).then(function() {
        hookResizableEvent();
    });
});

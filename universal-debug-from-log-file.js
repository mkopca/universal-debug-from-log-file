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

function startDebug() {
    jQuery('body').prepend("<div id='uniDebugContainer'>yeah</div>");
}

function endDebug() {
    jQuery('#uniDebugContainer').remove();
}

jQuery(document).ready(function(){
    var domain = window.location.hostname;
    var udflf = browser.storage.local.get("udflf");
    if (udflf.length != 0) {
        var domainSettings = udflf[domain];
        if (domainSettings.length != 0) {
            if (domainSettings.status == 1) {
                startDebug();
            }
        }
    }
});

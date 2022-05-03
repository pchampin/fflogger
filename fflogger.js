chrome.browserAction.onClicked.addListener(() => chrome.runtime.openOptionsPage());

chrome.webRequest.onResponseStarted.addListener(
    handleRequest,
    {
        "urls": ["*://*/*"],
    },
    ["responseHeaders"],
);

function handleRequest(details) {
    if (Math.floor(details.statusCode / 100) != 2) {
        return;
    }
    let clength = content_length(details);
    if (clength === 0) {
        return;
    }
    let timeStamp = details.timeStamp/1000;
    let bin = "" + Math.floor(timeStamp / 1000);
    let ctype = get_header(details, "content-type") || "application/octet-stream";
    let domain = (new URL(details.documentUrl || details.initiator || details.url)).host;
    let entry = {
        timeStamp: timeStamp,
        content_length: clength,
        content_type: ctype,
        domain: domain,
        fromCache: details.fromCache,
    };
    chrome.storage.local.get(["entries", bin], (result) => {
        if (typeof(result.entries) !== "object" || result.entries.version === undefined) {
            result.entries = {
                "version": [1, 5]
            }
        }
        if (result[bin] === undefined) {
            result[bin] = []
        }
        result.entries[bin] = true;
        result[bin].push(entry);
        chrome.storage.local.set(result);
    });
}

function get_header(details, header_name) {
    for (h of details.responseHeaders) {
        if (h.name.toLowerCase() == header_name.toLowerCase()) {
            return h.value;
        }
    }
}

function content_length(details) {
    let clength = get_header(details, "content-length");
    if (clength !== undefined) {
        clength = Number.parseInt(clength);
    }
    return clength;
}

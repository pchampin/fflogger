let h1 = document.querySelector("h1 > a");
let bDump = document.querySelector("button#dump");
let cbIncDom = document.querySelector("input#incDom");
let bClear = document.querySelector("button#clear");
let output = document.querySelector("#output");
let stat1 = document.querySelector("#stat1");
let stat2 = document.querySelector("#stat2");

// update page title with version number
chrome.management.getSelf((s) => {
    let version = s.version;
    h1.innerText += ` ${version}`;
});

// build statistics
let byCtype = {};
let byDomain = {};
forAllEntries((e) => { // callback
    ctype = (e.content_type || "application/octet-stream").split(';')[0].split(',')[0];
    let f = byCtype[ctype];
    if (f === undefined) {
        f = byCtype[ctype] = {
            count: 0,
        };
    }
    f.count += 1;

    let g = byDomain[e.domain];
    if (g === undefined) {
        g = byDomain[e.domain] = {
            count: 0,
        };
    }
    g.count += 1;
}, () => { // wrappup
    let table = document.createElement("table");
    byCtype = Object.entries(byCtype);
    // first sort by content-type
    byCtype.sort();
    // then sort by nb of requests
    byCtype.sort((a, b) => (b[1].count - a[1].count));
    // if the sort is stable, ex-aequos should still be sorted by content-type
    for ([ctype, req] of byCtype) {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        td1.innerText = ctype;
        let td2 = document.createElement("td");
        td2.innerText = req.count;
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
    }
    stat1.innerText = "";
    stat1.appendChild(table);

    table = document.createElement("table");
    byDomain = Object.entries(byDomain);
    byDomain.sort(); // see above (byCtype) why we sort twice
    byDomain.sort((a, b) => (b[1].count - a[1].count));
    for ([domain, req] of byDomain) {
        let tr = document.createElement("tr");
        let td1 = document.createElement("td");
        td1.innerText = domain;
        let td2 = document.createElement("td");
        td2.innerText = req.count;
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
    }
    stat2.innerText = "";
    stat2.appendChild(table);            
});


cbIncDom.checked = false;
output.value = "";
bDump.addEventListener('click', () => {
    let domain_alias = { "#": 0 };
    let buf = "";
    output.disabled = true;
    forAllEntries((e) => {// callback
        if (!cbIncDom.checked) {
            let alias = domain_alias[e.domain];
            if (alias === undefined) {
                alias = domain_alias[e.domain] = domain_alias['#'] += 1;
            }
            e.domain = ""+alias;
        }
        if (buf.length === 0) {
            buf += "[\n";
        } else {
            buf += ",\n";
        }
        buf += JSON.stringify(e);
        //output.value = buf;
    }, () => { // wrapup
        buf += "\n]\n";
        output.value = buf;
        output.disabled = false;
    });
});

const LABEL1 = "Clear database";
const LABEL2 = "Click again to confirm";
bClear.innerText = LABEL1;
bClear.addEventListener('click', () => {
    if (bClear.innerText === LABEL1) {
        bClear.innerText = LABEL2;
        bClear.disabled = true;
        setTimeout(() => { bClear.disabled = false }, 1000);
    } else {
        chrome.storage.local.get("entries", (result) => {
            let keys = Object.keys(result.entries);
            keys.push('entries');
            chrome.storage.local.remove(keys);
            bClear.innerText = LABEL1;
        });
    }
});


function forAllEntries(callback, wrapup) {
    let todo = 0;
    chrome.storage.local.get("entries", (root) => {
        if (root.entries === undefined) {
            root.entries = {};
        }
        let keys = Object.keys(root.entries);
        keys.forEach((bin) => {
            if (bin === "version") {
                return;
            }
            todo += 1;
            chrome.storage.local.get(bin, (result) => {
                console.log(bin, result);
                for (e of result[bin]) {
                    callback(e);
                }
                todo -= 1;
                if (todo === 0 && wrapup !== undefined) {
                    wrapup();
                }
            });
        });
        if (keys.length === 0 && wrapup !== undefined) {
            wrapup();
        }
    });
}

console.log("options.js loaded");


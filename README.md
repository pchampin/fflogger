Firefox logger
==============

Log all HTTP requests made by Firefox (or Chrome),
in order to determine how much of it is "document data" (HTML, CSS, images)
vs. "raw data" (JSON, XML, CSV...).

Usage
-----

See http://champin.net/2022/fflogger/


Developer
---------

The source of the extension should be portable across Firefox and Chrome
(it uses the compatibility layer of Firefox 'chrome' instead of 'browser').

To test the extension, you can use the following command line:

    web-ext -t chromium -t firefox-desktop


Useful links for developers
---------------------------

* https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension
* https://extensionworkshop.com/documentation/publish/package-your-extension/
* https://developer.mozilla.org/fr/docs/Mozilla/Add-ons/WebExtensions/API/webRequest

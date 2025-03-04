# chromium-crash-lighthouse-repro
Repository to reproduce chromium bug.

**Issue: Tab crashes almost everytime while using a Lighthouse flow**

Reproduction
------------

A VScode dev container has been included for easy reproduction.

To simulate the issue, please execute the lighthouse.mjs script using NodeJS (v20.18.1):
```
npm install
npm start (this will execute lighthouse.mjs)
```

Please note that the issue does not always occur (but it does most of the time), so it might not happen on the first try.


FYI
---

An example angular test project build output has been included in this project for easy reproduction.

The index file in [`example-angular-build-output/index.html`](./example-angular-build-output/index.html) contains a stylesheet link on line 169.
You'll notice that this code uses the following construction:
```
<link rel="stylesheet" href="styles.5729bce9535bfac6.css" media="print" onload="this.media='all'">
```
The last 2 attributes are placed there by default by the Angular builder as an optimization (`inlineCritical`, to improve First Contentful Paint,  enabled by default).
When we remove `media="print" onload="this.media='all'`, the chrome tab no longer crashes. So the issue only occurs in combination with these attributes.




© Vintia

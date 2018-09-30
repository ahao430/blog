# chrome插件开发

上家公司工作期间，尝试学习并开发了两款chrome插件，由于内网关系只在内部写了文章，现在重新总结一番。

## 背景知识

> [chrome官方教程](https://developer.chrome.com/extensions/getstarted)

> [360翻译文档](http://open.chrome.360.cn/extension_dev/overview.html)

### 项目结构

chrome插件包含以下结构：

1. mafiset.json

   扩展的配置文件。

   ```json
   {
     // 必须的字段
     "name": "My Extension",
     "version": "versionString",
     "manifest_version": 2, // 这个不能改
     // 建议提供的字段
     "description": "A plain text description",
     "icons": { ... },
     "default_locale": "en",
     // 多选一，或者都不提供
     "browser_action": {...},
     "page_action": {...},
     "theme": {...},
     "app": {...},
     // 根据需要提供
     "background": {...},
     "chrome_url_overrides": {...},
     "content_scripts": [...],
     "content_security_policy": "policyString",
     "file_browser_handlers": [...],
     "homepage_url": "http://path/to/homepage",
     "incognito": "spanning" or "split",
     "intents": {...}
     "key": "publicKey",
     "minimum_chrome_version": "versionString",
     "nacl_modules": [...],
     "offline_enabled": true,
     "omnibox": { "keyword": "aString" },
     "options_page": "aFile.html",
     "permissions": [...],
     "plugins": [...],
     "requirements": {...},
     "update_url": "http://path/to/updateInfo.xml",
     "web_accessible_resources": [...]
   }  
   ```

   其中，icons可设置扩展页面显示的图标；browser_action可设置浏览器右侧扩展图标及弹出popup页面；page_action可设置地址栏右侧图标；background为后台运行代码；content_scripts为注入到当前页面脚本；options_page设置配置页；web_accessible_resources设置要引用的js文件；permissions设置需要用到的权限。

2. content.js

   content.js中在当前页面运行，可修改当前页面。content的运行环境即是当前页面，可在控制台调试。

3. background.js

   background中的代码在后台持续运行。background的调试环境，要在浏览器扩展程序页面，点击当前扩展的背景页。可在background设置全局变量和公用函数。

4. popup

   popup是一个弹出页面，当用户点击扩展图标时，弹出popup.html，用户可进行交互操作。popup是一个独立的页面，有自己的环境，可直接在弹出页面右键打开控制台。

5. option

   配置页，可修改配置。option是一个独立的页面，有自己的环境，可右键打开控制台。

### API

1. chrome.extension.getBackgroundPage
2. chrome.storage
3. chrome.runtime.onMessage.addListener
4. chrome.contextMenus
5. chrome.tabs
6. chrome.notifications
7. chrome.browserAction

## 项目开发






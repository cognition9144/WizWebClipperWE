# WizWebClipperWE

本扩展移植自官方的 [为知笔记网页剪辑器](https://outgoing.prod.mozaws.net/v1/94ab1a96a93c91f35c1569d5c21614329a2da9a80ebb262637877d71707aa83e/https%3A//chrome.google.com/webstore/detail/wiznote-web-clipper/jfanfpmalehkemdiiebjljddhgojhfab)。在官方代码的基础上按照 [Extension Compatibility Test for Firefox](https://outgoing.prod.mozaws.net/v1/7130893d57a7c258f110af40a219184f725e5b8531856fed5e55ed29c4b4133a/https%3A//www.extensiontest.com/) 的提示手动作了些兼容性修改，功能基本全部可用。

除了升级部分库到各个官方最新版外，基本没有对官方代码做修改，部分功能由于 Chrome 与 Firefox 执行差异，无法总是正常运行。遇到异常（无法登录、剪辑无反应）有时再试一次就可以了。

仅修改了：

- 旧 API 替换为新 API
- 将 Chrome 专有 API 替换为 Browser Extension API
- 将 32x32 的图标添加到工具栏图标可用列表中
- 更新了 Angular.js 和 jQuery.js

若对代码有疑虑的，可在 GitHub 上[查看与官方版代码的差异](https://github.com/xcffl/WizWebClipperWE/commit/24eade62980940b8acd42489e99a1b498e1219f1)。

本扩展系移植自为知笔记的 [为知笔记网页剪辑器](https://outgoing.prod.mozaws.net/v1/94ab1a96a93c91f35c1569d5c21614329a2da9a80ebb262637877d71707aa83e/https%3A//chrome.google.com/webstore/detail/wiznote-web-clipper/jfanfpmalehkemdiiebjljddhgojhfab)。扩展于页面上的图标系依照 GPLv3 自[WizQTClient](https://addons.mozilla.org/) 使用。
**若有侵权则会删除**
const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");

const AngularBatarangPanel = Class({
  extends: Panel,
  name: "01",
  label: "AngularJS",
  tooltip: "Angular Batarang",
  icon: "./img/webstore-icon.png",
  url: "./panel.html",
  setup: function({debuggee}) {
    this.debuggee = debuggee;
  },
  dispose: function() {
    delete this.debuggee;
  },
  onReady: function() {
    this.debuggee.start();
    this.postMessage("RDP", [this.debuggee]);
  },
});
exports.AngularBatarangPanel = AngularBatarangPanel;


const angular = new Tool({
  panels: { angular: AngularBatarangPanel }
});

/************************************
  CONTENT SCRIPT
************************************/

var pageMod = require("sdk/page-mod");

var angularPageMod = pageMod.PageMod({
  include: "*",
  contentScriptFile: require("sdk/self").data.url("js/inject/debug.js"),
  contentScriptWhen: 'start',
  attachTo: ["existing", "top"],
  onAttach: function(worker) {
    console.log("attached to: " + worker.tab.url);
  }
});

/************************************
  SIDEBAR
************************************/

console.log("ASSIGNED TOOL ID", AngularBatarangPanel.prototype.id);

const {
  registerInspectorSidebar,
  unregisterInspectorSidebar
} = require("register-sidebar-addons");

function deactivateSidebar() {
  unregisterInspectorSidebar("angular-batarang");
}

function activateSidebar() {
  registerInspectorSidebar({
    id: "angular-batarang",
    label: "AngularJS",
    evaluatedJavascriptFun: function getAngularPanelContents() {
      console.log("DEBUG", $0, window.angular);
      if (window.angular && $0) {
        // TODO: can we move this scope export into
        // updateElementProperties
        var scope = window.angular.element($0).scope();
        // Export $scope to the console
        window.$scope = scope;
        return (function (scope) {
          var panelContents = {
            __private__: {}
          };

          for (prop in scope) {
            if (scope.hasOwnProperty(prop)) {
              if (prop.substr(0, 2) === '$$') {
                panelContents.__private__[prop] = scope[prop];
              } else {
                panelContents[prop] = scope[prop];
              }
            }
          }
          return panelContents;
        }(scope));
      } else {
        return {};
      }
    }
  });
}

/************************************************
  ENABLE/DISABLE SIDEBAR ON DEVTOOL PREF CHANGE
************************************************/

const prefName = "devtools." + AngularBatarangPanel.prototype.id + ".enabled";

let { get: getPref, set: setPref } = require("sdk/preferences/service");

let prefs = require("sdk/preferences/event-target").PrefsTarget({});

setPref(prefName, true);

activateSidebar();

prefs.on(prefName, onPrefChange);

function onPrefChange(name) {
  let enabled = getPref(name);
  console.log("DEVTOOLS ANGULAR TOGGLED", enabled);

  if (enabled) {
    activateSidebar();
  } else {
    deactivateSidebar();
  }
}

activateSidebar();

exports.onUnload = function() {
  deactivateSidebar();
  prefs.removeListener(prefName, onPrefChange);
};

const { Panel } = require("dev/panel");
const { Tool } = require("dev/toolbox");
const { Class } = require("sdk/core/heritage");

const self = require("sdk/self");

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
  SidebarVariablesViewTab
} = require("firefox-devtools-sidebars/inspector-sidebars");

const {
  SidebarTool
} = require("firefox-devtools-sidebars/toolbox");

var AngularDOMInspectorSidebarTab = Class({
  extends: SidebarVariablesViewTab,
  label: "Angular",
  DOMNodeScriptURL: self.data.url("./dom-node-script.js")
});

const angularSidebarTool = new SidebarTool({
  sidebars: { angular: AngularDOMInspectorSidebarTab }
});

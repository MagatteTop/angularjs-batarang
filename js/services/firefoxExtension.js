// devtools singleton: minimal wrapper to needed devtools addon
// helpers:
//  - devtools.eval(code,cb): eval javascript code in the inspected window
//  - devtools.watchRefresh(cb): set inspected window refresh handler
var devtools = {
  _activeTab: null,
  connect: function() {
    var self = this;
    return Task.spawn(function*() {
      var event = yield Task.waitForDOMEventListener(window, "message",  (evt) => {
        !!evt.ports && evt.data === "RDP"
      });
      var dbgPort = event.ports[0];
      var root = yield volcan.connect(dbgPort);
      var list = yield root.listTabs();
      var activeTab = list.tabs[list.selected];
      yield activeTab.attach();

      self._activeTab = activeTab;
    });
  },
  watchRefresh: function (cb) {
    var self = this;

    return Task.spawn(function*() {
      if (!self._activeTab) {
        yield self.connect();
      }

      if (cb && typeof cb === "function") {
        self._activeTab.addEventListener("tabNavigated", (evt) => {
          console.log("TAB NAVIGATED", evt);
          if (evt.state == "start") {
            cb();
          }
        });
      }
    });
  },
  eval: function (code, cb) {
    var self = this;

    return Task.spawn(function*() {
      if (!self._activeTab) {
        yield self.connect();
      }

      var reply = yield self._activeTab.consoleActor.evaluateJS(code, window.location.toString());
      var result = null;
      try {
        if (typeof reply.state.result == "string") {
          result = JSON.parse(reply.state.result);
         }
       } catch(e) {
         console.log("ERROR PARSING", reply.state.result, e);
         result = null;
       }

      if (cb && typeof cb === "function") {
        cb(result);
      }
    });
  },
};

// abstraction layer for Firefox Extension APIs
angular.module('panelApp').value('chromeExtension', {
  browserType: 'firefox',

  eval: function (fn, args, cb) {
    // with two args
    if (!cb && typeof args === 'function') {
      cb = args;
      args = {};
    } else if (!args) {
      args = {};
    }

    // NOTE: on Firefox we need to stringify the result of the
    // expression to be able to read it as json instead of
    // Mozilla "Remote Debugger Actors" instance
    devtools.eval('JSON.stringify(' +
      fn.toString() +
      '(window, ' +
      JSON.stringify(args) +
      '));', cb);
  },

  watchTargetTab: function (cb) {
    devtools.watchRefresh(cb);
  },

  sendRequest: function (requestName, cb) {
    console.error("sendRequest is deprecated and should not be used");
  }
});

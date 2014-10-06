function getAngularPanelContents() {
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

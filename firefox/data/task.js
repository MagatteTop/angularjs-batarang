/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function(exports) {
"use strict";

const spawn = (task, ...args) => {
  return new Promise((resolve, reject) => {
    try {
      const routine = task(...args);
      const raise = error => routine.throw(error);
      const step = data => {
        const { done, value } = routine.next(data);
        if (done)
          resolve(value);
        else
          Promise.resolve(value).then(step, raise);
      }
      step();
    } catch(error) {
      reject(error);
    }
  });
}
exports.spawn = spawn;

const waitForDOMEventListener = (target, type, capture, filter) => new Promise((resolve, reject) => {
  const listener = event => {
    if (typeof filter === "function" && !filter(event)) {
      // ignore events which doesn't match the filter
      return;
    }

    target.removeEventListener(type, listener, capture);
    resolve(event);
  };
  target.addEventListener(type, listener, capture);
});

exports.waitForDOMEventListener = waitForDOMEventListener;

})(Task = {});

/*
 * Copyright 2017 Banco Bilbao Vizcaya Argentaria, S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var BaseComponent = (function() {
'use strict';

  // Creates an object based in the HTML Element prototype
  var BaseComponentPrototype = Object.create(HTMLElement.prototype);

  BaseComponentPrototype.createdCallback = function() {

    this.model = {
      true: true
    };
    var promise = this.onCreated() || Promise.resolve();
    return promise.then(function () {
      this._rootElement = document.importNode(this.getTemplate().content, true);

      //Replace skin placeholder as rivets ignore style tags :-(
      var styles = this._rootElement.querySelectorAll('style');

      for(var i = 0; i < styles.length; i++) {
        var tag = styles[i];
        tag.innerText = tag.innerText.replace(/{skin}/, Utils.getSkin());
      }

      if(this.lightDOM) {
        this.appendChild(this._rootElement);
      } else {
        this.createShadowRoot();
        this.shadowRoot.appendChild(this._rootElement);
      }

      this.model.config = this.getAttribute('config') ? this.getAttribute('config') : this.model.config;
      this.__view = rivets.bind($(this.lightDOM ? this : this.shadowRoot), this.model);
      this.isReady = true;
      setTimeout(function () {
        this.dispatchEvent(new CustomEvent('component-ready', {bubbles: false}));
      }.bind(this));
    }.bind(this)).catch(function (err) {
      console.error(err);
    });
  };

  BaseComponentPrototype.getConfig = function() {
    var config = this.getAttribute('config');
    return config && JSON.parse(config);
  };

  BaseComponentPrototype.getModel = function() { return this.model; };
  BaseComponentPrototype.onCreated = function() {};
  BaseComponentPrototype.getTemplate = function() {
    throw 'getTemplate not implemented';
  };


  BaseComponentPrototype.attributeChangedCallback = function(
      attributeName, oldValue, newValue, namespace) {
    switch (attributeName) {
      case 'config':
        this.model.config = newValue;
        break;
    }
  };

  return BaseComponentPrototype;

})();

var MGComponent = function (spec) {
  if(MGComponent.cache[spec.name]) {
    console.error("Tag already defined " + spec.name);
    return;
  }
  MGComponent.cache[spec.name]= true;

  var thisDoc = (document._currentScript || document.currentScript).ownerDocument;
  var tmpl = thisDoc.querySelector('template');

  var parent = spec.parent || BaseComponent;
  var name = spec.name;

  var prototype = Object.assign(Object.create(parent), {
    getTemplate: function () {
      return tmpl;
    }
  },spec);

  return document.registerElement(name, {
    prototype: prototype
  });

};

MGComponent.cache = {};

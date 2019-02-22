'use babel';

import SystemVerilogSearch from './system-verilog-search';

export default class SystemverilogBrowserView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('systemverilog-browser');
    this.element.style.overflow = "auto";
    // this.element.scrollTop = this.element.offsetTop;

    // Create message element
    const message = document.createElement('div');
    var count = 0;
    message.classList.add('message');
    this.element.appendChild(message);
    this.subscriptions = atom.workspace.getCenter().observeActivePaneItem(item => {
      if (!atom.workspace.isTextEditor(item)) {
        message.innerText = 'Open a file to see important information about it.';
        return;
      }
      if(!(item.getRootScopeDescriptor() == '.source.systemverilog')){
        message.innerText = 'The file is not systemverilog.';
        message.innerHTML = `
          <h2>The file is not systemverilog</h2>
          <ul>
            <li><b>Works only with systemverilog.</b></li>
          </ul>
        ` ;
        return;
      }
      count = 0;
      this.updatePanel(message,item);
      item.onDidSave(() => { this.updatePanel(message,item); });
    });
  }

    updatePanel(message,item){
      message.innerHTML = ` `;
      var self = this;
      const titleElem = document.createElement('h2');
      titleElem.innerHTML = `<h2>Classes and it's children</h2>`;
      titleElem.addEventListener("click",function (event) {
        self.destroyVisibleMarkers(item);
      });
      message.appendChild(titleElem);

      self.getSVClasses(message,item,self);
      searchObj = new SystemVerilogSearch();
      console.log(searchObj);
      console.log(item);
      searchResult = searchObj.searchForClasses();
      // console.log(searchObj.searchForClasses(item,messsage,self));
    }

    destroyVisibleMarkers(item){
      markers = item.getMarkers();
      for (var i = 0; i < Object.keys(markers).length; i++) {
        markers[i].destroy();
      }
    }

    getSVClasses(message,item,self){

      var classStack = [];
      var endClassStack = [];
      item.scanInBufferRange(/\b(class)\s(\w*)(\sextends.*;|;)/g, item.buffer.getRange(), event => classStack.push([event.range,event.matchText]))
      item.scanInBufferRange(/\b(endclass.*)$/g, item.buffer.getRange(), event => endClassStack.push([event.range,event.matchText]))


      for (var i = 0; i < Object.keys(classStack).length; i++) {
        (function () {
          var funcId = i;
          const classElem = document.createElement('p');
          var firstRange = item.buffer.getRange();
          if (Object.keys(classStack).length !== Object.keys(endClassStack).length) {
              console.error("Different number of class ("+Object.keys(classStack).length+") directives then endclass("+Object.keys(endClassStack).length+") directives");
          } else {
            firstRange.start = classStack[i][0].start;
            firstRange.end = endClassStack[i][0].end;
          }
          classElem.innerHTML = `<span>&emsp;&#x25CF;<b>${classStack[funcId][1]}</b></span>`;
          classElem.addEventListener("click", function() {self.funcClick(message,item,self,classStack[funcId][0]); }, false);
          message.appendChild(classElem);
          self.getSVfunctions(message,item,self,firstRange);
        }());
      }
    }

    getSVfunctions(message,item,self,span){
      var functionStack = [];
      item.scanInBufferRange(/\b(function|task)\s(\w*\s\w*|\w*)/g, span, event => functionStack.push([event.range,event.matchText]))
      var numOfFun = Object.keys(functionStack).length;
      funcElem = [];
      for (var i = 0; i < numOfFun; i++) {
        (function () {
          var funcId = i;
          var funcString = functionStack[funcId][1];
          currentFunc = functionStack[funcId];
          funcElem = document.createElement('p');
          if(funcString.split(" ")[0] == 'task'){
            funcElem.innerHTML = `<span>&emsp;&emsp;<span style="color: orange">&#x25CF;</span><b style="color: orange">${functionStack[i][1]}</b></span>`;
          } else {
            funcElem.innerHTML = `<span>&emsp;&emsp;<span style="color: green">&#x25CF;</span><b style="color: green">${functionStack[i][1]}</b></span>`;
          }
          funcElem.addEventListener("click", function() {self.funcClick(message,item,self,functionStack[funcId][0]); }, false);
          message.appendChild(funcElem);
        }());
      }
    }

    funcClick(message,item,self,inputRange){
      self.destroyVisibleMarkers(item);
      item.scrollToScreenPosition(inputRange.start);
      marker = item.markBufferRange(inputRange);
      decoration = item.decorateMarker(marker, {type:'highlight',class:'find-result'});
    }

  // Returns an object that can be retrieved when package is activated
  // serialize() {}

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
      deserializer: 'systemverilog-browser/SystemverilogBrowserView'
    };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'SystemVerilog Browser';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://systemverilog-browser';
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

}

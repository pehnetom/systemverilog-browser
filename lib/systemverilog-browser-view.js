'use babel';

import SystemVerilogSearch from './system-verilog-search';

export default class SystemverilogBrowserView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('systemverilog-browser');
    this.element.style.overflow = "auto";
    this.searchObj = new SystemVerilogSearch();

    // Create message element
    const message = document.createElement('div');
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
      this.updatePanel(message,item);
      item.onDidSave(() => { this.updatePanel(message,item); });
    });
  }

    updatePanel(message,editor){
      message.innerHTML = ` `;
      var self = this;
      const titleElem = document.createElement('h2');
      titleElem.innerHTML = `<h2>SV Elements</h2>`;
      titleElem.style.cursor = "not-allowed";
      titleElem.addEventListener("click",function (event) {
        self.destroyVisibleMarkers(editor);
      });
      message.appendChild(titleElem);

      searchResult = this.searchObj.searchCurrentEditor();
      this.displayElements(editor,self,message,searchResult,1);
    }

    destroyVisibleMarkers(item){
      markers = item.getMarkers();
      for (var i = 0; i < Object.keys(markers).length; i++) {
        markers[i].destroy();
      }
    }

    displayElements(editor,self,parentElement,elementList,indent){
      for (var i = 0; i < Object.keys(elementList).length; i++) {
        (function () {
          var funcId = i;
          const localParent = document.createElement('div');
          const localLine = document.createElement('p');
          const localElem = document.createElement('span');
          const collapseElem = document.createElement('span');
          localElem.innerHTML = `<b>${elementList[funcId].displayString}</b>`;
          localElem.classList.add(elementList[funcId].type.colorClass);
          localElem.style.cursor = "pointer";
          localElem.addEventListener("click", function() { self.funcClick(parentElement,editor,self,elementList[funcId].startRange);}, false);
          localLine.addEventListener("mouseenter",function(){this.classList.add('selected');});
          localLine.addEventListener("mouseleave",function(){this.classList.remove('selected');});
          collapseElem.style.cursor = "pointer";
          if(Object.keys(elementList[funcId].elements).length > 0){
            collapseElem.innerHTML= `<span class="icon icon-chevron-down">`;
            collapseElem.addEventListener("click", function() {
              var content = this.parentElement;
              content = content.nextElementSibling;
              if (content.style.display === "none"){
                this.innerHTML= `<span class="icon icon-chevron-down"></span>`;
                this.style.paddingRight = "0px";
                content.style.display = "block";
              } else {
                this.innerHTML = `<span class="icon icon-chevron-right"></span>`;
                this.style.paddingRight = "0px";
                content.style.display = "none";
              }
            }, false);
          } else {
            collapseElem.innerHTML= `<span></span>`;
            collapseElem.style.paddingRight = "21px";
          }
          localLine.appendChild(collapseElem);
          localLine.appendChild(localElem);
          localParent.appendChild(localLine);
          localParent.style.paddingLeft = (indent*10).toString()+"px";
          if(Object.keys(elementList[funcId].elements).length > 0) {
            const childrenElem = document.createElement('div');
            self.displayElements(editor,self,childrenElem,elementList[funcId].elements,indent+1);
            localParent.appendChild(childrenElem);
          }
          parentElement.appendChild(localParent);
        }());
      }
    }

    funcClick(message,editor,self,jumpRange){
      self.destroyVisibleMarkers(editor);
      editor.scrollToScreenPosition(jumpRange.start);
      marker = editor.markBufferRange(jumpRange);
      decoration = editor.decorateMarker(marker, {type:'highlight',class:'highlighStyle2'});
      // decoration = item.decorateMarker(marker, {type:'highlight',class:'find-result'});
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
    // Used by Atom for tab texts
    return 'SystemVerilog Browser';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return 'atom://systemverilog-browser';c
  }

  getDefaultLocation() {
    // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
    // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'left';
  }

  getAllowedLocations() {
    // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }

}

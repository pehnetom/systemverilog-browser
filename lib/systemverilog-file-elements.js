'use babel';

import { Range } from 'atom';
import SystemVerilogType from './systemverilog-type';

export default class SystemVerilogCodeElem {

  constructor(startRange,endRange,textString,fileInfo){
    parsedFileInfo = fileInfo.match(/(?!\/)\w*(\.\w*|\w*)$/g)[0].split(".");
    this.fileName = parsedFileInfo[0]+"."+parsedFileInfo[1];
    this.fileExtension = parsedFileInfo[1];
    this.filePath = fileInfo;
    this.set(startRange,endRange,textString);
    this.elements = [];
    this.parent = null;
  }

  setEndRange(endRange){
    this.endRange = endRange;
    this.overallRange = new Range(this.startRange.start,endRange.end);
  }

  set(startRange,endRange,textString){
      this.fingerprint = this.hashCode(startRange.toString() + endRange.toString() + textString);
      this.wholeContent = textString;
      this.startRange = startRange;
      this.endRange = endRange;
      this.overallRange = new Range(startRange.start,endRange.end);
      this.type = new SystemVerilogType(textString);
      this.hardlink = "";
      this.symlink = "";

      filteredStr = textString.match(/(\b.*(?=\#)|\b.*(?=\()|\b.*$)/g);
      this.displayString = filteredStr[0];
      if (this.type.str == "import") {
        temp = textString.match(/\b(\w*)(?=::)/g);
        if(temp == null){
          this.symlink = textString;
        } else {
          this.symlink = temp[0];
        }
      } else if (this.type.str == "include") {
        temp = textString.match(/(?!")\w*\.\w*(?=")/g);
        this.hardlink = temp[0];
      }

  }

  hashCode(s) {
      for(var i = 0, h = 0xdeadbeef; i < s.length; i++)
          h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
      return (h ^ h >>> 16) >>> 0;
  };

  //
  compare(elem){
    stringId = elem.startRange.toString() + elem.endRange.toString() + elem.textString;
    this.testFingerprint = this.hashCode(stringId);
    return this.fingerprint == testFingerprint;
  }


  searchForType(desiredType,stack){
    if(this.type.id == this.type.hashCode(desiredType)){
      stack.push(this);
    }
    if(Object.keys(this.elements).length > 0){
      try {
        this.elements.forEach(function(element){
          element.searchForType(desiredType,stack)
        });
      } catch (e) {
        console.log(e);
        return stack;
      }
    }

    return stack;
  }
  searchForName(desiredName,stack){
    if(this.type.hashCode(this.displayString.split(" ")[1]) == this.type.hashCode(desiredName)){
      stack.push(this);
    }
    if(Object.keys(this.elements).length > 0){
      this.elements.forEach(function(element){
        element.searchForType(desiredName,stack)
      });
    }

    return stack;
  }
  fixParentsInTree(parent){
    this.parent = parent;
    self=this;
    this.elements.forEach(function(element){
      element.fixParentsInTree(self);
    });
  }

}

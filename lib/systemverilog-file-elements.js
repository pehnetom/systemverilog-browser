'use babel';

import { Range } from 'atom';
import SystemVerilogType from './systemverilog-type';

export default class SystemVerilogCodeElem {

  constructor(startRange,endRange,textString,typeString){
    this.set(startRange,endRange,textString,typeString);
    this.elements = [];
  }

  setEndRange(endRange){
    this.endRange = endRange;
    this.overallRange = new Range(this.startRange.start,endRange.end);
  }

  set(startRange,endRange,textString,typeString){
      stringId = startRange.toString() + endRange.toString() + textString;
      this.fingerprint = this.hashCode(stringId);
      this.startRange = startRange;
      this.endRange = endRange;
      this.overallRange = new Range(startRange.start,endRange.end);
      this.type = new SystemVerilogType(typeString);
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


}

'use babel';

export default class SystemVerilogType {

  constructor(s){
    switch (s) {
      case "class":
        this.str = "class";
        this.id = this.hashCode("class");
        this.border = 0;
        break;
      case "endclass":
        this.str = "class";
        this.id = this.hashCode("class");
        this.border = 1;
        break;
      case "function":
        this.str = "function";
        this.id = this.hashCode("function");
        this.border = 0;
        break;
      case "endfunction":
        this.str = "function";
        this.id = this.hashCode("function");
        this.border = 1;
        break;
      case "task":
        this.str = "task";
        this.id = this.hashCode("task");
        this.border = 0;
        break;
      case "endtask":
        this.str = "task";
        this.id = this.hashCode("task");
        this.border = 1;
        break;
      default: this.id = 0; break;
    }
  }

  strComp(s){
    if (s == this.str || s == "end"+this.str){
      return true;
    } else {
      return false;
    }
  }

  hashCode(s) {
      for(var i = 0, h = 0xdeadbeef; i < s.length; i++)
          h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
      return (h ^ h >>> 16) >>> 0;
  }

}

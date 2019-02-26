'use babel';

export default class SystemVerilogType {

  constructor(s){
    tempStr = s.split(" ");

    if (tempStr[0] == "virtual"){
      testStr = tempStr[1];
      this.virtual = 1;
    } else {
      testStr = tempStr[0];
      this.virtual = 0;
    }


    // interface

    switch (testStr) {
      case "interface":
        this.str = "interface";
        this.id = this.hashCode("interface");
        this.border = 0;
        break;
      case "endinterface":
        this.str = "interface";
        this.id = this.hashCode("interface");
        this.border = 1;
        break;
      case "covergroup":
        this.str = "covergroup";
        this.id = this.hashCode("covergroup");
        this.border = 0;
        break;
      case "endgroup":
        this.str = "covergroup";
        this.id = this.hashCode("covergroup");
        this.border = 1;
        break;
      case "module":
        this.str = "module";
        this.id = this.hashCode("module");
        this.border = 0;
        break;
      case "endmodule":
        this.str = "module";
        this.id = this.hashCode("module");
        this.border = 1;
        break;
      case "package":
        this.str = "package";
        this.id = this.hashCode("package");
        this.border = 0;
        break;
      case "endpackage":
        this.str = "package";
        this.id = this.hashCode("package");
        this.border = 1;
        break;
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
      case "svFile":
        this.str = "svFile";
        this.id = this.hashCode("svFile");
        this.border = 0;
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

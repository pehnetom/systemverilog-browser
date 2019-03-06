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

    this.withRange = 1;

    greyC = "text-subtle";
    whiteC = "text-highlight";
    blueC = "text-info";
    greenC = "text-success";
    orangeC= "text-warning";
    redC = "text-error";
    if(testStr.substr(0,8)=="include\""){
      testStr = "include";
    }

    switch (testStr) {
      case "import":
        this.withRange = 0;
        this.str = "import";
        this.id = this.hashCode("import");
        this.border = 1;
        this.colorClass = blueC;
        break;
      case "include":
        this.withRange = 0;
        this.str = "include";
        this.id = this.hashCode("include");
        this.border = 1;
        this.colorClass = greyC;
        break;
      case "interface":
        this.str = "interface";
        this.id = this.hashCode("interface");
        this.border = 0;
        this.colorClass = greenC;
        break;
      case "endinterface":
        this.str = "interface";
        this.id = this.hashCode("interface");
        this.border = 1;
        this.colorClass = greenC;
        break;
      case "covergroup":
        this.str = "covergroup";
        this.id = this.hashCode("covergroup");
        this.border = 0;
        this.colorClass = blueC;
        break;
      case "endgroup":
        this.str = "covergroup";
        this.id = this.hashCode("covergroup");
        this.border = 1;
        this.colorClass = blueC;
        break;
      case "module":
        this.str = "module";
        this.id = this.hashCode("module");
        this.border = 0;
        this.colorClass = greenC;
        break;
      case "endmodule":
        this.str = "module";
        this.id = this.hashCode("module");
        this.border = 1;
        this.colorClass = greenC;
        break;
      case "package":
        this.str = "package";
        this.id = this.hashCode("package");
        this.border = 0;
        this.colorClass = whiteC;
        break;
      case "endpackage":
        this.str = "package";
        this.id = this.hashCode("package");
        this.border = 1;
        this.colorClass = whiteC;
        break;
      case "class":
        this.str = "class";
        this.id = this.hashCode("class");
        this.border = 0;
        this.colorClass = blueC;
        break;
      case "endclass":
        this.str = "class";
        this.id = this.hashCode("class");
        this.border = 1;
        this.colorClass = blueC;
        break;
      case "function":
        this.str = "function";
        this.id = this.hashCode("function");
        this.border = 0;
        this.colorClass = blueC;
        break;
      case "endfunction":
        this.str = "function";
        this.id = this.hashCode("function");
        this.border = 1;
        this.colorClass = blueC;
        break;
      case "task":
        this.str = "task";
        this.id = this.hashCode("task");
        this.border = 0;
        this.colorClass = blueC;
        break;
      case "endtask":
        this.str = "task";
        this.id = this.hashCode("task");
        this.border = 1;
        this.colorClass = blueC;
        break;
      case "svFile":
        this.str = "svFile";
        this.id = this.hashCode("svFile");
        this.border = 0;
        this.colorClass = greyC;
        break;
      case "packages":
        this.str = "packages";
        this.id = this.hashCode("packages");
        this.border = 0;
        this.colorClass = greyC;
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

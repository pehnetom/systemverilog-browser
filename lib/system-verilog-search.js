'use babel';

import { Range, Directory } from 'atom';
import SystemVerilogCodeElem from './systemverilog-file-elements';
import SystemVerilogType from './systemverilog-type';

export default class SystemVerilogSearch {

    constructor(){}

    searchProject(){
      this.project = atom.project;
      console.log(this.project);
      console.log(this.project.getPaths());
      this.directories = [];
      paths = this.project.getPaths();
      for (var i = 0; i < Object.keys(this.project.getPaths()).length; i++) {
        this.directories.push(new Directory(paths[i]));
      }
      console.log(this.directories);
      this.directories.forEach(function (dir){
        console.log(dir.getEntriesSync());
      });
      console.log();
    }

    searchCurrentEditor(){
      this.editor = atom.workspace.getActiveTextEditor();
      this.commentRangesStack = this.searchForComments(this.editor);
      this.localElements = this.searchForFileElements(this.editor);
      return this.localElements;
    }

    searchElement(foundElementsStack,position){
      var currentParent = new SystemVerilogCodeElem(foundElementsStack[position][0],foundElementsStack[position][0],foundElementsStack[position][1]);
      position += 1;
      while(Object.keys(foundElementsStack).length > position){
        nextType = new SystemVerilogType(foundElementsStack[position][1]);
        if (nextType.border == 0){
          retVal = this.searchElement(foundElementsStack,position);
          currentParent.elements.push(retVal.currentElement);
          position = retVal.position;
        } else {
          currentParent.setEndRange(foundElementsStack[position][0]);
          position += 1;
          return {
              currentElement: currentParent,
              position: position
          };
        }
      }
      return {
          currentElement: currentParent,
          position: position
      };
    }

    searchForFileElements(file){
      var foundElementsStack = [];
      file.scanInBufferRange(/\b((class)\s(\w*)(\sextends.*;|\s;|;)|(endclass.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(function)\s(.*;|\s;|;)|(endfunction.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(task)\s(.*;|\s;|;)|(endtask.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(module)\s(.*(?=\())|(endmodule.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(interface)\s(.*;|\s;|;)|(endinterface.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(covergroup)\s(.*;|\s;|;)|(endgroup.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInBufferRange(/\b(.*(package)\s(.*;|\s;|;)|(endpackage.*)$)/g, file.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      foundElementsStack = foundElementsStack.sort((a,b) => a[0].start.row-b[0].start.row);
      this.commentRangesStack.forEach(function(comment) {
        foundElementsStack = foundElementsStack.filter(elem => !comment.containsRange(elem[0]));
      });
      foundElementsStack.unshift([new Range([[0,0],[0,0]]),"svFile"]);
      retVal = this.searchElement(foundElementsStack,0);
      parsedElements = retVal.currentElement.elements; // To get rid off svFile
      position = retVal.position;
      return parsedElements;
    }


    searchForComments(file){
      commentsLine = this.searchForLineComments(file);
      commentBlock = this.searchForBlockComments(file);
      comments = this.combineComments(commentsLine,commentBlock);
      return comments;
    }
    searchForLineComments(file){
      var commentStack = [];
      file.scanInBufferRange(/(?!^\s+)\/\/.*$/g, file.buffer.getRange(), event => commentStack.push(event.range))
      return commentStack;
    }

    searchForBlockComments(file){
      var startBlock = [];
      var endBlock = [];
      var blockStack = [];
      file.scanInBufferRange(/(?!^-+)\/\*.*(!\*|.*$)/g, file.buffer.getRange(), event => startBlock.push(event.range));
      file.scanInBufferRange(/(?!^-+)\*\//g, file.buffer.getRange(), event => endBlock.push(event.range));
      blockStack = this.createBlockComments(file,startBlock,endBlock);
      return blockStack;
    }

    createBlockComments(file,startBlock,endBlock){
      var loopCtrl = 0;
      blockStack = [];
      while (Object.keys(startBlock).length != 0) {
        if(Object.keys(endBlock).length == 0 && Object.keys(startBlock).length > 0){
          console.log("Adding the end of buffer to end block comment, unended block comment!");
          endBlock.push(file.buffer.getRange());
        }
        tempBlock = new Range(startBlock[0].start,endBlock[0].end);
        startBlock.splice(0,1);
        endBlock.splice(0,1);
        startBlock=startBlock.filter(start => !tempBlock.containsRange(start));
        blockStack.push(tempBlock);
        loopCtrl += 1;
        if (loopCtrl == 1000) {
          console.error("Infinite loop for getting block comments.");
          return blockStack;
        }
      }
      return blockStack;
    }

    combineComments(line,block){
      block.forEach(function(blk) {
        line = line.filter(lin => !blk.containsRange(lin));
      });
      comments = line.concat(block);
      comments = comments.sort((a,b) => a.start.row-b.start.row);
      return comments;
    }



}

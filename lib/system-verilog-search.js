'use babel';

import { Range } from 'atom';
import SystemVerilogCodeElem from './systemverilog-file-elements';
import SystemVerilogType from './systemverilog-type';

export default class SystemVerilogSearch {

    constructor(){}

    searchCurrentEditor(){
      this.editor = atom.workspace.getActiveTextEditor();
      this.commentRangesStack = this.searchForComments(this.editor);
      this.localElements = this.searchForFileElements();
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

    searchForFileElements(){
      var foundElementsStack = [];
      this.editor.scanInBufferRange(/\b((class)\s(\w*)(\sextends.*;|\s;|;)|(endclass.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(function)\s(.*;|\s;|;)|(endfunction.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(task)\s(.*;|\s;|;)|(endtask.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(module)\s(.*(?=\())|(endmodule.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(interface)\s(.*;|\s;|;)|(endinterface.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(covergroup)\s(.*;|\s;|;)|(endgroup.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(.*(package)\s(.*;|\s;|;)|(endpackage.*)$)/g, this.editor.buffer.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      foundElementsStack = foundElementsStack.sort((a,b) => a[0].start.row-b[0].start.row);
      foundElementsStack.unshift([new Range([[0,0],[0,0]]),"svFile"]);
      this.commentRangesStack.forEach(function(comment) {
        foundElementsStack = foundElementsStack.filter(elem => !comment.containsRange(elem[0]));
      });
      retVal = this.searchElement(foundElementsStack,0);
      parsedElements = retVal.currentElement.elements; // To get rid off svFile
      position = retVal.position;
      return parsedElements;
    }


    searchForComments(){
      commentsLine = this.searchForLineComments(this.editor);
      commentBlock = this.searchForBlockComments(this.editor);
      comments = this.combineComments(commentsLine,commentBlock);
      return comments;
    }
    searchForLineComments(){
      var commentStack = [];
      this.editor.scanInBufferRange(/(?!^\s+)\/\/.*$/g, this.editor.buffer.getRange(), event => commentStack.push(event.range))
      return commentStack;
    }

    searchForBlockComments(){
      var startBlock = [];
      var endBlock = [];
      var blockStack = [];
      this.editor.scanInBufferRange(/(?!^-+)\/\*.*(!\*|.*$)/g, this.editor.buffer.getRange(), event => startBlock.push(event.range));
      this.editor.scanInBufferRange(/(?!^-+)\*\//g, this.editor.buffer.getRange(), event => endBlock.push(event.range));
      blockStack = this.createBlockComments(startBlock,endBlock);
      return blockStack;
    }

    createBlockComments(startBlock,endBlock){
      var loopCtrl = 0;
      blockStack = [];
      while (Object.keys(startBlock).length != 0) {
        if(Object.keys(endBlock).length == 0 && Object.keys(startBlock).length > 0){
          console.log("Adding the end of buffer to end block comment, unended block comment!");
          endBlock.push(this.editor.buffer.getRange());
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

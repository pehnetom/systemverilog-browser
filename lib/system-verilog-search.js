'use babel';

import { Range } from 'atom';
import SystemVerilogCodeElem from './systemverilog-file-elements';

export default class SystemVerilogSearch {

    constructor(){}

    searchCurrentEditor(){
      this.editor = atom.workspace.getActiveTextEditor();
      this.commentRangesStack = this.searchForComments(this.editor);
      this.localClassStack = this.searchForClasses();
      this.localProcStack = [];
    }

    searchForClasses(){
      var startClassStack = [];
      var endClassStack = [];
      var classStack = [];
      this.editor.scanInBufferRange(/\b(class)\s(\w*)(\sextends.*;|\s;|;)/g, this.editor.buffer.getRange(), event => startClassStack.push([event.range,event.matchText]))
      this.editor.scanInBufferRange(/\b(endclass.*)$/g, this.editor.buffer.getRange(), event => endClassStack.push([event.range,event.matchText]))
      console.log(startClassStack);
      console.log(endClassStack);
      for (var i = 0; i < Object.keys(startClassStack).length; i++) {
        currentElem = new SystemVerilogCodeElem(startClassStack[i][0],endClassStack[i][0],startClassStack[i][1],"class");
        console.log(currentElem);
        // for (var j = 0; j < Object.keys(startClassStack).length; j++){
        //   if (j > i) {
        //
        //   } else {
        //
        //   }
        // }
        //
        //
        // if( i+1 < Object.keys(startClassStack).length ){
        //
        // }
        classStack.push(currentElem);
      }
      // console.log(currentClass);
      return [];
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
      this.editor.scanInBufferRange(/(?!^-+)\/\*!\*/g, this.editor.buffer.getRange(), event => startBlock.push(event.range));
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

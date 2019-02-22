'use babel';

import { Range } from 'atom';

export default class SystemVerilogSearch {

    constructor(){}

    searchForClasses(){
      editor = atom.workspace.getActiveTextEditor();
      commentRangesStack = this.searchForComments(editor);
    }

    searchForComments(editor){
      commentsLine = this.searchForLineComments(editor);
      commentBlock = this.searchForBlockComments(editor);
      comments = this.combineComments(commentsLine,commentBlock);
      return comments;
    }
    searchForLineComments(editor){
      var commentStack = [];
      editor.scanInBufferRange(/(?!^\s+)\/\/.*$/g, editor.buffer.getRange(), event => commentStack.push(event.range))
      return commentStack;
    }

    searchForBlockComments(editor){
      var startBlock = [];
      var endBlock = [];
      var blockStack = [];
      editor.scanInBufferRange(/(?!^-+)\/\*.*$/g, editor.buffer.getRange(), event => startBlock.push(event.range));
      editor.scanInBufferRange(/(?!^-+)\*\//g, editor.buffer.getRange(), event => endBlock.push(event.range));
      console.log(startBlock);
      console.log(endBlock);

      for (var i = 0; i <Object.keys(startBlock).length; i++) {
        
        // blockStack[i] = new Range(startBlock[i].start,endBlock[i].end);
        // blockStack[i].start = startBlock[i].start;
        // blockStack[i].end = endBlock[i].end;
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

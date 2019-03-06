'use babel';

import { Range, Directory, TextBuffer } from 'atom';
import SystemVerilogCodeElem from './systemverilog-file-elements';
import SystemVerilogType from './systemverilog-type';
import SystemVerilogProjectTree from './systemverilog-project-tree';

export default class SystemVerilogSearch {

    constructor(){}

    directorySearchSearching(currentDirectory,self){
      var foundFiles = [];

      try {
        var currentItems = currentDirectory.getEntriesSync();
      } catch (e) {
        console.log(e);
        return foundFiles;
      }

      currentItems.forEach(function(currentItem){
        if(currentItem.isFile() == true){
          currentFileStr = currentItem.path.match(/(?!\/)\w*(\.\w*|\w*)$/g)[0].split(".");
          if(currentFileStr[1]=="sv"||currentFileStr[1]=="svh"||currentFileStr[1]=="v"){
            foundFiles.push(self.searchBufferInPath(currentItem.path));
          }
        } else {
          retFiles = self.directorySearchSearching(currentItem,self);
          retFiles.forEach(function(retFile){foundFiles.push(retFile);});
        }
      });
      return foundFiles;
    }

    linkIncludes(tree,files){
      if(Array.isArray(tree)==true){
        tree.forEach(function(treeElement){

        });
      } else {

      }
    }

    searchProject(){
      this.project = atom.project;
      self = this;
      this.directories = [];
      paths = this.project.getPaths();
      for (var i = 0; i < Object.keys(this.project.getPaths()).length; i++) {
        this.directories.push(new Directory(paths[i]));
      }
      this.folderTree = [];
      this.directories.forEach(function (dir){
        dir.getEntriesSync().forEach(function (pathItem){
          if (pathItem.isFile() == true) {
            currentFileStr = pathItem.path.match(/(?!\/)\w*(\.\w*|\w*)$/g)[0].split(".");
            if(currentFileStr[1]=="sv"||currentFileStr[1]=="svh"||currentFileStr[1]=="v"){
              self.folderTree.push(self.searchBufferInPath(pathItem.path));
            }
          }
        });
      });
      testFiles = [];
      this.directories.forEach(function(directory){
        retFiles = self.directorySearchSearching(directory,self);
        retFiles.forEach(function(retFile){
          testFiles.push(retFile);
        });
      });
      packageTree = this.findElementsFromFolderTree("type","package",testFiles);
      // moduleStack = this.findElementsFromFolderTree("type","module",testFiles);
      // packageTree = this.findElementsFromFolderTree("type","package",this.folderTree);
      moduleStack = this.findElementsFromFolderTree("type","module",this.folderTree);

      testFiles.forEach(function(item){
        if(Object.keys(item).length !== 0){
          packageTree.forEach(function(packageItem){
            packageItem.elements.forEach(function(element){
              if(item[0].fileName==element.hardlink){
                item.forEach(function(subItem){
                  element.elements.push(subItem);
                });
              }
            });
          });
        }
      });

      modulesWithImports = [];
      moduleStack.forEach(function(item){
        var modImports = self.findElementsFromFolderTree("type","import",item);
        packageTree.forEach(function(packageFile){
          if(Array.isArray(packageFile)){
            packageFile.forEach(function(package){
              modImports.forEach(function(imports){
                retVal = self.findElementsFromFolderTree("name",imports.symlink,packageFile);
                retVal.forEach(function(val){
                  modulesWithImports.push(val);
                });
              });
            });
          }else{
            modImports.forEach(function(imports){
              retVal = self.findElementsFromFolderTree("name",imports.symlink,packageFile);
              retVal.forEach(function(val){
                val.elements.forEach(function(valElements){
                  imports.elements.push(valElements);
                });
              });
            });
          }
        });
        item.elements.forEach(function(itemElement){
          modImports.forEach(function(modImport){
            if(itemElement.fingerprint == modImport.fingerprint){
              itemElement.elements = modImport.elements;
            }
          });
        });
      });


      moduleStack.forEach(function(element){element.fixParentsInTree(null);});
      packageTree.forEach(function(element){element.fixParentsInTree(null);});

      if(Object.keys(moduleStack).length == 0){
        return packageTree;
      } else {
        return moduleStack;
      }

    }

    findElementsFromFolderTree(searchType,searchingFor,from){
      retStack = [];
      if(Array.isArray(from)){
        from.forEach(function(element){
          if(Array.isArray(element)){
            element.forEach(function(subElement){
              if (searchType == "type"){
                results = subElement.searchForType(searchingFor,[]);
              } else {
                results = subElement.searchForName(searchingFor,[]);
              }
              if(Object.keys(results).length >0){
                results.forEach(function(result){
                  retStack.push(result);
                });
              }
            });
          }else{
            if (searchType == "type"){
              results = element.searchForType(searchingFor,[]);
            } else {
              results = element.searchForName(searchingFor,[]);
            }
            if(Object.keys(results).length >0){
              results.forEach(function(result){
                retStack.push(result);
              });
            }
          }
        });
      } else {
        if (searchType == "type"){
          results = from.searchForType(searchingFor,[])
        } else {
          results = from.searchForName(searchingFor,[])
        }
        if(Object.keys(results).length >0){
          if(Array.isArray(results)){
            results.forEach(function(result){
              retStack.push(result);
            });
          }else{
            retStack.push(results);
          }
        }
      }
      return retStack;
    }

    searchCurrentEditor(){
      this.editor = atom.workspace.getActiveTextEditor();
      this.searchBufferInPath(this.editor.getPath());
      return this.localElements;
    }


    searchBufferInPath(path){
      buffer =  TextBuffer.loadSync(path);
      this.commentRangesStack = this.searchForComments(buffer);
      this.localElements = this.searchForFileElements(buffer);
      return this.localElements;
    }

    searchElement(foundElementsStack,position,svFileInfo){
      var currentParent = new SystemVerilogCodeElem(foundElementsStack[position][0],foundElementsStack[position][0],foundElementsStack[position][1],svFileInfo);
      position += 1;
      while(Object.keys(foundElementsStack).length > position){
        nextType = new SystemVerilogType(foundElementsStack[position][1]);
        if (nextType.border == 0){
          retVal = this.searchElement(foundElementsStack,position,svFileInfo);
          retVal.currentElement.parent = currentParent;
          currentParent.elements.push(retVal.currentElement);
          position = retVal.position;
        } else {
            if (nextType.withRange == 0) {
              var currentChild = new SystemVerilogCodeElem(foundElementsStack[position][0],foundElementsStack[position][0],foundElementsStack[position][1],svFileInfo);
              currentChild.parent = currentParent;
              currentParent.elements.push(currentChild);
              position += 1;
            } else {
              currentParent.setEndRange(foundElementsStack[position][0]);
              position += 1;
              return {
                  currentElement: currentParent,
                  position: position
              }
          }
        }
      }
      return {
          currentElement: currentParent,
          position: position
      };
    }

    searchForFileElements(file){
      var foundElementsStack = [];
      file.scanInRange(/\b((class)\s(\w*)(\sextends.*;|\s;|;)|(endclass.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((function)\s(.*;|\s;|;)|(endfunction.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((task)\s(.*;|\s;|;)|(endtask.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((module\s.*(?!;))|(endmodule.*))$/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((interface)\s(.*;|\s;|;)|(endinterface.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((covergroup)\s(.*;|\s;|;)|(endgroup.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/\b((package)\s(.*(?=;))|(endpackage.*)$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/(?!\b`)include.*$/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      file.scanInRange(/(?!\b`)import.*(?=;$)/g, file.getRange(), event => foundElementsStack.push([event.range,event.matchText]))
      foundElementsStack = foundElementsStack.sort((a,b) => a[0].start.row-b[0].start.row);
      this.commentRangesStack.forEach(function(comment) {
        foundElementsStack = foundElementsStack.filter(elem => !comment.containsRange(elem[0]));
      });
      foundElementsStack.unshift([new Range([[0,0],[0,0]]),"svFile "+file.getPath()]);
      retVal = this.searchElement(foundElementsStack,0,file.getPath());
      parsedElements = retVal.currentElement.elements; // To get rid off svFile
      parsedElements.forEach(function(element){
        element.parent = null;
      });
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
      file.scanInRange(/(?!^\s+)\/\/.*$/g, file.getRange(), event => commentStack.push(event.range))
      return commentStack;
    }

    searchForBlockComments(file){
      var startBlock = [];
      var endBlock = [];
      var blockStack = [];
      file.scanInRange(/(?!^-+)\/\*.*(!\*|.*$)/g, file.getRange(), event => startBlock.push(event.range));
      file.scanInRange(/(?!^-+)\*\//g, file.getRange(), event => endBlock.push(event.range));
      blockStack = this.createBlockComments(file,startBlock,endBlock);
      return blockStack;
    }

    createBlockComments(file,startBlock,endBlock){
      var loopCtrl = 0;
      blockStack = [];
      while (Object.keys(startBlock).length != 0) {
        if(Object.keys(endBlock).length == 0 && Object.keys(startBlock).length > 0){
          console.log("Adding the end of buffer to end block comment, unended block comment!");
          endBlock.push(file.getRange());
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

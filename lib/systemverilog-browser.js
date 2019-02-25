'use babel';

import SystemverilogBrowserView from './systemverilog-browser-view';
import { CompositeDisposable, Disposable } from 'atom';

export default {

  systemverilogBrowserView: null,
  subscriptions: null,

  activate(state) {
    this.systemverilogBrowserView = new SystemverilogBrowserView();
    this.subscriptions = new CompositeDisposable();
    // Add an opener for our view.
    this.subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri === 'atom://systemverilog-browser') {
        view = new SystemverilogBrowserView();
        return view;
      }
    }));


    // Destroy any ActiveEditorInfoViews when the package is deactivated.
    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof SystemverilogBrowserView) {
          item.destroy();
        }
      });
    }));

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {'systemverilog-browser:toggle': () => this.toggle()}));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.systemverilogBrowserView.destroy();
  },

  serialize() {
    return {
      systemverilogBrowserViewState: this.systemverilogBrowserView.serialize()
    };
  },

  copy(){
    return this;
  },

  deserializeSystemverilogBrowserView(serialized) {
    return new SystemverilogBrowserView();
  },

  toggle() {
    atom.workspace.toggle('atom://systemverilog-browser');
  }

};

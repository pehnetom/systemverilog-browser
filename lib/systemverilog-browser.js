'use babel';

import SystemverilogBrowserView from './systemverilog-browser-view';
import { CompositeDisposable, Disposable, Range} from 'atom';

export default {

  systemverilogBrowserView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://systemverilog-browser') {
          return new SystemverilogBrowserView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'systemverilog-browser:toggle': () => this.toggle()
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof SystemverilogBrowserView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.systemverilogBrowserView.destroy();
  },

  // serialize() {
  //   return {
  //     systemverilogBrowserViewState: this.systemverilogBrowserView.serialize()
  //   };
  // },

  deserializeSystemverilogBrowserView(serialized) {
    return new SystemverilogBrowserView();
  },

  toggle() {
    atom.workspace.toggle('atom://systemverilog-browser');
  }

};

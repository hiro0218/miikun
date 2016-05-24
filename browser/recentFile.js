var remote = require('electron').remote;
var app = remote.app;
var Menu = remote.require('electron').Menu;

// localStorage関連
module.exports = {
    set: function(value) {
        var fileList = this.getAll();

        // 未追加なら追加する
        if (!this._isExists(fileList, value)) {
            // 規定値超の履歴を削除
            if ( fileList.length >= STORAGE.RECENTFILES_MAX ) {
                fileList.splice(STORAGE.RECENTFILES_MAX - 1, fileList.length);
            }
            // 先頭に追加
            fileList.unshift(value);
        } else {
            // 追加済みなら先頭に移動
            fileList.splice(fileList.indexOf(value), 1);
            fileList.unshift(value);
        }

        // ローカルストレージに保存
        localStorage.setItem(STORAGE.RECENTFILES_KEY, JSON.stringify(fileList));

        // メニューバーを更新
        this.initMenu();
        var menu = Menu.buildFromTemplate(global.menuTemplate);
        Menu.setApplicationMenu(menu);
    },
    getAll: function() {
        var list = JSON.parse(localStorage.getItem(STORAGE.RECENTFILES_KEY));
        if (!list) {
            list = [];
        }
        return list;
    },
    deleteAll: function() {
        localStorage.removeItem(STORAGE.RECENTFILES_KEY);
    },
    // アプリ起動時
    initMenu: function() {
        var self = this;
        var fileList = this.getAll();
        var submenu = this._getRecentFileSubmenu();

        if (!fileList) {
            return;
        }

        // ローカルストレージに保存している一覧を追加
        fileList.forEach(function(value, index, array) {
            submenu.push(self._getMenuFunc(value));
        });
    },
    _getRecentFileSubmenu: function() {
        var tmp;

        // ファイルの「最近開いたファイル」を探索
        // →ファイル
        global.menuTemplate.forEach(function(value, index, array) {
            if (value.label === 'File') {
                tmp = value;
            }
        });
        // →最近開いたファイル
        tmp.submenu.forEach(function(value, index, array) {
            if (value.role === "recent") {
                // 最近開いたファイルのサブメニュー
                value.submenu = [];  // 初期化
                tmp = value.submenu;
            }
        });

        return tmp;
    },
    _isExists: function(array, value) {
        if (!array) {
            return false;
        }

        for (let i = 0, len = array.length; i < len; i++) {
            if (value == array[i]) {
                return true;  // 存在
            }
        }

        return false;  // 存在しない
    },
    _getMenuFunc: function(value) {
        return {
            label: value,
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    openFile(value);
                }
            }
        };
    },
};

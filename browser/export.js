var fs = require("fs");
var markdownpdf = require("markdown-pdf");

function exportPDF() {
    if (!global.app.$data.file.path) {
        return;
    }

    // ファイルが未保存の場合
    if (global.app.$data.file.modify) {
        // ファイルの保存確認をする
        var resp = chooseSave();

        // 保存されない場合は終了
        if (resp !== 0) {
            return;
        }

    }

    // 保存先を選択
    var savePath = dialog.showSaveDialog(FocusedWindow, {
        title: 'Save Dialog',
        filters: [
            {name: 'PDF file', extensions: ['pdf']},
        ],
    });

    // Markdown を PDF に変換する
    markdownpdf().from(global.app.$data.file.path).to(savePath, function(e) {
        openDialog("info", "converts Markdown files to PDF.");
    });

}

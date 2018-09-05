/**
 * @file 模板命令解析
 * @author mengke01(kekee000@gmail.com)
 */
const {join, dirname} = require('path');

function escapeReg(text) {
    return text.replace(/([$^/\?.\[\]\{\}\\])/g, '\\$1');
}

class Compiler {

    constructor(loader) {
        this.loader = loader;
        this.etplOptions = this.loader.etplOptions;
    }

    /**
     * 编译模板路径
     *
     * @param  {string} tplPath 模板路径
     * @param  {Object} engine  etpl engine
     * @return {Object} render object
     */
    compile(tplPath, engine) {
        if (engine.targets[tplPath]) {
            return engine.targets[tplPath];
        }
        let source = this.loader.loadFile(tplPath);
        return this.compileString(source, engine, tplPath);
    }

    /**
     * 编译模板字符串
     *
     * @param  {string} source 模板路径
     * @param  {Object} engine  etpl engine
     * @param  {string} tplPath 模板字符串路径
     * @return {Object} render object
     */
    compileString(source, engine, tplPath = '') {
        let deps = [];
        engine.compile(this.compileText(source, tplPath, deps));
        for (let i = 0; i < deps.length; i++) {
            let depPath = deps[i];
            if (!engine.targets[depPath]) {
                let depText = this.loader.loadFile(depPath);
                let compiledText = this.compileText(depText, depPath, deps);
                engine.compile(compiledText);
            }
        }
        return engine.targets[tplPath];
    }

    resolveTarget(targetPath, depPath) {
        // abs path
        let tplPath;
        if (!targetPath.startsWith('.')) {
            tplPath = targetPath;
        }
        else {
            tplPath = join(dirname(depPath), targetPath);
        }
        return this.loader.resolvePath(tplPath);
    }

    compileText(tplText, tplPath, deps) {
        let {commandOpen, commandClose} = this.etplOptions;
        let eso = escapeReg(commandOpen);
        let esc = escapeReg(commandClose);
        let hasTplTarget = false;
        // 如果已经存在 tpl target，则不检查@extend 命令，以兼容之前的版本
        let regTarget = new RegExp(eso + '\\s*target:\\s+' + escapeReg(tplPath) + '(?:\\s|\\(|' + esc + ')');
        if (regTarget.test(tplText)) {
            hasTplTarget = true;
        }
        else {
            // @extend 命令
            let regExtend = new RegExp(eso + '\\s*@extend:?\\s+(.+?)' + esc, 'g');
            tplText = tplText
                .replace(regExtend, ($1, targetPath) => {
                    hasTplTarget = true;
                    let depPath = this.resolveTarget(targetPath.trim(), tplPath);
                    deps.push(depPath);
                    return commandOpen + 'target:' + tplPath + '(master=' + depPath + ')' + commandClose;
                });
        }

        // @import 命令
        let regImport = new RegExp(eso + '\\s*@import:?\\s+(.+?)' + esc, 'g');
        tplText = tplText.replace(regImport, ($1, targetPath) => {
                let depPath = this.resolveTarget(targetPath.trim(), tplPath);
                deps.push(depPath);
                return commandOpen + 'import:' + depPath + commandClose;
            });

        // 没有tplPath命名的target，则需要生成一个默认的target
        if (!hasTplTarget) {
            tplText = commandOpen + 'target:' + tplPath + commandClose + tplText;
        }
        return tplText;
    }
}

module.exports = Compiler;

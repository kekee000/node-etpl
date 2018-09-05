/**
 * @file 模板命令解析
 * @author mengke01(kekee000@gmail.com)
 */
const {join, dirname} = require('path');

function escapeReg(text) {
    return text.replace(/([$^/\?.\[\]\{\}])/g, '\\$1');
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
     * @param  {string} tplPath 模板路径
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
        let regExtend = new RegExp(
            escapeReg(commandOpen)
            + '\\s*@extend:?\\s+(.+?)'
            + escapeReg(commandClose),
            'g'
        );
        let regImport = new RegExp(
            escapeReg(commandOpen)
            + '\\s*@import:?\\s+(.+?)'
            + escapeReg(commandClose),
            'g'
        );
        // 是否有按照文件命名的target，没有则需要生成一个默认的target
        let hasGlobalTarget = false;
        tplText = tplText
            .replace(regExtend, ($1, targetPath) => {
                hasGlobalTarget = true;
                let depPath = this.resolveTarget(targetPath.trim(), tplPath);
                deps.push(depPath);
                return commandOpen + 'target:' + tplPath + '(master=' + depPath + ')' + commandClose;
            })
            .replace(regImport, ($1, targetPath) => {
                let depPath = this.resolveTarget(targetPath.trim(), tplPath);
                deps.push(depPath);
                return commandOpen + 'import:' + depPath + commandClose;
            });
        if (!hasGlobalTarget) {
            tplText =  commandOpen + 'target:' + tplPath + commandClose
                + tplText;
        }
        return tplText;
    }
}

module.exports = Compiler;

/**
 * @file 预编译模板变量
 * @author mengke01(kekee000@gmail.com)
 */
const glob = require('glob');

module.exports = function (loader) {
    let match = '**/*' + (loader.ext.startsWith('.') ? '' : '.') + loader.ext;
    return new Promise((resolve, reject) => {
        glob(match, {cwd: loader.templateDir}, function (err, files) {
            if (err) {
                reject(err);
                return;
            }
            // read and compile files
            for (let tplPath of files) {
                loader.compiler.compile(tplPath, loader.engine);
            }
            resolve(true);
        });
    });
};

/**
 * @file node-etpl
 * @author mengke01(kekee000@gmail.com)
 */
const TplLoader = require('./lib/TplLoader');
const precompile = require('./lib/precompile');
let loader = null;

exports.TplLoader = TplLoader;

/**
 * 配置模板引擎
 *
 * @param  {Object} options options
 * @see  TplLoader constructor
 * @return {this}
 */
exports.configure = function (options) {
    if (!options.templateDir) {
        options.templateDir = process.cwd() + '/views';
    }
    loader = new TplLoader(options);
    return this;
};

/**
 * 渲染模板内容
 *
 * @public
 * @param  {string} tplName 模板名称
 * @param  {Object} data 模板数据
 * @return {string}
 */
exports.render = function (tplName, data) {
    if (!loader) {
        this.configure();
    }
    return loader.render(tplName, data);
};

/**
 * 渲染文本模板
 *
 * @public
 * @param  {string} source 模板内容
 * @param  {Object} data 模板数据
 * @param  {boolean} cacheable 是否可缓存默认false
 * @return {string}
 */
exports.renderString = function (source, data) {
    if (!loader) {
        this.configure();
    }
    return loader.renderString(source, data);
};

/**
 * 预编译模板集合，异步加载所有模板，需要判断是否预编译成功
 *
 * @return {Promise} 是否编译完成
 */
exports.precompile = function () {
    if (!loader) {
        this.configure();
    }
    if (!loader.cacheable) {
        return Promise.resolve(false);
    }
    return precompile(loader);
};

/**
 * @file 资源加载器
 * @author mengke01(kekee000@gmail.com)
 */
const path = require('path');
const fs = require('fs');
const etpl = require('etpl');
const Compiler = require('./Compiler');
const defaultFilters = require('./filters');

const etplOptions = {
    commandOpen: '{%',
    commandClose: '%}',
    variableOpen: '#{',
    variableClose: '}',
    strip: true
};

function createEngine(loader) {
    let engine = new etpl.Engine(loader.etplOptions);
    // 加载 filters
    let filters = defaultFilters;
    if (loader.filters) {
        filters = Object.assign({}, filters, loader.filters);
    }
    for (let filterName of Object.keys(filters)) {
        engine.addFilter(filterName, filters[filterName]);
    }
    return engine;
}

function getRenderer(tplName, engine, loader) {
    let tplPath = loader.resolvePath(tplName);
    if (engine.targets[tplPath]) {
        return engine.targets[tplPath].getRenderer();
    }
    return loader.compiler.compile(tplPath, engine).getRenderer();
}

class TplLoader {

    /**
     * tpl loader constructor
     *
     * @param  {Object} options 参数选项
     * @param  {string} options.baseDir 模板目录
     * @param  {boolean} options.cacheable 是否缓存编译后的模板
     * @param  {Object} options.filters 过滤器列表<string, function>
     * @param  {Object} options.etplOptions etpl参数配置
     */
    constructor(options) {
        this.baseDir = path.resolve(options.baseDir);
        this.ext = options.ext || '.tpl';
        if (null != options.filters && typeof options.filters === 'object') {
            this.filters = options.filters;
        }
        this.cacheable = null == options.cacheable ? true : !!options.cacheable;
        this.etplOptions = Object.assign({}, etplOptions, options.options);
        this.compiler = new Compiler(this);

        if (this.cacheable) {
            this.engine = createEngine(this);
        }
    }

    /**
     * 格式化tpl路径，增加ext等
     *
     * @param  {string} tplName 模板名称
     * @return {string}
     */
    resolvePath(tplName) {
        // 去除绝对路径
        if (tplName.indexOf('/') === 0) {
            tplName = tplName.replace(/^\/+/g, '');
        }
        // check ext
        if (!tplName.endsWith(this.ext)) {
            tplName += this.ext;
        }
        return tplName;
    }


    /**
     * 加载模板内容
     *
     * @param  {string} tplPath 模板相对路径
     * @return {string}
     */
    loadFile(tplPath) {
        tplPath = path.resolve(this.baseDir, tplPath);
        if (tplPath.indexOf(this.baseDir) !== 0) {
            throw new Error('tpl path out of range' + tplPath);
        }
        if (!fs.existsSync(tplPath)) {
            throw new Error('no tpl file ' + tplPath);
        }
        return fs.readFileSync(tplPath, 'utf-8');
    }

    /**
     * 渲染模板内容
     *
     * @public
     * @param  {string} tplName 模板名称
     * @param  {Object} data 模板数据
     * @return {string}
     */
    render(tplName, data) {
        let engine = this.cacheable ? this.engine : createEngine(this);
        let renderer = getRenderer(tplName, engine, this);
        return renderer(data);
    }

    /**
     * 渲染文本模板
     *
     * @public
     * @param  {string} source 模板内容
     * @param  {Object} data 模板数据
     * @param  {boolean} cacheable 是否可缓存默认false
     * @return {string}
     */
    renderString(source, data, cacheable = false) {
        let engine = cacheable ? this.engine : createEngine(this);
        let tplPath = '__node-etpl-tmp__';
        delete engine.targets[tplPath]; // 移除编译后的renderer，防止编译报错
        this.compiler.compileString(source, engine, tplPath);
        let renderer = engine.targets[tplPath].getRenderer();
        return renderer(data);
    }
}

module.exports = TplLoader;

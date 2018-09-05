/**
 * @file tplLoader spec
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const path = require('path');
const index = require('../index');

describe('index', function () {
    index.configure({
        baseDir: path.join(__dirname, './views')
    });


    it('getLoader', function () {
        let loader = index.getLoader();
        assert.ok(loader.baseDir, 'has baseDir');
        assert.ok(loader.ext === '.tpl', 'has ext');
        assert.ok(loader.cacheable === true, 'has cacheable');
        assert.ok(loader.compiler, 'has compiler');
        assert.ok(loader.engine, 'has engine');
    });

    it('render single tpl', function () {
        let result = index.render('common/base');
        assert.equal(result.trim(), 'base\nheader\nbody\nfooter', 'render result should ok');
        result = index.render('common/import', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('render string', function () {
        let result = index.renderString('#{name}', {name: 'etpl'});
        assert.equal(result.trim(), 'etpl', 'render result should ok');
        result = index.renderString('{%@import common/import%}', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('extend with import', function () {
        let result = index.render('page/extend-with-import', {name: 'etpl'});
        assert.equal(
            result.trim(),
            'base\n'
            + 'extend-with-import\n'
            + '<script>2</script>\n'
            + '<script>etpl</script>\n'
            + 'Hello etpl\n'
            + '<script>3</script>',
            'render result should ok'
        );
    });

    it('compile error', function () {
        try {
            index.render('common/compile-error');
            assert.ok(false, 'not to be hear');
        }
        catch (e) {
            assert.ok(e.message, 'no tplPath exists');
        }
    });

    it('render with command open close', function () {
        index.configure({
            baseDir: path.join(__dirname, './views'),
            cacheable: false,
            ext: '.etpl',
            options: {
                commandOpen: '<!--',
                commandClose: '-->'
            }
        });
        let result = index.render('command-open-close', {name: 'etpl'});
        assert.equal(
            result.trim(),
            '<script>etpl</script>\n1',
            'render result should ok'
        );
    });

    it('precompile', function (done) {
        index.configure({
            baseDir: path.join(__dirname, './views'),
            ext: '.etpl',
            options: {
                commandOpen: '<!--',
                commandClose: '-->'
            }
        });
        index.precompile().then(function (loader) {
            let targets = loader.engine.targets;
            assert.ok(targets, 'should exists targets');
            assert.ok(targets['command-open-close.etpl'], 'should exists targets');
            assert.ok(targets['common/import.etpl'], 'should exists targets');
            done();
        });
    });
});

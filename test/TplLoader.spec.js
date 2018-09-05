/**
 * @file tplLoader spec
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const path = require('path');
const TplLoader = require('../lib/TplLoader');

describe('TplLoader', function () {
    let loader = new TplLoader({
        baseDir: path.join(__dirname, './views')
    });

    it('render single tpl', function () {
        let result = loader.render('common/base');
        assert.equal(result.trim(), 'base\nheader\nbody\nfooter', 'render result should ok');
        result = loader.render('common/import', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('render string', function () {
        let result = loader.renderString('#{name}', {name: 'etpl'});
        assert.equal(result.trim(), 'etpl', 'render result should ok');
        result = loader.renderString('{%@import common/import%}', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('render extend tpl', function () {
        let result = loader.render('extend');
        assert.equal(result.trim(), 'base\nheader\nindex\nfooter', 'render result should ok');
    });

    it('multi import targets', function () {
        let result = loader.render('multi-import', {name: 'etpl'});
        assert.equal(
            result.trim(),
            '<script>etpl</script>\n'
            + '<script>etpl</script>\n'
            + '<script>etpl</script>\n'
            + '<script>etpl</script>',
            'render result should ok'
        );
    });

    it('import with import', function () {
        let result = loader.render('import-with-import', {name: 'etpl'});
        assert.equal(
            result.trim(),
            '<script>2</script>\n<script>etpl</script>',
            'render result should ok'
        );
    });

    it('extend with import', function () {
        let result = loader.render('page/extend-with-import', {name: 'etpl'});
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

    it('self defined tpl target', function () {
        let result = loader.render('common/import-3');
        assert.equal(
            result.trim(),
            '<script>3</script>',
            'render result should ok'
        );
    });

    it('tplPath error', function () {
        try {
            loader.render('common/no-exists');
            assert.ok(false, 'not to be hear');
        }
        catch (e) {
            assert.ok(e.message, 'no tplPath exists');
        }

        try {
            loader.renderString('{%@import common/no-exists%}');
            assert.ok(false, 'not to be hear');
        }
        catch (e) {
            assert.ok(e.message, 'no tplPath exists');
        }
    });

    it('compile error', function () {
        try {
            loader.render('common/compile-error');
            assert.ok(false, 'not to be hear');
        }
        catch (e) {
            assert.ok(e.message, 'no tplPath exists');
        }
    });

    it('loader with nocache', function () {
        let loader = new TplLoader({
            baseDir: path.join(__dirname, './views'),
            cacheable: false
        });
        let result = loader.render('page/extend-with-import', {name: 'etpl'});
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
        assert.ok(!loader.engine, 'no loader engine');
    });


    it('loader with command open close', function () {
        let loader = new TplLoader({
            baseDir: path.join(__dirname, './views'),
            cacheable: false,
            ext: '.etpl',
            options: {
                commandOpen: '<!--',
                commandClose: '-->'
            }
        });
        let result = loader.render('command-open-close', {name: 'etpl'});
        assert.equal(
            result.trim(),
            '<script>etpl</script>\n1',
            'render result should ok'
        );
    });
});

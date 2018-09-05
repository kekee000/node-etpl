/**
 * @file tplLoader spec
 * @author mengke01(kekee000@gmail.com)
 */
const assert = require('assert');
const path = require('path');
const TplLoader = require('../lib/TplLoader');

describe('TplLoader', function () {

    it('render single tpl', function () {
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });

        let result = loader.render('common/base');
        assert.equal(result.trim(), 'base\nheader\nbody\nfooter', 'render result should ok');
        result = loader.render('common/import', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('render str', function () {
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });

        let result = loader.renderString('#{name}', {name: 'etpl'});
        assert.equal(result.trim(), 'etpl', 'render result should ok');
        result = loader.renderString('{%@import common/import%}', {name: 'etpl'});
        assert.equal(result.trim(), '<script>etpl</script>', 'render result should ok');
    });

    it('render extend tpl', function () {
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });

        let result = loader.render('extend');
        assert.equal(result.trim(), 'base\nheader\nindex\nfooter', 'render result should ok');
    });

    it('multi import targets', function () {
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });

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
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });

        let result = loader.render('import-with-import', {name: 'etpl'});

        assert.equal(
            result.trim(),
            '<script>2</script>\n<script>etpl</script>',
            'render result should ok'
        );
    });

    it('extend with import', function () {
        let loader = new TplLoader({
            templateDir: path.join(__dirname, './views')
        });
        let result = loader.render('page/extend-with-import', {name: 'etpl'});
        assert.equal(
            result.trim(),
            'base\n'
            + 'extend-with-import\n'
            + '<script>2</script>\n'
            + '<script>etpl</script>\n'
            + 'Hello etpl\n'
            + 'footer',
            'render result should ok'
        );
    });

});

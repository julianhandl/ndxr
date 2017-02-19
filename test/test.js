var assert = require('assert')
var Catalog = require('../ndxr.js')

var cat = new Catalog([])

describe('ndxr', function() {
    describe('#get()', function() {
        it('should return [] when the value is not present', function() {
            assert.equal([], cat.get({bla: 'oasch'}))
        })
    })
})
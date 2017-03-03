var assert = require('assert')
var testData = require('./testData')
var Ndxr = require('../src/ndxr')
var Catalog = require('../src/catalog')
//var Provider = require('../src/provider')

var index = new Ndxr(testData)
var cat = Catalog.buildCatalog(index)
//var provider = Provider.buildProvider(index)

describe('Catalog', function () {
    describe('#buildCatalog()', function () {
        describe('#buildCatalog(ndxrInstance)', function () {
            it('should return a LinkedCatalog', function () {
                assert("LinkedCatalog", Catalog.buildCatalog({}).constructor.name)
            })
        })
    })
    describe('#get()', function() {
        describe('#get({})', function() {
            it('should return undefined when the value is empty', function() {
                var result = cat.get({})
                assert.equal(null, result)
            })
            it('should return undefined when the value is not matching', function() {
                var result = cat.get({firstname: 'Tamara'})
                assert.equal(null, result)
            })
            it('should return array of 1 object when one entry matches', function() {
                var result = cat.get({firstname: 'Alex'})
                assert.equal(1, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Alex", result[0].firstname)
            })
            it('should return array of 2 object when two entries match', function() {
                var result = cat.get({firstname: ['Alex','Thomas']})
                assert.equal(2, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Alex", result[0].firstname)
                assert.equal("Thomas", result[1].firstname)
            })
            it('should return array of 3 object when two entries match', function() {
                var result = cat.get({
                    firstname: ['Alex','Thomas','Markus'],
                    cars: { brand: ['Volkswagen','Renault','Peugeot']}
                })
                assert.equal(3, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Alex", result[0].firstname)
                assert.equal("Thomas", result[1].firstname)
                assert.equal("Markus", result[2].firstname)
            })
            it('should return array of 1 object when one child-object matches', function() {
                var result = cat.get({cars: {brand: 'Audi'}})
                assert.equal(1, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Alex", result[0].firstname)
            })
            it('should return array of 2 object when 2 child-objects match', function() {
                var result = cat.get({
                    cars: { built: function (val) {
                        return val < 2010
                    }}
                })
                assert.equal(2, result.length)
                assert.equal(true, Array.isArray(result))
            })
        })
        describe('#get([int])', function() {
            it('should return undefined when the value is empty', function() {
                var result = cat.get([])
                assert.equal(null, result)
            })
            it('should return array of objects with the matching id', function() {
                var result = cat.get([0,1])
                assert.equal(0, result[0].catalogId)
                assert.equal(1, result[1].catalogId)
            })
        })
        describe('#get(int)', function() {
            it('should return undefined when the value is empty', function() {
                var result = cat.get()
                assert.equal(null, result)
            })
            it('should return an object with the matching id', function() {
                var result = cat.get(0)
                assert.equal(0, result.catalogId)
            })
            it('should return undefined when the id is not matching', function() {
                var result = cat.get(-100)
                assert.equal(null, result)
            })
        })
    })
})

/*
describe('Provider', function () {
    describe('#buildProvider()', function () {
        describe('#buildProvider(ndxrInstance)', function () {
            it('should return a LinkedProvider', function () {
                assert("LinkedProvider", Provider.buildProvider({}).constructor.name)
            })
        })
    })
    describe('#get()', function() {
        describe('#get({})', function() {
            it('should return undefined when the value is empty', function() {
                assert.equal(undefined, provider.get())
                assert.equal(undefined, provider.get({}))
            })
            it('should return undefined when the value is not matching', function() {
                var result = provider.get({ name: true })
                assert.equal(undefined, result)
            })
            it('should return array of 1 object when one entry matches', function() {
                var result = provider.get({ firstname: true })
                assert.equal(3, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Alex", result[0].firstname)
            })
        })
    })
})
*/

describe('Ndxr', function() {

    describe('#add()', function() {
        describe('#add({})', function () {
            it('should do nothing when the value is empty', function() {
                index.add()
                var result = cat.get(0)
                assert.equal(0, result.catalogId)
            })
            it('should add the object to the index', function () {
                index.add({firstname: "Tamara", lastname: "Schreiber"})
                var result = cat.get({firstname: 'Tamara'})
                assert.equal(1, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Tamara", result[0].firstname)
                assert.equal("Schreiber", result[0].lastname)
            })
        })
        describe('#add([])', function () {
            it('should do nothing when the value is empty', function() {
                index.add([])
                var result = cat.get(0)
                assert.equal(0, result.catalogId)
            })
            it('should add the array of objects to the index', function () {
                index.add([
                    {firstname: "Michael", lastname: "Huber"},
                    {firstname: "Hannes", lastname: "Hauser"},
                    {firstname: "Robert", lastname: "Hauser"}
                ])
                var result = cat.get({firstname: ['Michael','Hannes','Robert']})
                assert.equal(3, result.length)
                assert.equal(true, Array.isArray(result))
                assert.equal("Michael", result[0].firstname)
                assert.equal("Huber", result[0].lastname)
                assert.equal("Hannes", result[1].firstname)
                assert.equal("Hauser", result[1].lastname)
            })
        })
    })
    describe('#remove()', function() {
        describe('#remove(int)', function () {
            it('should do nothing when the value is empty', function () {
                index.remove()
                var result = cat.get(0)
                assert.equal(0, result.catalogId)
            })
            it('should remove the object with the matching id', function () {
                let tamara = cat.get({firstname: "Tamara"})[0]
                index.remove(tamara.catalogId)
                var queryResult = cat.get({firstname: 'Tamara'})
                var IdResult = cat.get(tamara.catalogId)

                assert.equal(undefined, queryResult)
                assert.equal(undefined, IdResult)
            })
        })
        describe('#remove(array)', function () {
            it('should do nothing when the value is empty', function () {
                index.remove([])
                var result = cat.get(0)
                assert.equal(0, result.catalogId)
            })
            it('should remove the objects with the matching ids', function () {
                let ids = cat.get({firstname: ['Michael','Hannes','Robert']}).map(o => {
                    return o.catalogId
                })
                index.remove(ids)
                var queryResult = cat.get({firstname: ['Michael','Hannes','Robert']})
                var IdResult = cat.get(ids)

                assert.equal(undefined, queryResult)
                assert.equal(undefined, IdResult)
            })
        })
    })
})
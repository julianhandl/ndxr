var Catalog = require("./catalog.js").Catalog

let testObject = {
    test: "test",
    test2: {
        test3: "test3"
    }
}

let cat = new Catalog(testObject)
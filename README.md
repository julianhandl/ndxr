# NDXR - Indexer/Catalog

NDXR is an easy to use javascript indexer/catalog for the front- and backend.
It's lightning fast and can be queried really easy.

## Install

### npm
```npm install ndxr```

### file download
Just use the ndxr.js from the dist folder of this project

## Usage

### Initialize

```Javascript
import Catalog from "ndxr"

let catalog = new Catalog()
```

### Index Data

You can pass a list of Objects on the initialisation and it will be indexed right away.
```Javascript
let catalog = new Catalog([{},{}])
```

You can also add objects to an existing catalog
```Javascript
catalog.add({})
```
or
```Javascript
catalog.add([{},{}])
```

### Query Data

You can query the catalog by passing an object or a number to the get function.
If you pass an object the catalog will search for matching objects in the index.
If you pass a number you will receive the object with the given catalog id.

Imagine we have already indexed this data:
```Javascript
[
    {
        name: "Alex",
        age: 29,
        gender: "male",
        cameras : [
            {
                brand: "Canon",
                name: "EOS 5D Mk 2",
                megapixels: 22
            },
            {
                brand: "Sony",
                name: "Alpha 7R Mk 2",
                megapixels: 40
            }
        ]
    },
    {
        name: "Tom",
        age: 35,
        gender: "male",
        cameras: [
            {
                brand: "Canon",
                name: "EOS 550D",
                megapixel: 16
            }
        ]
    },
    ...
]
```

Now we can make a query on that data like:
```Javascript
catalog.get({
    name: "Alex"
})
```

This will simply give you the first Object.

Lets search for object with contain Canon cameras
```Javascript
catalog.get({
    cameras: {
        brand: "Canon"
    }
})
```

This will give you Alex and Tom.

What if we want all males that have an age above 30:
```Javascript
catalog.get({
    gender: "male",
    age: function(value){ return value > 30 }
})
```

This will give you Tom.

You see you can combine this in any way and nested as deep as you want.
Even with deep nested objects it will be lightning fast because everything is indexed and we just perform a quick lookup.

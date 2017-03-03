# NDXR - Indexer/Catalog

NDXR is a modular Indexer that can be queried really easy and fast.
This package contains multiple tools that are described below.
First we start with the installation.

## Install

### npm
```npm install ndxr```

### file download
Just use the dist folder of this project

## Modules

### NDXR
This is the heart of this package. The index holds all your data and
provides it to the other modules. You can only ```add``` and ```remove```
data to your index.
Learn how to use it in the ```Usage``` section.

### Catalog
The catalog received all the data from the index. It can not add or remove
data, it can only ```get`` data through queries from the index. A query
acts like a search and is really fast.

### Provider
```The provider is not yet done```
The provider acts similar to the catalog with the difference that it does
not search but query the whole index and can give you results like a
```GraphQL``` query.

## Usage

### NDXR

#### Initialize
First you need to import Ndxr.
Then you create a new Ndxr instance and pass it your initial data.
This has to be an array with object of your data.
```Javascript
import Ndxr from "ndxr"

let index = new Ndxr([{}])
```

#### .add()
This lets you add data to your index.
.add() receives either a single object or an array of objects
that should be added.
```Javascript
index.add({})

index.add([{},{}])
```

#### .remove()
This lets your remove data from your index.
Whenever you make a query with the catalog you will receive a
```indexId``` for each object you receive. This is the id of the datanode
in the index.

To remove data from you index you have to pass one indexId or
an array of indexIds to the .remove() method.

```Javascript
index.remove(0)

index.remove([0,1,2])
```


### Catalog

#### Initialize
The catalog module provides a only class method that are purely functional.
So you can either do a query right there through a class method like:

```Javascript
import {Catalog} from "ndxr"

let result = Catalog.get(getter, indexInstance)
```

Or you can build a ```LinkedCatalog``` like:

```Javascript
import {Catalog} from "ndxr"

let catalog = Catalog.buildCatalog(indexInstance)
let result = catalog.get(getter)
```

#### Catalog.buildCatalog(indexInstance)
This method receives an instance of ```Ndxr``` and returns a new instance
of a ```LinkedCatalog``` which supports only the ```.get()``` method,
but you don't have to care about the index.

```Javascript
import {Catalog} from "ndxr"

let catalog = Catalog.buildCatalog(indexInstance)
```

#### Catalog.get(getter, indexInstance)
This method receives a getter object and an instance of Ndxr.
Depending on the getter it will return an array of objects that
match the getter. If nothing matches the getter it returns ```undefined```

```Javascript
import {Catalog} from "ndxr"

let catalog = Catalog.get({} ,indexInstance)
```

##### Getter Object
With the getter object you can specify your search in the index.
You can search in the structure of your indexed data objects.

For the following examples we imagine to have this data indexes:

```Javascript
let persons = [{
    firstname: 'Alex',
    lastname: 'Mader',
    cars: [{
        brand: "Audi",
        model: "A4",
        built: 2008
    },{
        brand: "Volkswagen",
        model: "Passat",
        built: 2010
    }]
},{
    firstname: 'Thomas',
    lastname: 'Eder',
    cars: [{
        brand: "Renault",
        model: "Clio",
        built: 1999
    },{
        brand: "Seat",
        model: "Leon",
        built: 2014
    }]
}]

let index = new Ndxr(persons)
```

###### Simple attribute getter:
```Javasript
let getter = {
    firstname: "Alex"
}
let results = Catalog.get(getter, index)
```
Gives you all persons with the firstname ```Alex```

###### Multiple attribute getter:
```Javasript
let getter = {
    firstname: ["Alex","Thomas"]
}
let results = Catalog.get(getter, index)
```
Gives you all persons with the firstname ```Alex``` or ```Thomas```

###### Nested attribute getter:
```Javasript
let getter = {
    cars: {
        brand: "Audi"
    }
}
let results = Catalog.get(getter, index)
```
Gives you all persons with a car of the brand ```Audi```

###### Function getter
```Javasript
let getter = {
    cars: {
        built: (value) => {
            return value >= 2010
        }
    }
}
let results = Catalog.get(getter, index)
```
Gives you all persons with a car that's built year is at least ```2010```

###### Combined getter
Of course you can combine your getter object in any given way
```Javasript
let getter = {
    fistname: (value) => {
        return value.length > 4
    }
    cars: {
        built: (value) => {
            return value >= 2010
        },
        brand: ['Renault','Peugeot']
    }
}
let results = Catalog.get(getter, index)
```
Gives you all people with a firstname longer than 4 character,
a car that's built year is at least 2010 and a car
that's brand is Renault or Peugeot.


##### LinkedCatalog.get(getter)
This method works exactly like ```Catalog.get()```,
but you don't have to worry about passing the index,
because the Catalog is already linked.
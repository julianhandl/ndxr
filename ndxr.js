class Catalog {
    constructor(initialData){
        this.separator = "<$>"
        this.index = {}
        this.reverseIndex = {}

        this.add(initialData)
    }

    // public API
    get(getter){
        switch(typeof getter){
            case 'number':
                return Catalog.cloneDeep(this.reverseIndex[getter].source)
            case 'object':
                return Catalog.mapIdsToSources(Catalog.query(getter, this.index, this.separator), this.reverseIndex)
        }
    }

    // public API
    add(data){
        if(Array.isArray(data)){
            data.forEach(item => {
                this.addItemToIndex(Catalog.cloneDeep(item))
            })
        }
        else{
            this.addItemToIndex(Catalog.cloneDeep(data))
        }
    }

    remove(removeObject){
        if(typeof removeObject == "object"){
            if(Array.isArray(removeObject)){
                removeObject.forEach(obj => {
                    this.remove(obj)
                })
            }
            else{
                let idsToRemove = Catalog.query(removeObject, this.index, this.separator)
                idsToRemove.forEach(id => {
                    this.remove(id)
                })
            }
        }
        else{
            let obj = this.reverseIndex[removeObject]
            let pathsObject = obj.paths
            let paths = Object.keys(pathsObject)

            let matchedPaths = []
            paths.forEach(path => {
                let value = this.reverseIndex[removeObject].paths[path]
                if(Array.isArray(value)){
                    value.forEach(val => {
                        let matchedPath = path.split(this.separator)
                        matchedPath.push(val)
                        matchedPaths.push(matchedPath)
                    })
                }
                else{
                    let matchedPath = path.split(this.separator)
                    matchedPath.push(value)
                    matchedPaths.push(matchedPath)
                }
            })

            matchedPaths.forEach(fullPath => {
                let path = fullPath.slice(0, fullPath.length-1).join(this.separator)
                let value = fullPath[fullPath.length - 1]
                let ids = this.index[path][value]
                this.index[path][value] = ids.filter(id => id != removeObject)
            })

            delete(this.reverseIndex[removeObject])
        }
    }

    addItemToIndex(item) {
        let objectPaths = Catalog.getPathValue(item)
        let itemId = Object.keys(this.reverseIndex).length

        // add item to index
        objectPaths.forEach(item => {
            let path = item.slice(0, item.length - 1).join(this.separator)
            let value = item[item.length-1]

            if(this.index[path]){
                if(this.index[path][value]){
                    this.index[path][value].push(itemId)
                }
                else{
                    this.index[path][value] = [itemId]
                }
            }
            else{
                this.index[path] = {
                    [value]: [itemId]
                }
            }
        })

        // add item to reverseIndex
        let pathsObject = {}
        objectPaths.forEach(item => {
            let path = item.slice(0, item.length - 1).join(this.separator)
            let value = item[item.length-1]
            if(value){
                if(pathsObject[path]){
                    if(Array.isArray(pathsObject[path])){
                        if(pathsObject[path].indexOf(value) < 0){
                            pathsObject[path].push(value)
                        }
                    }
                    else if(pathsObject[path] != value){
                        pathsObject[path] = [pathsObject[path],value]
                    }
                }
                else{
                    pathsObject[path] = value
                }
            }
        })
        this.reverseIndex[itemId] = {
            source: item,
            paths: pathsObject
        }
    }

    static getPathValue(keyValue) {
        if (keyValue && typeof keyValue == "object") {
            if(Array.isArray(keyValue)){
                let returnFinal = []
                keyValue.forEach(item => {
                    if(typeof item == "object"){
                        let keys = Object.keys(item)
                        keys.forEach((key) => {
                            let response = Catalog.getPathValue(item[key])
                            response.forEach(val => {
                                returnFinal.push([key].concat(val))
                            })
                        })
                    }
                    else{
                        returnFinal.push(item)
                    }
                })
                return returnFinal
            }
            else{
                let keys = Object.keys(keyValue)
                let returnFinal = []
                keys.forEach((key) => {
                    let response = Catalog.getPathValue(keyValue[key])
                    response.forEach(val => {
                        returnFinal.push([key].concat(val))
                    })
                })
                return returnFinal
            }


        }
        else {
            return [keyValue]
        }
    }

    static query(queryObject, index, separator){
        let objectPaths = Catalog.getPathValue(queryObject)
        let matchedPathIds = {}

        objectPaths.forEach(path => {
            // match paths with index and store value in itemIds
            let queryPath = path.slice(0, path.length - 1).join(separator)
            let queryValue = path[path.length-1]
            let ids = []

            if(typeof queryValue == "function"){
                if(index[queryPath]){
                    let values = Object.keys(index[queryPath])
                    values.forEach(value => {
                        if(queryValue(value)){
                            let matchedIds = index[queryPath][value]
                            matchedIds.forEach(id => {
                                Catalog.addUniqueValueToArray(ids, id)
                            })
                        }
                    })
                }
            }
            else{
                ids = index[queryPath][queryValue]
            }

            if(!matchedPathIds[queryPath]){
                matchedPathIds[queryPath] = []
            }

            for(let i=0; i<ids.length; i++){
                Catalog.addUniqueValueToArray(matchedPathIds[queryPath], ids[i])
            }
        })

        // combine results of multible paths
        let matchedPaths = Object.keys(matchedPathIds)
        if(matchedPaths.length == 0){
            return []
        }
        else if(matchedPaths.length == 1){
            return matchedPathIds[matchedPaths[0]]
        }
        else{
            let combinedIds = matchedPathIds[matchedPaths[0]].slice()
            for(let i=1; i < matchedPaths.length; i++){
                let matchedIds = []
                let ids = matchedPathIds[matchedPaths[i]]
                ids.forEach(id => {
                    if(combinedIds.indexOf(id) >= 0){
                        matchedIds.push(id)
                    }
                })
                combinedIds = matchedIds
            }
            return combinedIds
        }
    }

    static mapIdsToSources(ids, reverseIndex){
        return ids.map(id => {
            let obj = Catalog.cloneDeep(reverseIndex[id].source)
            obj.catalogId = id
            return obj
        })
    }

    static cloneDeep(obj){
        return JSON.parse(JSON.stringify(obj))
    }

    static addUniqueValueToArray(dest, value){
        if(dest.indexOf(value) < 0){
            dest.push(value)
        }
    }
}
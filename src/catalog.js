var Ndxr = require("./ndxr.js")

class LinkedCatalog{
    constructor(ndxrInstance){
        this.ndxrInstance = ndxrInstance
    }

    /*
        res = .get(x) performs a query on the index and returns the results
        x = int || [int]
        res = [{}] || null
    */
    get(getter){
        return Catalog.get(getter, this.ndxrInstance)
    }
}

class Catalog{
    static buildCatalog(ndxrInstance){
        return new LinkedCatalog(ndxrInstance)
    }

    static get(getter, ndxrInstance){
        switch(typeof getter){
            case 'number':
                let matchingIndex = ndxrInstance.reverseIndex[getter]
                if(matchingIndex){
                    return Ndxr.cloneDeep(Object.assign(
                        matchingIndex.source,
                        {catalogId: getter}
                    ))
                }
                else{
                    return undefined
                }
            case 'object':
                if(Array.isArray(getter)){
                    let matchingItems = []
                    getter.forEach(getterItem => {
                        let result = this.get(getterItem, ndxrInstance)
                        if(result) matchingItems.push(result)
                    })
                    return matchingItems.length > 0 ? matchingItems : null
                }
                else{
                    return Catalog.mapIdsToSources(Catalog.query(getter, ndxrInstance.index, ndxrInstance.separator), ndxrInstance.reverseIndex)
                }
        }
    }

    static query(queryObject, index, separator){
        let objectPaths = Ndxr.getPathValue(queryObject)
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
                                ids = Ndxr.addUniqueValueToArray(ids, id)
                            })
                        }
                    })
                }
            }
            else{
                if(index[queryPath]) {
                    ids = index[queryPath][queryValue]
                }
            }

            if(!matchedPathIds[queryPath]){
                matchedPathIds[queryPath] = []
            }

            if(ids){
                for(let i=0; i<ids.length; i++){
                    matchedPathIds[queryPath] = Ndxr.addUniqueValueToArray(matchedPathIds[queryPath], ids[i])
                }
            }
        })

        // combine results of multiple paths
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
        if(ids.length == 0) return undefined
        return ids.map(id => {
            let obj = Ndxr.cloneDeep(reverseIndex[id].source)
            obj.catalogId = id
            return obj
        })
    }
}

module.exports = Catalog
class Ndxr {
    constructor(initialData){
        this.separator = "<$>"
        this.index = {}
        this.reverseIndex = {}

        this.add(initialData)
    }

    /*
        .add(x) adds data to the index which gets indexed
        x = {} || [{}]
    */
    add(data){
        if(data){
            if(Array.isArray(data)){
                data.forEach(item => {
                    Ndxr.addItemToIndex(Ndxr.cloneDeep(item), this.index, this.reverseIndex, this.separator)
                })
            }
            else{
                Ndxr.addItemToIndex(Ndxr.cloneDeep(data), this.index, this.reverseIndex, this.separator)
            }
        }
        else{
            console.warn(".add(x) x must be object or array of objects")
        }
    }

    /*
        .remove(x) removes data from the index
        x = int || [int]
    */
    remove(removeObject){
        if(removeObject){
            if(typeof removeObject == "object"){
                if(Array.isArray(removeObject)){
                    removeObject.forEach(obj => {
                        this.remove(obj)
                    })
                }
                else{
                    let idsToRemove = Ndxr.query(removeObject, this.index, this.separator)
                    idsToRemove.forEach(id => {
                        this.remove(id)
                    })
                }
            }
            else{
                let obj = this.reverseIndex[removeObject]
                let pathsObject = obj && obj.paths || {}
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
        else{
            console.warn(".remove(x) x must be integer or array of integers")
        }
    }

    static addItemToIndex(item, index, reverseIndex, separator) {
        let objectPaths = Ndxr.getPathValue(item)
        let itemId = Object.keys(reverseIndex).length

        // add item to index
        objectPaths.forEach(item => {
            let path = item.slice(0, item.length - 1).join(separator)
            let value = item[item.length-1]

            if(index[path]){
                if(index[path][value]){
                    index[path][value].push(itemId)
                }
                else{
                    index[path][value] = [itemId]
                }
            }
            else{
                index[path] = {
                    [value]: [itemId]
                }
            }
        })

        // add item to reverseIndex
        let pathsObject = {}
        objectPaths.forEach(item => {
            let path = item.slice(0, item.length - 1).join(separator)
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
        reverseIndex[itemId] = {
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
                            let response = Ndxr.getPathValue(item[key])
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
                    let response = Ndxr.getPathValue(keyValue[key])
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

    static cloneDeep(obj){
        return JSON.parse(JSON.stringify(obj))
    }

    static addUniqueValueToArray(dest, value){
        let newArray = [...dest]
        if(dest.indexOf(value) < 0){
            newArray.push(value)
        }
        return newArray
    }
}

exports.default = Ndxr

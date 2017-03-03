var Ndxr = require("./ndxr")

class LinkedProvider {
    constructor(ndxrInstance){
        this.ndxrInstance = ndxrInstance
    }
    get(getter){
        return Provider.get(getter, this.ndxrInstance)
    }
}

class Provider {
    static buildProvider(ndxrInstance){
        return new LinkedProvider(ndxrInstance)
    }
    static get(getter, ndxrInstance){
        if(getter){
            if(Object.keys(getter).length > 0){



                let objectPaths = Ndxr.getPathValue(getter)
                console.log(objectPaths)
                console.log(ndxrInstance.index)



            }
            else{
                return undefined
            }
        }
        else{
            return undefined
        }
    }
}

module.exports = Provider
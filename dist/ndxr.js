var Catalog = (function () {
    function Catalog(initialData) {
        var _this = this;
        this.separator = "<$>";
        this.index = {};
        this.reverseIndex = {};
        if (Array.isArray(initialData)) {
            initialData.forEach(function (item) {
                _this.addItemToIndex(Catalog.cloneDeep(item));
            });
        }
        else {
            this.addItemToIndex(Catalog.cloneDeep(initialData));
        }
    }
    Catalog.prototype.addItemToIndex = function (item) {
        var _this = this;
        var objectPaths = Catalog.getPathValue(item);
        var itemId = Object.keys(this.reverseIndex).length;
        objectPaths.forEach(function (item) {
            var path = item.slice(0, item.length - 1).join(_this.separator);
            var value = item[item.length - 1];
            if (_this.index[path]) {
                if (_this.index[path][value]) {
                    _this.index[path][value].push(itemId);
                }
                else {
                    _this.index[path][value] = [itemId];
                }
            }
            else {
                _this.index[path] = (_a = {},
                    _a[value] = [itemId],
                    _a
                );
            }
            var _a;
        });
        var pathsObject = {};
        objectPaths.forEach(function (item) {
            var path = item.slice(0, item.length - 1).join(_this.separator);
            var value = item[item.length - 1];
            if (value) {
                if (pathsObject[path]) {
                    if (Array.isArray(pathsObject[path])) {
                        if (pathsObject[path].indexOf(value) < 0) {
                            pathsObject[path].push(value);
                        }
                    }
                    else if (pathsObject[path] != value) {
                        pathsObject[path] = [pathsObject[path], value];
                    }
                }
                else {
                    pathsObject[path] = value;
                }
            }
        });
        this.reverseIndex[itemId] = {
            source: item,
            paths: pathsObject
        };
    };
    Catalog.getPathValue = function (keyValue) {
        if (keyValue && typeof keyValue == "object") {
            if (Array.isArray(keyValue)) {
                var returnFinal_1 = [];
                keyValue.forEach(function (item) {
                    if (typeof item == "object") {
                        var keys = Object.keys(item);
                        keys.forEach(function (key) {
                            var response = Catalog.getPathValue(item[key]);
                            response.forEach(function (val) {
                                returnFinal_1.push([key].concat(val));
                            });
                        });
                    }
                    else {
                        returnFinal_1.push(item);
                    }
                });
                return returnFinal_1;
            }
            else {
                var keys = Object.keys(keyValue);
                var returnFinal_2 = [];
                keys.forEach(function (key) {
                    var response = Catalog.getPathValue(keyValue[key]);
                    response.forEach(function (val) {
                        returnFinal_2.push([key].concat(val));
                    });
                });
                return returnFinal_2;
            }
        }
        else {
            return [keyValue];
        }
    };
    Catalog.prototype.remove = function (removeObject) {
        var _this = this;
        if (typeof removeObject == "object") {
            if (Array.isArray(removeObject)) {
                removeObject.forEach(function (obj) {
                    _this.remove(obj);
                });
            }
            else {
                var idsToRemove = this.query(removeObject);
                idsToRemove.forEach(function (id) {
                    _this.remove(id);
                });
            }
        }
        else {
            var obj = this.reverseIndex[removeObject];
            var pathsObject = obj.paths;
            var paths = Object.keys(pathsObject);
            var matchedPaths_1 = [];
            paths.forEach(function (path) {
                var value = _this.reverseIndex[removeObject].paths[path];
                if (Array.isArray(value)) {
                    value.forEach(function (val) {
                        var matchedPath = path.split(_this.separator);
                        matchedPath.push(val);
                        matchedPaths_1.push(matchedPath);
                    });
                }
                else {
                    var matchedPath = path.split(_this.separator);
                    matchedPath.push(value);
                    matchedPaths_1.push(matchedPath);
                }
            });
            matchedPaths_1.forEach(function (fullPath) {
                var path = fullPath.slice(0, fullPath.length - 1).join(_this.separator);
                var value = fullPath[fullPath.length - 1];
                var ids = _this.index[path][value];
                _this.index[path][value] = ids.filter(function (id) { return id != removeObject; });
            });
            delete (this.reverseIndex[removeObject]);
        }
    };
    Catalog.prototype.get = function (getter) {
        switch (typeof getter) {
            case 'number':
                return Catalog.cloneDeep(this.reverseIndex[getter].source);
            case 'object':
                return this.mapIdsToSources(this.query(getter));
        }
    };
    Catalog.prototype.query = function (queryObject) {
        var _this = this;
        var objectPaths = Catalog.getPathValue(queryObject);
        var matchedPathIds = {};
        objectPaths.forEach(function (path) {
            var queryPath = path.slice(0, path.length - 1).join(_this.separator);
            var queryValue = path[path.length - 1];
            var ids = [];
            if (typeof queryValue == "function") {
                if (_this.index[queryPath]) {
                    var values = Object.keys(_this.index[queryPath]);
                    values.forEach(function (value) {
                        if (queryValue(value)) {
                            var matchedIds = _this.index[queryPath][value];
                            matchedIds.forEach(function (id) {
                                Catalog.addUniqueValueToArray(ids, id);
                            });
                        }
                    });
                }
            }
            else {
                ids = _this.index[queryPath][queryValue];
            }
            if (!matchedPathIds[queryPath]) {
                matchedPathIds[queryPath] = [];
            }
            for (var i = 0; i < ids.length; i++) {
                Catalog.addUniqueValueToArray(matchedPathIds[queryPath], ids[i]);
            }
        });
        var matchedPaths = Object.keys(matchedPathIds);
        if (matchedPaths.length == 0) {
            return [];
        }
        else if (matchedPaths.length == 1) {
            return matchedPathIds[matchedPaths[0]];
        }
        else {
            var combinedIds_1 = matchedPathIds[matchedPaths[0]].slice();
            var _loop_1 = function(i) {
                var matchedIds = [];
                var ids = matchedPathIds[matchedPaths[i]];
                ids.forEach(function (id) {
                    if (combinedIds_1.indexOf(id) >= 0) {
                        matchedIds.push(id);
                    }
                });
                combinedIds_1 = matchedIds;
            };
            for (var i = 1; i < matchedPaths.length; i++) {
                _loop_1(i);
            }
            return combinedIds_1;
        }
    };
    Catalog.prototype.mapIdsToSources = function (ids) {
        var _this = this;
        return ids.map(function (id) {
            var obj = Catalog.cloneDeep(_this.reverseIndex[id].source);
            obj.catalogId = id;
            return obj;
        });
    };
    Catalog.cloneDeep = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    Catalog.addUniqueValueToArray = function (dest, value) {
        if (dest.indexOf(value) < 0) {
            dest.push(value);
        }
    };
    return Catalog;
}());
//# sourceMappingURL=ndxr.js.map
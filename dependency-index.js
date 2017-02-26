module.exports = createIndex;

function createIndex() {
    return new DependencyIndex();
}

class DependencyIndex {
    constructor() {
        this._resources = {};
    }
    
    get(tag) {
        let resolved = this._resolve(tag);
        if (resolved.isFactory) {
            return resolved();
        } else {
            return resolved;
        }
    }

    addConstant(tag, value) {
        return this._addResource(tag, value);
    }

    addSingleton(tag, dependencies, factory) {
        let resolvedFactory = this._createResolvedFactory(dependencies, factory);
        Object.defineProperty(resolvedFactory, 'isFactory', { value: true });

        return this._addResource(tag, resolvedFactory);
    }

    _addResource(tag, valueOrFactory) {
        this._resources = Object.assign(this._resources, { [tag]: valueOrFactory });
        return this;
    }

    _createResolvedFactory(dependencies, factory) {
        return () => 
            factory(...dependencies.map(tag => this._resolve(tag)));
    }

    _resolve(dependencyTag) {
        let resolved = this._resources[dependencyTag];

        if (resolved == undefined) {
            throw "Resolution Error";
        }

        return resolved;
    }
}

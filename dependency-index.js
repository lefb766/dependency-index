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
        if (resolved.type == 'factory') {
            return resolved.content();
        } else {
            return resolved.content;
        }
    }

    addConstant(tag, value) {
        return this._addResource(tag, 'constant', value);
    }

    addSingleton(tag, dependencies, factory) {
        let resolvedFactory = this._createResolvedFactory(dependencies, factory);

        return this._addResource(tag, 'factory', resolvedFactory);
    }

    _addResource(tag, type, resource) {
        this._resources[tag] = { type, content: resource };
        return this;
    }

    _createResolvedFactory(dependencies, factory) {
        return () => 
            factory(...dependencies.map(tag => this.get(tag)));
    }

    _resolve(dependencyTag) {
        let resolved = this._resources[dependencyTag];

        if (resolved == undefined) {
            throw "Resolution Error";
        }

        return resolved;
    }
}

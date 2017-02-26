import createIndex = require('../dependency-index');

describe('DependencyIndex', function() {
    it('holds resources registered based on string keys', function() {
        type Index = {
            foo: number,
            bar: () => string,
        }
        
        let index = createIndex<Index>()
            .addConstant('foo',  1)
            .addConstant('bar', () => 'Hello');
        
        expect(index.get('foo')).toBe(1);
        expect(index.get('bar')()).toBe('Hello');
    });

    it('resolves dependencies', function() {
        type Index = {
            foo: number,
            bar: number,
        };

        let index = createIndex<Index>()
            .addConstant('foo', 3.14)
            .addSingleton('bar', ['foo'], foo => foo * 2);
        
        expect(index.get('bar')).toBe(6.28);
    });

    it('throws when an unregistered resource requested', function() {
        let index;
        index = createIndex<any>();
        expect(() => { index.get('foo') }).toThrow();

        index = createIndex<any>()
            .addSingleton('bar', ['foo'], foo => foo * 2);
            
        expect(() => { index.get('bar') }).toThrow();
    });
});

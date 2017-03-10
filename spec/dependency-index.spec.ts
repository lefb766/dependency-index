import createIndex = require('../dependency-index');
import Rx = require('rxjs/Rx');

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

        expect(() => {
            index = createIndex<any>()
                .addSingleton('bar', ['foo'], foo => foo * 2);

            index.get('bar');
        }).toThrow();
    });

    describe('when resource added with addTransient', function() {
        it('creates instance of requested tag every time get() called', function() {
            const index = createIndex<{ foo: {} }>()
                .addTransient('foo', [], () => ({}));
            const first = index.get('foo');
            const second = index.get('foo');

            expect(first !== second).toBeTruthy();
        });
    });

    describe('when used with observables', function() {
        it('keeps values up to date', function () {
            type Index = {
                foo: number;
            };

            let foo = new Rx.BehaviorSubject(123);

            const index = createIndex<Index>()
                .addObservable('foo', foo);

            expect(index.get('foo')).toEqual(123);

            foo.next(456);

            expect(index.get('foo')).toEqual(456);
        });
    });
});

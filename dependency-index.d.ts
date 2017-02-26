export = createIndex;

declare function createIndex<TypeIndex>(): DependencyIndex<TypeIndex, {}>;
declare class DependencyIndex<TypeIndex, Registered> {
    get<Tag extends keyof Registered>(tag: Tag): Registered[Tag];

    addConstant<Tag extends keyof TypeIndex>(tag: Tag, value: TypeIndex[Tag]): DependencyIndex<TypeIndex, Registered & { [T in Tag]: TypeIndex[Tag] }>;
    addSingleton<Tag extends keyof TypeIndex, D1 extends keyof TypeIndex>(tag: Tag, deps: [D1], factory: (d1: TypeIndex[D1]) => TypeIndex[Tag]): DependencyIndex<TypeIndex, Registered & { [T in Tag]: TypeIndex[Tag] }>;
}
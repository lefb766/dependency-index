const fs = require('fs');

main();

function main() {
    const outputPath = process.argv[2];

    if (!outputPath) {
        console.error('Specify output path (- for stdout).');
        process.abort();
    }

    let writeLine;
    if (outputPath == '-') {
        writeLine = line => console.log(line);
    } else {
        if (fs.existsSync(outputPath)) {
            console.error('A file already exists on specified path. Remove it and try again if you are sure.');
            process.abort();
        }

        writeLine = line => {
            fs.appendFileSync(outputPath, line + '\n', { encoding: 'utf-8' });
        }
    }

    generateTypesForDependencyIndex(writeLine, 5);
}

function generateTypesForDependencyIndex(writeLine, maxDependencyAtOnceCountAllowed) {
    const indent = "    ";

    const className = "DependencyIndex";
    const returnTypeOfAddMethods = `${className}<TypeIndex, Registered & { [T in Tag]: TypeIndex[Tag] }>`;

    [
        'export = createIndex;',
        '',
        'type ValueProvider<T> = {',
        indent + '(): T;',
        '} | {',
        indent + 'getValue(): T;',
        '};',
        '',
        'type ObservableLike<T> = ValueProvider<T> & {',
        indent + 'subscribe(subscriber: (value: T) => void): UnsubscribeHandle;',
        '};',
        '',
        'type UnsubscribeHandle = {',
        indent + 'unsubscribe(): void;',
        '} | {',
        indent + 'dispose(): void;',
        '};',
        '',
        `declare function createIndex<TypeIndex>(): ${className}<TypeIndex, {}>;`,
        '',
        `declare class ${className}<TypeIndex, Registered> {`,
        indent + 'get<Tag extends keyof Registered>(tag: Tag): Registered[Tag];',
        '',
        indent + `addConstant<Tag extends keyof TypeIndex>(tag: Tag, value: TypeIndex[Tag]): ${returnTypeOfAddMethods};`,
        '',
        indent + `addObservable<Tag extends keyof TypeIndex>(tag: Tag, observable: ObservableLike<TypeIndex[Tag]>): ${returnTypeOfAddMethods};`,
    ].forEach(writeLine);

    for (let count = 0; count < maxDependencyAtOnceCountAllowed; count++) {
        writeLine(indent + generateMethodAddSingleton(className, returnTypeOfAddMethods,count));
    }

    writeLine("}");
}

function generateMethodAddSingleton(className, returnType, dependencyCount) {
    if (dependencyCount == 0) {
        return `addSingleton<Tag extends keyof TypeIndex>(tag: Tag, deps: never[], factory: () => TypeIndex[Tag]): ${returnType};`
    }

    let dependencyIdentifiers = [];
    for (let i = 1; i <= dependencyCount; i++) {
        dependencyIdentifiers.push({
            arg: 'd' + i,
            typeTag: 'D' + i,
        });
    }

    let segments = [];
    segments.push("addSingleton<Tag extends keyof TypeIndex");

    // type parameters
    for (const ids of dependencyIdentifiers) {
        segments.push(`, ${ids.typeTag} extends keyof TypeIndex`);
    }

    segments.push('>(tag: Tag, deps: [');

    // dependency tuple
    segments.push(dependencyIdentifiers.map(id => id.typeTag).join(', '));

    segments.push('], factory: (');

    // factory args
    segments.push(dependencyIdentifiers.map(id => `${id.arg}: TypeIndex[${id.typeTag}]`).join(', '));

    segments.push(`) => TypeIndex[Tag]): ${returnType};`);

    return segments.join('');
}

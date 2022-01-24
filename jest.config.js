const { Header } = require('./build/src/cli/String');
console.log(Header('TEST'));

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [ "./test" ],
    testPathIgnorePatterns: ["test/*.config"]
};
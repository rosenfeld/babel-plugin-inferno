"use strict";

var babel  = require("babel");
var plugin = require("./src/index");

//var code = `
//    var foo = require("test");
//
//    var someObj = {
//        render() {
//            return <div><div><span>{ test || foo }</span></div><h1>Hello world!</h1></div>
//        }
//    }
//`;
//
//var output = babel.transform(code, {
//    blacklist: ['strict', 'react'],
//    plugins: [plugin]
//}).code
//
//console.log(output);
//
//var code = `
//    var foo = require("test");
//
//    var someObj = {
//        render() {
//            <div><span>{ test || foo }</span>{ bar } { foo }</div>
//        }
//    }
//`;
//
//var output = babel.transform(code, {
//    blacklist: ['strict', 'react'],
//    plugins: [plugin]
//}).code

var code = `
    var foo = require("test");

    var someObj = {
        render() {
            <div><Foo></Foo></div>
        }
    }
`;

var output = babel.transform(code, {
    blacklist: ['strict', 'react'],
    plugins: [plugin]
}).code

console.log(output);
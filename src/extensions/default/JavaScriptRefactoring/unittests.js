/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 * Original work Copyright (c) 2013 - 2021 Adobe Systems Incorporated. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

/*jslint regexp: true */
/*global describe, it, expect, beforeEach, afterEach, awaitsFor, awaitsForDone */

define(function (require, exports, module) {


    var MainViewManager      = brackets.getModule("view/MainViewManager"),
        DocumentManager      = brackets.getModule("document/DocumentManager"),
        FileUtils            = brackets.getModule("file/FileUtils"),
        SpecRunnerUtils      = brackets.getModule("spec/SpecRunnerUtils"),
        ExtractToVariable    = require("ExtractToVariable"),
        ExtractToFunction    = require("ExtractToFunction"),
        TokenUtils           = brackets.getModule("utils/TokenUtils"),
        WrapSelection        = require("WrapSelection"),
        RenameIdentifier     = require("RenameIdentifier");

    var extensionPath   = FileUtils.getNativeModuleDirectoryPath(module),
        testPath        = extensionPath + "/unittest-files/test.js",
        testDoc         = null,
        testEditor;

    describe("extension:Javascript Refactoring ", function () {
        it("tests are disabled till we have refactoring working", function () {
           expect("tests are disabled").toBeFalsy();
        });
    });

/*
    describe("extension:Javascript Refactoring ", function () {

        async function setupTest(path, primePump) { // FIXME: primePump argument ignored even though used below
            DocumentManager.getDocumentForPath(path).done(function (doc) {
                testDoc = doc;
            });

            await awaitsFor(function () {
                return testDoc !== null;
            }, "Unable to open test document", 10000);

            // create Editor instance (containing a CodeMirror instance)
            testEditor = SpecRunnerUtils.createMockEditorForDocument(testDoc);
        }

        function tearDownTest() {
            // The following call ensures that the document is reloaded
            // from disk before each test
            MainViewManager._closeAll(MainViewManager.ALL_PANES);
            SpecRunnerUtils.destroyMockEditor(testDoc);
            testEditor = null;
            testDoc = null;
        }

        async function _waitForRefactoring(prevDocLength, numberOfLines, callback) {
            if (!callback || numberOfLines instanceof Function) {
                callback = numberOfLines;
                numberOfLines = null;
            }
            await awaitsFor(function() {
                return (testDoc.getText().length !== prevDocLength || (numberOfLines && testDoc.getText().split("\n").length !== numberOfLines));
            }, 3000);
            callback();
        }

        async function _waitForRename(prevSelections, callback) {
            await awaitsFor(function() {
                return testEditor.getSelections().length !== prevSelections;
            }, 3000);
            callback();
        }

        describe("Extract to variable", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should extract literal expression", async function () {
                testEditor.setSelection({line: 11, ch: 4}, {line: 11, ch: 7});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(11)).toBe("var extracted1 = 923;");
                    expect(testDoc.getLine(12)).toBe("x = extracted1;");
                });
            });

            it("should extract array expression", async function () {
                testEditor.setSelection({line: 14, ch: 4}, {line: 14, ch: 13});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(14)).toBe("var extracted1 = [1, 2, 3];");
                    expect(testDoc.getLine(15)).toBe("x = extracted1;");
                });
            });

            it("should extract object expression", async function () {
                testEditor.setSelection({line: 17, ch: 4}, {line: 20, ch: 1});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 17, ch: 0}, {line: 20, ch: 2}))
                        .toBe(
                            "var extracted1 = {\n" +
                            "    test1: 12,\n"     +
                            "    test2: 45\n"      +
                            "};"
                        );
                    expect(testDoc.getLine(21)).toBe("x = extracted1;");
                });
            });

            it("should extract property expression", async function () {
                testEditor.setSelection({line: 23, ch: 4}, {line: 23, ch: 11});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(23)).toBe("var extracted1 = x.test1;");
                    expect(testDoc.getLine(24)).toBe("x = extracted1;");
                });
            });

            it("should extract function expression", async function () {
                testEditor.setSelection({line: 26, ch: 4}, {line: 28, ch: 1});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 26, ch: 0}, {line: 28, ch: 2}))
                        .toBe(
                            "var extracted1 = function() {\n"      +
                            "    console.log(\"hello world\");\n"  +
                            "};"
                        );
                    expect(testDoc.getLine(29)).toBe("x = extracted1;");
                });
            });

            it("should extract unary expression", async function () {
                testEditor.setSelection({line: 31, ch: 4}, {line: 31, ch: 7});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(31)).toBe("var extracted1 = ++y;");
                    expect(testDoc.getLine(32)).toBe("x = extracted1;");
                });
            });

            it("should extract binary expression", async function () {
                testEditor.setSelection({line: 34, ch: 4}, {line: 34, ch: 13});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(34)).toBe("var extracted1 = 1 + 2 + 3;");
                    expect(testDoc.getLine(35)).toBe("x = extracted1;");
                });
            });

            it("should extract assignment expression", async function () {
                testEditor.setSelection({line: 38, ch: 0}, {line: 38, ch: 6});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(38)).toBe("var extracted1 = x = 23;");
                });
            });

            it("should extract assignment expression", async function () {
                testEditor.setSelection({line: 41, ch: 3}, {line: 41, ch: 17});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(41)).toBe("var extracted1 = true || false;");
                    expect(testDoc.getLine(42)).toBe("x = extracted1;");
                });
            });

            it("should extract conditional expression", async function () {
                testEditor.setSelection({line: 44, ch: 4}, {line: 44, ch: 19});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(44)).toBe("var extracted1 = (2 < 3)? 34: 45;");
                    expect(testDoc.getLine(45)).toBe("x = extracted1;");
                });
            });

            it("should extract new expression", async function () {
                testEditor.setSelection({line: 50, ch: 4}, {line: 50, ch: 16});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(50)).toBe("var extracted1 = new Square();");
                    expect(testDoc.getLine(51)).toBe("x = extracted1;");
                });
            });

            it("should extract arrow function", async function () {
                testEditor.setSelection({line: 56, ch: 4}, {line: 56, ch: 16});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(56)).toBe("var extracted1 = y => y ** 2;");
                    expect(testDoc.getLine(57)).toBe("x = extracted1;");
                });
            });

            it("should extract template literal", async function () {
                testEditor.setSelection({line: 62, ch: 4}, {line: 62, ch: 22});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(62)).toBe("var extracted1 = `Template Literal`;");
                    expect(testDoc.getLine(63)).toBe("x = extracted1;");
                });
            });

            it("should extract tagged template literal", async function () {
                testEditor.setSelection({line: 65, ch: 4}, {line: 65, ch: 29});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(65)).toBe("var extracted1 = String.raw`Hi${2 + 3}!`;");
                    expect(testDoc.getLine(66)).toBe("x = extracted1;");
                });
            });

            it("should extract await expression", async function () {
                testEditor.setSelection({line: 77, ch: 12}, {line: 77, ch: 42});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(77)).toBe("    var extracted1 = await resolveAfter2Seconds(10);");
                    expect(testDoc.getLine(78)).toBe("    var x = extracted1;");
                });
            });

            it("should extract yield expression", async function () {
                testEditor.setSelection({line: 84, ch: 8}, {line: 84, ch: 26});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(84)).toBe("        var extracted1 = yield saleList[i];");
                });
            });

            it("should extract super expression", async function () {
                testEditor.setSelection({line: 103, ch: 8}, {line: 103, ch: 29});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(103)).toBe("        var extracted1 = super(length, length);");
                });
            });

            it("should extract class expression", async function () {
                testEditor.setSelection({line: 109, ch: 4}, {line: 114, ch: 1});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 109, ch: 0}, {line: 114, ch: 2}))
                    .toBe(
                        "var extracted1 = class {\n"          +
                        "    constructor (height, width) {\n" +
                        "        this.a = height;\n"          +
                        "        this.b = width;\n"           +
                        "    }\n"                            +
                        "};"
                    );
                    expect(testDoc.getLine(115)).toBe("x = extracted1;");
                });
            });

            it("should extract all the references of expression in a scope", async function() {
                testEditor.setSelection({line: 118, ch: 12}, {line: 118, ch: 14});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(118)).toBe("    var extracted1 = 34;");
                    expect(testDoc.getLine(119)).toBe("    var x = extracted1;");
                    expect(testDoc.getLine(120)).toBe("    var y = extracted1;");
                    expect(testDoc.getLine(121)).toBe("    var z = extracted1;");
                });
            });

            it("should create variable with unique name", async function() {
                testEditor.setSelection({line: 126, ch: 12}, {line: 126, ch: 14});

                var prevDocLength = testDoc.getText().length;

                ExtractToVariable.handleExtractToVariable();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(126)).toBe("    var extracted2 = 45;");
                    expect(testDoc.getLine(127)).toBe("    var x = extracted2;");
                });
            });
        });

        describe("Extract to function", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should display correct scopes for line inside a function declaration", async function () {
                testEditor.setSelection({line: 7, ch: 4}, {line: 7, ch: 28});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(2);
                expect(scopeMenu.items[0].name).toBe("test");
                expect(scopeMenu.items[1].name).toBe("global");
            });

            it("should display correct scopes for line inside a function expression", async function () {
                testEditor.setSelection({line: 27, ch: 4}, {line: 27, ch: 31});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(2);
                expect(scopeMenu.items[0].name).toBe("x");
                expect(scopeMenu.items[1].name).toBe("global");
            });

            it("should display correct scopes for line inside a arrow function", async function () {
                testEditor.setSelection({line: 58, ch: 4}, {line: 58, ch: 17});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(2);
                expect(scopeMenu.items[0].name).toBe("x");
                expect(scopeMenu.items[1].name).toBe("global");
            });

            it("should display correct scopes for line inside a nested function", async function () {
                testEditor.setSelection({line: 71, ch: 12}, {line: 71, ch: 23});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(4);
                expect(scopeMenu.items[0].name).toBe("function starting with {\n            resolve(x);\n    ");
                expect(scopeMenu.items[1].name).toBe("function starting with {\n        setTimeout(() => {\n ");
                expect(scopeMenu.items[2].name).toBe("resolveAfter2Seconds");
                expect(scopeMenu.items[3].name).toBe("global");
            });

            it("should display correct scopes for line inside a class declaration", async function () {
                testEditor.setSelection({line: 93, ch: 8}, {line: 93, ch: 27});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(3);
                expect(scopeMenu.items[0].name).toBe("constructor");
                expect(scopeMenu.items[1].name).toBe("class Polygon");
                expect(scopeMenu.items[2].name).toBe("global");
            });

            it("should display correct scopes for line inside a class expression", async function () {
                testEditor.setSelection({line: 112, ch: 8}, {line: 112, ch: 23});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu.items.length).toBe(3);
                expect(scopeMenu.items[0].name).toBe("constructor");
                expect(scopeMenu.items[1].name).toBe("class x");
                expect(scopeMenu.items[2].name).toBe("global");
            });

            it("should extract line in global scope without displaying scopes", async function () {
                testEditor.setSelection({line: 4, ch: 0}, {line: 4, ch: 11});

                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu).toBeUndefined();
                expect(testDoc.getRange({line: 4, ch: 0}, {line: 7, ch: 1}))
                    .toBe(
                        "function extracted1() {\n" +
                        "    var y = 34;\n"     +
                        "    return y;\n"      +
                        "}"
                    );
                expect(testDoc.getLine(9)).toBe("var y = extracted1();");
            });

            it("should extract a line inside a function declaration", async function () {
                testEditor.setSelection({line: 7, ch: 4}, {line: 7, ch: 27});

                var prevDocLength = testDoc.getText().length;
                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu).toBeDefined();
                var scopeElement = scopeMenu.$menu.find(".inlinemenu-item")[0];
                expect(scopeElement).toBeDefined();
                $(scopeElement).trigger("click");

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 7, ch: 0}, {line: 9, ch: 6}))
                        .toBe(
                            "    function extracted1() {\n"       +
                            "        console.log(\"Testing\");\n" +
                            "    }"
                        );
                });
            });

            it("should extract a line inside a class to a class method", async function () {
                testEditor.setSelection({line: 104, ch: 8}, {line: 104, ch: 29});

                var prevDocLength = testDoc.getText().length;
                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu).toBeDefined();
                var scopeElement = scopeMenu.$menu.find(".inlinemenu-item")[1];
                expect(scopeElement).toBeDefined();
                $(scopeElement).trigger("click");

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 101, ch: 0}, {line: 103, ch: 6}))
                        .toBe(
                            "    extracted1() {\n"            +
                            "        this.name = 'Square';\n" +
                            "    }"
                        );
                    expect(testDoc.getLine(108)).toBe("        this.extracted1();");
                });
            });

            it("should extract a line inside a class to global scope", async function () {
                testEditor.setSelection({line: 104, ch: 8}, {line: 104, ch: 29});

                var prevDocLength = testDoc.getText().length;
                var result = ExtractToFunction.handleExtractToFunction();
                var scopeMenu;

                await awaitsForDone(result.then(function(inlineMenu) {
                    scopeMenu = inlineMenu;
                }), "Scope not displayed in extract to function", 3000);

                expect(scopeMenu).toBeDefined();
                var scopeElement = scopeMenu.$menu.find(".inlinemenu-item")[2];
                expect(scopeElement).toBeDefined();
                $(scopeElement).trigger("click");

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getRange({line: 100, ch: 0}, {line: 102, ch: 2}))
                        .toBe(
                            "function extracted1() {\n"            +
                            "    this.name = 'Square';\n" +
                            "}"
                        );
                    expect(testDoc.getLine(108)).toBe("        extracted1.call(this);");
                });
            });
        });


        describe("Rename", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should rename function name", async function() {
                testEditor.setSelection({line: 140, ch: 17}, {line: 140, ch: 17});

                var selections = testEditor.getSelections();

                RenameIdentifier.handleRename();


                await _waitForRename(selections.length, function() {
                    var selections = testEditor.getSelections(),
                        token1 = TokenUtils.getTokenAt(testEditor._codeMirror, {line: 132, ch: 14}, {line: 132, ch: 14}),
                        token2 = TokenUtils.getTokenAt(testEditor._codeMirror, {line: 140, ch: 17}, {line: 140, ch: 17});

                    expect(selections[0].start.line).toEqual(132);
                    expect(selections[1].start.line).toEqual(140);
                });
            });

            it("should rename variable name", async function() {
                testEditor.setSelection({line: 165, ch: 6}, {line: 165, ch: 6});

                var selections = testEditor.getSelections();

                RenameIdentifier.handleRename();


                await _waitForRename(selections.length, function() {
                    var selections = testEditor.getSelections(),
                        token1 = TokenUtils.getTokenAt(testEditor._codeMirror, {line: 149, ch: 6}, {line: 149, ch: 6}),
                        token2 = TokenUtils.getTokenAt(testEditor._codeMirror, {line: 150, ch: 13}, {line: 150, ch: 13});

                    expect(selections[0].start.line).toEqual(165);
                    expect(selections[1].start.line).toEqual(168);
                });
            });
        });

        describe("Wrap Selection", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should wrap selection in Try-Catch block", async function() {
                testEditor.setSelection({line: 140, ch: 17}, {line: 140, ch: 17});

                var prevDocLength = testDoc.getText().length;

                WrapSelection.wrapInTryCatch();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(140)).toBe("    try {");
                    expect(testDoc.getLine(141)).toBe("        return addNumbers(a, c) * b;");
                    expect(testDoc.getLine(142)).toBe("    } catch (e) {");
                    expect(testDoc.getLine(143)).toBe("        //Catch Statement");
                    expect(testDoc.getLine(144)).toBe("    }");
                });
            });

            it("should wrap selection in Condition block", async function() {
                testEditor.setSelection({line: 140, ch: 17}, {line: 140, ch: 17});

                var prevDocLength = testDoc.getText().length;

                WrapSelection.wrapInCondition();

                await _waitForRefactoring(prevDocLength, function() {
                    expect(testDoc.getLine(140)).toBe("    if (Condition) {");
                    expect(testDoc.getLine(141)).toBe("        return addNumbers(a, c) * b;");
                    expect(testDoc.getLine(142)).toBe("    }");
                });
            });
        });

        describe("Arrow Function", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should convert selected function to arrow function with two param and one return statement", async function() {
                testEditor.setSelection({line: 146, ch: 6}, {line: 146, ch: 6});

                var prevDoc = testDoc.getText();

                WrapSelection.convertToArrowFunction();

                await _waitForRefactoring(prevDoc.length, prevDoc.split("\n").length, function() {
                    expect(testDoc.getLine(145)).toBe("var sum = (a, b) => a+b;");
                });
            });

            it("should convert selected function to arrow function with one param and one return statement", async function() {
                testEditor.setSelection({line: 150, ch: 6}, {line: 150, ch: 6});

                var prevDoc = testDoc.getText();

                WrapSelection.convertToArrowFunction();

                await _waitForRefactoring(prevDoc.length, prevDoc.split("\n").length, function() {
                    expect(testDoc.getLine(149)).toBe("var num = a => a;");
                });
            });

            it("should convert selected function to arrow function with two param and two statements", async function() {
                testEditor.setSelection({line: 154, ch: 6}, {line: 154, ch: 6});

                var prevDoc = testDoc.getText();

                WrapSelection.convertToArrowFunction();

                await _waitForRefactoring(prevDoc.length, prevDoc.split("\n").length, function() {
                    expect(testDoc.getLine(153)).toBe("var sumAll = (a, b) => {");
                });
            });
        });

        describe("Getters-Setters", function () {
            beforeEach(async function () {
                await setupTest(testPath, false);
            });

            afterEach(function () {
                tearDownTest();
            });

            it("should create Getters Setters for selected property", async function() {
                testEditor.setSelection({line: 161, ch: 12}, {line: 161, ch: 12});

                var prevDoc = testDoc.getText();

                WrapSelection.createGettersAndSetters();

                await _waitForRefactoring(prevDoc.length, prevDoc.split("\n").length, function() {
                    expect(testDoc.getLine(162)).toBe("    get docCurrent() {");
                    expect(testDoc.getLine(163)).toBe("        return this.docCurrent;");
                    expect(testDoc.getLine(164)).toBe("    },");
                    expect(testDoc.getLine(166)).toBe("    set docCurrent(val) {");
                    expect(testDoc.getLine(167)).toBe("        this.docCurrent = val;");
                    expect(testDoc.getLine(168)).toBe("    },");
                });
            });

            it("should create Getters Setters for last property in context", async function() {
                testEditor.setSelection({line: 162, ch: 12}, {line: 162, ch: 12});

                var prevDoc = testDoc.getText();

                WrapSelection.createGettersAndSetters();

                await _waitForRefactoring(prevDoc.length, prevDoc.split("\n").length, function() {
                    expect(testDoc.getLine(162)).toBe("    isReadOnly  : false,");
                    expect(testDoc.getLine(163)).toBe("    get isReadOnly() {");
                    expect(testDoc.getLine(164)).toBe("        return this.isReadOnly;");
                    expect(testDoc.getLine(165)).toBe("    },");
                    expect(testDoc.getLine(167)).toBe("    set isReadOnly(val) {");
                    expect(testDoc.getLine(168)).toBe("        this.isReadOnly = val;");
                    expect(testDoc.getLine(169)).toBe("    }");
                });
            });
        });
    });

 */
});

/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
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

/*global Phoenix*/
// @INCLUDE_IN_API_DOCS
/**
 * Phoenix houses a file indexing worker which caches all cacheable files of a project in memory.
 * This module can be used to communicate with the Index and extend it by attaching new js worker scripts to the
 * indexing worker as discussed below. Any extension that works on a large number of files should use the indexing
 * worker cache to free up the main thread of heavy computation.
 *
 * ## Import
 * ```js
 * // usage within extensions:
 * const IndexingWorker = brackets.getModule("worker/IndexingWorker");
 * ```
 * ## Extending the indexing worker
 * You can add your own custom scripts to the indexing worker by following the below example. Suppose you have an
 * extension folder with the following structure:
 * ```
 * myExtensionFolder
 * │  my_worker.js // the script that you need to attach to the web worker
 * │  main.js
 * ```
 * In `main.js` extension module, we can import `my_worker.js` script into `IndexingWorker` by:
 * ```js
 * let ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
 * let workerPath = ExtensionUtils.getModulePath(module, "my_worker.js")
 * IndexingWorker.loadScriptInWorker(workerPath);
 * ```
 *
 * Once the worker script is loaded with the above step, we can communicate with it using the either `IndexingWorker`
 * reference within Phoenix or the global `WorkerComm` reference within the Indexing worker.
 * All utility methods in module [worker/WorkerComm](WorkerComm-API) can be used for worker communication.
 *
 * NB: You can use all util methods available in `worker/WorkerComm` as `IndexingWorker` internally uses `WorkerComm`
 * to communicate with the underlying worker thread.
 *
 * @module worker/IndexingWorker
 */
define(function (require, exports, module) {
    const WorkerComm = require("worker/WorkerComm"),
        EventDispatcher = require("utils/EventDispatcher");

    const _FileIndexingWorker = new Worker(
        `${Phoenix.baseURL}worker/file-Indexing-Worker.js?debug=${window.logToConsolePref === 'true'}`);

    if(!_FileIndexingWorker){
        console.error("Could not load find in files worker! Search will be disabled.");
    }
    EventDispatcher.makeEventDispatcher(exports);
    WorkerComm.createWorkerComm(_FileIndexingWorker, exports);
    /**
     * To communicate between the IndexingWorker and Phoenix, the following methods are available:
     * `loadScriptInWorker`, `execPeer`, `setExecHandler`, `triggerPeer` and other APIs described
     * in module `worker/WorkerComm`.
     * The above methods can be used with either `IndexingWorker` reference within Phoenix
     * or the global `WorkerComm` reference within the Indexing worker. (See example below.)
     *
     * See [worker/WorkerComm](WorkerComm-API) for detailed API docs.
     *
     * @example <caption>To Execute a named function `sayHello` in the worker from phoenix</caption>
     * // in my_worker.js
     * WorkerComm.setExecHandler("sayHello", (arg)=>{
     *     console.log("hello from worker ", arg); // prints "hello from worker phoenix"
     *     return "Hello Phoenix";
     *   });
     * // In Phoenix/extension
     * let workerMessage = await IndexingWorker.execPeer("sayHello", "phoenix");
     * console.log(workerMessage); // prints "Hello Phoenix"
     * @name WorkerComm-APIS
     */

    /**
     * Raised when crawling started in the indexing worker.
     * @event EVENT_CRAWL_STARTED
     * @type {null}
     */
    exports.EVENT_CRAWL_STARTED = "crawlStarted";
    /**
     * Raised when crawling in progressing within the worker. The handler will receive the
     * following properties as parameter.
     * @event EVENT_CRAWL_PROGRESS
     * @type {object}
     * @property {number} processed The number of files cached till now.
     * @property {number} total Number of files to cache.
     */
    exports.EVENT_CRAWL_PROGRESS = "crawlProgress";
    /**
     * Raised when crawling is complete within the worker. The handler will receive the
     * following properties as parameter.
     * @event EVENT_CRAWL_COMPLETE
     * @type {object}
     * @property {number} numFilesCached
     * @property {number} cacheSizeBytes
     * @property {number} crawlTimeMs in milliseconds.
     */
    exports.EVENT_CRAWL_COMPLETE = "crawlComplete";
});

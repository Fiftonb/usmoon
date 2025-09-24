## Local Installation

Check here for examples: https://github.com/naptha/tesseract.js/blob/master/docs/examples.md 

In browser environment, `tesseract.js` simply provides the API layer. Internally, it opens a WebWorker to handle requests. That worker itself loads code from the Emscripten-built `tesseract.js-core` which itself is hosted on a CDN. Then it dynamically loads language files hosted on another CDN.

Because of this we recommend loading `tesseract.js` from a CDN. But if you really need to have all your files local, you can pass extra arguments to `TesseractWorker` to specify custom paths for workers, languages, and core.

In Node.js environment, the only path you may want to customize is languages/langPath.

```javascript
const worker = await createWorker('eng', 1, {
  workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
  corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0',
});
```

### workerPath
A string specifying the location of the `worker.js` file.

### langPath
A string specifying the location of the tesseract language files. Language file URLs are calculated according to the formula `langPath + langCode + '.traineddata.gz'`.  If `langPath` is not specified by the user, then the correct language data will be automatically downloaded from the jsDelivr CDN. 

### corePath
A string specifying the location of the [tesseract.js-core](https://github.com/naptha/tesseract.js-core) files, with default value 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0'.

If you set the `corePath` argument, be sure to set it to a directory that contains **all 4** of these files:

1. `tesseract-core.wasm.js`
2. `tesseract-core-simd.wasm.js`
3. `tesseract-core-lstm.wasm.js`
4. `tesseract-core-simd-lstm.wasm.js`

Tesseract.js will pick the correct file based on your users' device and the `createWorker` options. 

To avoid breaking old code, when `corePath` is set to a specific `.js` file (e.g. `https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js`), it will load that file regardless of whether the users' device supports SIMD or not.  This behavior only exists to preserve backwards compatibility—setting `corePath` to a specific `.js` file is strongly discouraged.  Doing so will either result in much slower performance (if `tesseract-core.wasm.js` is specified) or failure to run on certain devices (if `tesseract-core-simd.wasm.js` is specified).

# Tesseract.js Examples

You can also check [examples](../examples) folder.

### basic

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng');

(async () => {
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();
```

### with detailed progress 

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng', 1, {
  logger: m => console.log(m), // Add logger here
});

(async () => {
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();
```

### with multiple languages, separate by '+'

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker(['eng', 'chi_tra']);

(async () => {
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();
```
### with whitelist char

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng');

(async () => {
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789',
  });
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();
```

### with different pageseg mode

Check here for more details of pageseg mode: https://github.com/tesseract-ocr/tesseract/blob/4.0.0/src/ccstruct/publictypes.h#L163

```javascript
const { createWorker, PSM } = require('tesseract.js');

const worker = await createWorker('eng');

(async () => {
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  });
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
  console.log(text);
  await worker.terminate();
})();
```

### with pdf output

Please check **examples** folder for details.

Browser: [download-pdf.html](../examples/browser/download-pdf.html)
Node: [download-pdf.js](../examples/node/download-pdf.js)

### with only part of the image (^2.0.1)

**One rectangle**

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng');
const rectangle = { left: 0, top: 0, width: 500, height: 250 };

(async () => {
  const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png', { rectangle });
  console.log(text);
  await worker.terminate();
})();
```

**Multiple Rectangles**

```javascript
const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng');
const rectangles = [
  {
    left: 0,
    top: 0,
    width: 500,
    height: 250,
  },
  {
    left: 500,
    top: 0,
    width: 500,
    height: 250,
  },
];

(async () => {
  const values = [];
  for (let i = 0; i < rectangles.length; i++) {
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png', { rectangle: rectangles[i] });
    values.push(text);
  }
  console.log(values);
  await worker.terminate();
})();
```

**Multiple Rectangles (with scheduler to do recognition in parallel)**

```javascript
const { createWorker, createScheduler } = require('tesseract.js');

const scheduler = createScheduler();
const worker1 = await createWorker('eng');
const worker2 = await createWorker('eng');
const rectangles = [
  {
    left: 0,
    top: 0,
    width: 500,
    height: 250,
  },
  {
    left: 500,
    top: 0,
    width: 500,
    height: 250,
  },
];

(async () => {
  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);
  const results = await Promise.all(rectangles.map((rectangle) => (
    scheduler.addJob('recognize', 'https://tesseract.projectnaptha.com/img/eng_bw.png', { rectangle })
  )));
  console.log(results.map(r => r.data.text));
  await scheduler.terminate();
})();
```

### with multiple workers to speed up

```javascript
const { createWorker, createScheduler } = require('tesseract.js');

const scheduler = createScheduler();
const worker1 = await createWorker('eng');
const worker2 = await createWorker('eng');

(async () => {
  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);
  /** Add 10 recognition jobs */
  const results = await Promise.all(Array(10).fill(0).map(() => (
    scheduler.addJob('recognize', 'https://tesseract.projectnaptha.com/img/eng_bw.png')
  )))
  console.log(results);
  await scheduler.terminate(); // It also terminates all workers.
})();
```

# Overview
Tesseract.js offers 2 ways to run recognition jobs: (1) using a worker directly, or (2) using a scheduler to run jobs on multiple workers in parallel.  The syntax for the latter is more complicated, but using parallel processing via schedulers provides significantly better performance for large jobs.  For more detailed documentation on each function, see the [api page](./api.md). 

# Option 1: Using Workers Directly
The following snippet recognizes text from an image using a single worker.

```javascript
(async () => {
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    console.log(text);
    await worker.terminate();
})();
```

In actual use, the `createWorker` step should be separated from the `worker.recognize` step.  Doing so enables the following benefits:
1.	Workers can be prepared ahead of time
    - E.g. a worker can be created when the page is first loaded, rather than waiting for a user to upload an image to recognize
1.	Workers can be reused for multiple recognition jobs, rather than creating a new worker and loading language data for every image recognized
    - Remember to call `worker.terminate()` after all recognition is complete to free memory

# Option 2: Using Schedulers + Workers
Tesseract.js also supports executing jobs using schedulers.  A scheduler is an object that contains multiple workers, which it uses to execute jobs in parallel.  For example, the following code executes 10 jobs in parallel using 4 workers.
 
```javascript
const scheduler = Tesseract.createScheduler();

// Creates worker and adds to scheduler
const workerGen = async () => {
  const worker = await Tesseract.createWorker('eng');
  scheduler.addWorker(worker);
}

const workerN = 4;
(async () => {
  const resArr = Array(workerN);
  for (let i=0; i<workerN; i++) {
    resArr[i] = workerGen();
  }
  await Promise.all(resArr);
  /** Add 10 recognition jobs */
  const results = await Promise.all(Array(10).fill(0).map(() => (
    scheduler.addJob('recognize', 'https://tesseract.projectnaptha.com/img/eng_bw.png').then((x) => console.log(x.data.text))
  )))
  await scheduler.terminate(); // It also terminates all workers.
})();
```

While using schedulers is no more efficient for a single job, they allow for quickly executing large numbers of jobs in parallel. 

When working with schedulers, note that workers added to the same scheduler should all be homogenous—they should have the same language be configured with the same parameters.  Schedulers assign jobs to workers in a non-deterministic manner, so if the workers are not identical then recognition results will depend on which worker the job is assigned to. 

# Reusing Workers in Node.js Server Code
While workers and schedulers are reusable, and we recommend reusing them between jobs, using the same worker/scheduler for a week straight within Node.js server code will cause problems.  Therefore, when using workers/schedulers within long-running Node.js server code, workers/schedulers should be killed and re-created every so often.  For example, a scheduler could be terminated and re-created after every 500 jobs.  

There are a couple reasons why periodically “resetting” workers/schedulers within server code is a good practice.  First, due to general WebAssembly limitations, the memory allocated to workers can only expand over time.  Therefore, a single large image will permanently increase the memory footprint of a worker.  Second, workers “learn” over time by adding additional words they encounter in jobs to their internal dictionaries.  While this behavior is useful within the context of a single document or group of documents, it is not necessarily desirable if recognizing hundreds of unrelated documents.  If a single scheduler runs thousands of jobs over an entire week, the internal dictionary will eventually become bloated and include typos.

# Image Format

The main Tesseract.js functions (ex. recognize, detect) take an `image` parameter.  The image formats and data types supported are listed below. 

Support Image Formats: **bmp, jpg, png, pbm, webp**

For browser and Node, supported data types are:
 - string with base64 encoded image (fits `data:image\/([a-zA-Z]*);base64,([^"]*)` regexp)
 - buffer

For browser only, supported data types are:
 - `File` or `Blob` object
 - `img` or `canvas` element

For Node only, supported data types are:
 - string containing a path to local image

Note: images must be a supported image format **and** a supported data type.  For example, a buffer containing a png image is supported.  A buffer containing raw pixel data is not supported. 

FAQ
===

# Project
## What is the scope of this project? 
Tesseract.js is the JavaScript/Webassembly port of the Tesseract OCR engine.  We do not edit the underlying Tesseract recognition engine in any way.  Therefore, if you encounter bugs caused by the Tesseract engine you may open an issue here for the purposes of raising awareness to other users, but fixing is outside the scope of this repository. 

If you encounter a Tesseract bug you would like to see fixed you should confirm the behavior is the same in the [main (CLI) version](https://github.com/tesseract-ocr/tesseract) of Tesseract and then open a Git Issue in that repository.    

# Frameworks

## What JavaScript frameworks are supported?
Tesseract.js supports all frameworks that support JavaScript and WebAssembly.  The only common JavaScript framework known to not be supported is React Native, as it does not support WebAssembly.
## Why am I getting a `Cannot find module` error when running in my project/framework? 
If you are able to run the examples in the [examples directory](https://github.com/naptha/tesseract.js/tree/master/examples), however are getting a `cannot find module` error when run in your framework, this indicates the main Tesseract.js thread is unable to find the worker code.  

This can be resolved by manually setting the `workerPath` argument to point to the local copy of `worker-script/node/index.js` (Node.js) or `worker.min.js` (browser).  For example, the using the following arguments resolved for one Node.js user in [this issue](https://github.com/naptha/tesseract.js/issues/868#issuecomment-1879235802).  You may need to edit the file paths to work with your system/project.

```
const worker = await createWorker("eng", 1, {workerPath: "./node_modules/tesseract.js/src/worker-script/node/index.js"});
```

For context, Tesseract.js "workers" get their own web worker (browser) or worker thread (Node.js), which is independent code that uses a different entry point. When Tesseract.js is used on its own, this entrypoint should be identified automatically. However, this may not hold with build systems implemented by various frameworks, as these build systems copy around files in a way that violates Tesseract.js's assumptions for where files are located.

# Recognizing Text
## Are PDF files supported? 
Tesseract.js does not support PDF files.  If you need to run OCR on PDF files, possible options are below.

### Use Scribe.js
[Scribe.js](https://github.com/scribeocr/scribe.js) is a library that builds on Tesseract.js and includes additional features, including native PDF support.  Scribe.js supports running OCR on PDF files.  Additionally, Scribe.js supports extracting text directly from text-native PDF files, which is significantly faster and more accurate compared to running OCR. 

### Render PDFs to Images
The only way to recognize PDF files using Tesseract.js is to use a third-party library to render the `.pdf` file to a series of `.png` images, and then recognize those images using Tesseract.js.  Libraries to consider are listed below.
1. [PDF.js](https://github.com/mozilla/pdf.js/) (Apache-2.0 license)
2. [muPDF](https://github.com/ArtifexSoftware/mupdf) (AGPL-3.0 license)

## What configuration settings should I use? 
Default settings should provide optimal results for most users.  If you do want to experiment with configuration settings, Tesseract does include many settings to change—the vast majority are documented in the [main Tesseract project](https://github.com/tesseract-ocr/tesseract) and not here.  As noted above (“what is the scope of this project”), the core recognition engine is inherited from the main Tesseract project—all of the configuration settings in Tesseract work identically in Tesseract.js.  Therefore, for specific questions about configuring recognition settings (e.g. “how can I make noise removal more/less aggressive” or “what settings work best for license plates”) you are more likely to find an answer in the Tesseract documentation/discussion versus only looking in this repo.  

## Is handwritten text supported? 
No.  The Tesseract OCR model is built around assumptions that only hold for printed text.  No combination of options will significantly improve performance with handwritten text.  Unless your handwriting is so good that it closely resembles printed text, the results will be poor.

## Why am I getting different results vs. Tesseract CLI?
Tesseract.js should produce results identical to using the Tesseract CLI, as long as the settings, language data, and version are identical.  If you are observing differences between Tesseract.js and the Tesseract CLI/API, and this difference is problematic, perform the following troubleshooting steps.

1. Confirm parameters are identical.
	1. Manually set `oem` and `psm` in both to account for different defaults.
		1. Tesseract.js and the Tesseract CLI use different default `oem` and `psm` settings.
			1. Tesseract.js uses a default `oem` of `1` (`lstm` model only), while the Tesseract CLI uses a default `oem` of `2` (`lstm` with `legacy` fallback).
			2. Tesseract.js and the Tesseract API use a default `pms` of `6` (`PSM_SINGLE_BLOCK`), while the Tesseract CLI uses a default `psm` of `3` (`PSM_AUTO`).
	2. Confirm that all user-set parameters are identical.
2. Confirm language data is identical.
    1. By default, when run with `oem` value `0` or `2`, Tesseract.js uses [these](https://github.com/naptha/tessdata/tree/gh-pages/4.0.0) language files.
       1. These were taken from the [tessdata](https://github.com/tesseract-ocr/tessdata) repo in the main Tesseract project.
    3. By default, when run with `oem` value `1`, Tesseract.js uses [these](https://github.com/naptha/tessdata/tree/gh-pages/4.0.0_best_int) language files.
       1. These were created by integerizing the language files from the [tessdata_best](https://github.com/tesseract-ocr/tessdata_best) repo in the main Tesseract project.
          1. This should be equivalent to using the LSTM language files from the [tessdata](https://github.com/tesseract-ocr/tessdata) which are created by combining an integerized version of `tessdata_best` with data for the Legacy model.
3. Confirm version is identical.
	1. Using a different version of Tesseract may result in different recognition results.
	2. The exact version of Tesseract used for Tesseract.js can be found by clicking on the `tesseract` submodule in this directory:
		1. https://github.com/naptha/tesseract.js-core/tree/master/third_party

If you find that results differ between Tesseract.js and Tesseract CLI and the settings, language data, and version are identical, feel free to open a Git Issue with a reproducible example.  

Additionally, feel free to open a Git Issue (with reproducible example) if you find that a **newer** version of Tesseract produces significantly better results, and we can prioritize updating Tesseract to the latest version.  If an older version of Tesseract produces significantly better results, then that regression should be raised with the main Tesseract project, as Tesseract.js will not be downgraded to an earlier version.

# Trained Data
## How does tesseract.js download and keep \*.traineddata?

During the downloading of language model, Tesseract.js will first check if \*.traineddata already exists. (browser: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), Node.js: fs, in the folder you execute the command) If the \*.traineddata doesn't exist, it will fetch \*.traineddata.gz from [tessdata](https://github.com/naptha/tessdata), ungzip and store in IndexedDB or fs, you can delete it manually and it will download again for you.

## How can I train my own \*.traineddata?

See the documentation from the main [Tesseract project](https://tesseract-ocr.github.io/tessdoc/) for training instructions. 

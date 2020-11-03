#!/usr/bin/env node

"use strict";

var path = require("path");
var fs = require("fs");
const { Transform } = require("stream");
const zlib = require("zlib");
const CAF = require("caf");

// ************
var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "uncompress"],
  string: ["file"],
});

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);
var OUTFILE = path.join(BASE_PATH, "out.txt");

processFile = CAF(processFile);

function streamComplete(stream) {
  return new Promise(function c(res) {
    stream.on("end", res);
  });
}

// ************
if (args.help) {
  printHelp();
} else if (args.example) {
  exampleOutputs();
} else if (args.in || args._.includes("-")) {
  let tooLong = CAF.timeout(12, "Took too long!");
  processFile(tooLong, process.stdin).catch(error);
} else if (args.file) {
  let filepath = path.join(BASE_PATH, args.file);
  let stream = fs.createReadStream(filepath);
  let tooLong = CAF.timeout(12, "Took too long!");

  processFile(tooLong, stream)
    .then(() => {
      console.log("Complete");
    })
    .catch(error);
} else {
  error("Incorrect usage.", true);
}

// ************
function exampleOutputs() {
  // process.stdin.read();
  console.log("Hello World");
  process.stdout.write("Hello World");
  console.error("oops");
}

function printHelp() {
  console.log("ex3 usage:");
  console.log("  --help: print this help");
  console.log("  --in, -: process stdin");
  console.log("  --out, -: print to stdout");
  console.log("  --file={FILENAME}: outputs file");
  console.log("  --compress: gzip outputs file");
  console.log("  --uncompress: decompress the gzip outputs file");
  console.log("  --example: outputs example streams");
}

function* processFile(signal, inStream) {
  var outStream = inStream;

  if (args.uncompress) {
    let gunzipStream = zlib.createGunzip();
    inStream = outStream.pipe(gunzipStream);
  }

  var upperStream = new Transform({
    transform(chunk, enc, cb) {
      this.push(chunk.toString().toUpperCase());
      cb();
    },
  });

  outStream = inStream.pipe(upperStream);

  if (args.compress) {
    let gzipStream = zlib.createGzip();
    outStream = outStream.pipe(gzipStream);
    OUTFILE = `${OUTFILE}.gz`;
  }

  var targetStream;
  if (args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = fs.createWriteStream(OUTFILE);
  }

  outStream.pipe(targetStream);

  signal.pr.catch(function f() {
    outStream.unpipe(targetStream);
    outStream.destroy();
  });

  yield streamComplete(outStream);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

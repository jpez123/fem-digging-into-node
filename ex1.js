#!/usr/bin/env node

"use strict";

var getStdin = require("get-stdin");
var path = require("path");
var fs = require("fs");

var args = require("minimist")(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"],
});

var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

if (args.help) {
  printHelp();
} else if (args.example) {
  exampleOutputs();
} else if (args.in || args._.includes("-")) {
  getStdin().then(processFile).catch(error);
} else if (args.file) {
  let filepath = path.join(BASE_PATH, args.file);
  fs.readFile(filepath, (err, content) => {
    if (err) {
      error(err.toString());
    } else {
      processFile(content.toString());
    }
  });
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
  console.log("ex1 usage:");
  console.log("  --help: print this help");
  console.log("  --in, -: process stdin");
  console.log("  --file={FILENAME}: outputs file");
  console.log("  --example: outputs example streams");
}

function processFile(contents) {
  contents = contents.toUpperCase();
  process.stdout.write(contents);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  if (includeHelp) {
    console.log("");
    printHelp();
  }
}

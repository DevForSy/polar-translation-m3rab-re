ged entry point: the real main process lives in electron.jsc (V8
// bytecode compiled from electron.cjs at build time), so the source is not
// shipped in a readable form. bytenode registers the .jsc loader.
require("bytenode");
require("./electron.jsc");
ÏÞÀmPOL
#!/usr/bin/env node
var fs = require('fs');

var mceditExporter = require('../');

var width = 100, height = 100, depth = 100, code = false;

var isNextWidth = false, isNextHeight = false, isNextDepth = false, isNextCode = false;
for (var i = 2; i < process.argv.length; i++) {
    var arg = process.argv[i];
    var wasMatch = true;

    if (isNextWidth) {
        width = parseInt(arg);
        if (isNaN(width)) {
            console.error("Invalid value for --width: " + arg);
            showHelp();
        }

        isNextWidth = false;
    } else if (isNextHeight) {
        height = parseInt(arg);
        if (isNaN(height)) {
            console.error("Invalid value for --height: " + arg);
            showHelp();
        }

        isNextHeight = false;
    } else if (isNextDepth) {
        depth = parseInt(arg);
        if (isNaN(depth)) {
            console.error("Invalid value for --depth: " + arg);
            showHelp();
        }

        isNextDepth = false;
    } else if (isNextCode) {
        console.log("Code!");
        code = arg;
        isNextCode = false;
    } else {
        switch(arg) {
            case '--help':
                showHelp();
                break;
            case '-w':
            case '--width':
                isNextWidth = true;
                break;
            case '-h':
            case '--height':
                isNextHeight = true;
                break;
            case '-d':
            case '--depth':
                isNextDepth = true;
                break;
            case '-c':
            case '--code':
                isNextCode = true;
                break;
            default:
                if (arg[0] === "-") {
                    console.error("Unknown command-line option: " + arg);
                    showHelp();
                } else wasMatch = false;
        }
    }

    if (wasMatch) {
        process.argv.splice(i, 1);
        i--;
    }
}

function showHelp() {
    console.error("\n  Usage: mcil-mcedit [file] <schematic> [--help] [-w <width>] [--width <width>] [-h <height>]");
    console.error(  "                     [--height <height>] [-d <depth>] [--depth <depth>] [-c <input>]");
    console.error(  "                     [--code <input>]");
    console.error("\nParses MCIL and creates an MCEdit schematic file. Use stdin, [file], or --code to provide the MCIL");
    console.error(  "code.");
    console.error("\n  Options:");
    console.error(  "      file");
    console.error(  "          An input MCIL file.");
    console.error("\n      schematic");
    console.error(  "          The output schematic file.");
    console.error("\n      --help");
    console.error(  "          Show this help message.");
    console.error("\n      -w <width>, --width <width>");
    console.error(  "          Sets the maximum schematic width (X-axis), default is 100.");
    console.error("\n      -h <height>, --height <height>");
    console.error(  "          Sets the maximum schematic height (Y-axis), default is 100.");
    console.error("\n      -d <depth>, --depth <depth>");
    console.error(  "          Sets the maximum schematic depth (Z-axis), default is 100.");
    console.error("\n      -c <input>, --code <input>");
    console.error(  "          Parses the provided code instead of the file or stdin.");
    process.exit(1);
}

var mcilJson = "";

if (process.argv.length < 3) {
    console.error("Required parameter schematic was not provided");
    showHelp();
}

var schematicFile;
if (process.argv.length === 3) {
    schematicFile = process.argv[2];
    process.argv.splice(2, 1);
} else {
    schematicFile = process.argv[3];
    process.argv.splice(3, 1);
}

if (code) {
    mcilJson = code;
    ready();
} else if (process.argv.length > 2) {
    try {
        mcilJson = fs.readFileSync(process.argv[2], 'utf8');
        ready();
    } catch (ex) {
        console.error("Could not read MCIL file");
        console.error(ex.stack);
        process.exit(1);
    }
} else {
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function() {
        var chunk = process.stdin.read();
        if (chunk !== null) mcilJson += chunk;
    });
    process.stdin.on('end', ready);
}

function ready() {
    var buffer;
    try {
        var startTime = Date.now();
        buffer = mceditExporter.export(JSON.parse(mcilJson), {
            width: width,
            height: height,
            depth: depth
        });
        var endTime = Date.now();
    } catch (ex) {
        console.error("Could not create schematic");
        console.error(ex.stack);
        process.exit(1);
    }

    try {
        fs.writeFileSync(schematicFile, buffer);
    } catch (ex) {
        console.error("Could not write schematic file");
        console.error(ex.stack);
        process.exit(1);
    }

    console.log("\nFinished after " + (endTime - startTime) + "ms");
}
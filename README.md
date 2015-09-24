# MCEdit Exporter

Converts MCIL code to an MCEdit-style schematic, which can then be imported into Minecraft tools such as MCEdit and WorldEdit.

## Installation

The compiler is available from [NPM](https://npmjs.org)

Install for command-line usage:

```bash
$ npm install mca-compiler -g
```

Install for Node-based usage:

```bash
$ npm install mca-compiler --save
```

## Command-line Usage

The exporter provides one command, named `mcil-mcedit`, which accepts a JSON-formatted MCIL object, and outputs an NBT schematic file.

Usage:

```
mcil-mcedit [file] <schematic> [--help] [-w <width>] [--width <width>] [-h <height>]
            [--height <height>] [-d <depth>] [--depth <depth>] [-c <input>]
            [--code <input>]
```

`mcil-mcedit` takes MCIL code from `--code` (`-c` for short), `[file]` (a file path), or stdin (in that order), and converts it to an MCEdit schematic. The `--width`, `--height`, and `--depth` flags (`-w`, `-h` and `-d` for short) allow the maximum schematic size of (100, 100, 100) to be changed.

The exported schematic file will be saved to the path specified in the `<schematic>` argument.

## Node Usage

Three functions are provided: `export`, `exportToFile`, and `exportToFileSync`.

### `.export(code, dimensions)`

**Arguments:**

 - `code` - A Javascript object (_not_ a JSON string), containing the MCIL instructions.
 - `dimensions` - A Javascript object with three numeric properties: `width`, `height`, and `depth`. Specifies the _maximum_ dimensions for the resulting schematic (note: the schematic could be smaller)

**Returns:** a `Buffer` object with the NBT binary data.

Creates an NBT-formatted schematic `Buffer` from the provided MCIL `code`. The dimensions of the schematic are determined based on the positions of blocks (i.e the schematic will be as small as possible without excluding blocks), however will never be larger than the `dimensions` provided.

**Example:**

```js
var mceditExporter = require('mcil-mcedit');

var code = [
  [
    {
      type: "command",
      command: "say",
      params: "Ready?"
    },
    {
      type: "wait",
      duration: 10
    },
    {
      type: "command",
      command: "say",
      params: "GO!"
    }
  ]
];

var buffer = mceditExporter.export(code, {
  width: 50,
  height: 50,
  depth: 50
});
```

### `.exportToFile(file, code, dimensions, cb)`

 - `file` - The location of the file to save the schematic as.
 - `code` - See `.export`.
 - `dimensions` - See `.export`.
 - `cb` - A function to be called when saving is completed. Called with one argument, `error` which is defined if a write error occurred.

Exports a schematic and asynchronously saves to a file. See `.export` for more information.

**Example:**
```js
var mceditExporter = require('mcil-mcedit');

var code = [
  [
    {
      type: "command",
      command: "say",
      params: "Ready?"
    },
    {
      type: "wait",
      duration: 10
    },
    {
      type: "command",
      command: "say",
      params: "GO!"
    }
  ]
];

mceditExporter.exportToFile("countdown.schematic", code, {
  width: 50,
  height: 50,
  depth: 50
}, function(err) {
  if (err) console.error(err);
  else console.log("Saved the schematic!");
});
```

### `.exportToFileSync(file, code, dimensions)`

 - `file` - The location of the file to save the schematic as.
 - `code` - See `.export`.
 - `dimensions` - See `.export`.

Exports a schematic and synchronously saves to a file. See `.export` for more information.

**Example:**
```js
var mceditExporter = require('mcil-mcedit');

var code = [
  [
    {
      type: "command",
      command: "say",
      params: "Ready?"
    },
    {
      type: "wait",
      duration: 10
    },
    {
      type: "command",
      command: "say",
      params: "GO!"
    }
  ]
];

try {
  mceditExporter.exportToFileSync("countdown.schematic", code, {
    width: 50,
    height: 50,
    depth: 50
  });
  console.log("Saved the schematic!");
} catch (ex) {
  console.error(ex);
}
```

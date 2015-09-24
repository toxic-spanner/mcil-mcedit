var fs = require('fs');
var mcil = require('mcil-common');
var nbt = require('prismarine-nbt');

var blockMap = {
    "minecraft:command_block": 137,
    "minecraft:repeating_command_block": 210,
    "minecraft:chain_command_block": 211,
    "minecraft:unpowered_repeater": 93,
    "minecraft:powered_repeater": 94
};

exports.export = function(code, dimensions) {

    var blocks = [];

    var realWidth = 0, realHeight = 0, realDepth = 0;

    mcil.walk(code, dimensions, function(block) {
        blocks.push(block);
        if (block.x + 1 > realWidth) realWidth = block.x + 1;
        if (block.y + 1 > realHeight) realHeight = block.y + 1;
        if (block.z + 1 > realDepth) realDepth = block.z + 1;
    });

    var blockEntities = [];

    var bufferSize = realWidth * realHeight * realDepth;
    var blockIds = new Buffer(bufferSize);
    blockIds.fill(0);

    var blockData = new Buffer(bufferSize);
    blockData.fill(0);

    var blockBiomes = new Buffer(bufferSize);
    blockBiomes.fill(1); // plains

    blocks.forEach(function(block) {
        var name = block.name;
        if (name.indexOf("minecraft:") !== 0) name = "minecraft:" + name;

        var index = (block.y * dimensions.depth + block.z) * dimensions.width + block.x;
        blockIds[index] = blockMap[name];
        blockData[index] = block.damage;

        if (block.nbt) {
            var obj = {
                id: {
                    type: "string",
                    value: block.nbt.id
                },
                x: {
                    type: "int",
                    value: block.nbt.x
                },
                y: {
                    type: "int",
                    value: block.nbt.y
                },
                z: {
                    type: "int",
                    value: block.nbt.z
                }
            };

            if (name.indexOf("command_block") !== -1) {
                obj.auto = {
                    type: "byte",
                    value: block.nbt.auto
                };
                obj.Command = {
                    type: "string",
                    value: block.nbt.Command
                };
                obj.conditionMet = {
                    type: "byte",
                    value: block.nbt.conditionMet
                };
                obj.CustomName = {
                    type: "string",
                    value: block.nbt.CustomName
                };
                obj.powered = {
                    type: "byte",
                    value: block.nbt.powered
                };
                obj.SuccessCount = {
                    type: "int",
                    value: block.nbt.SuccessCount
                };
                obj.TrackOutput = {
                    type: "byte",
                    value: block.nbt.TrackOutput
                };
            }

            blockEntities.push(obj);
        }
    });

    var nbtContent = {
        root: "Schematic",
        value: {
            Width: {
                type: "short",
                value: realWidth
            },
            Height: {
                type: "short",
                value: realHeight
            },
            Length: {
                type: "short",
                value: realDepth
            },
            Materials: {
                type: "string",
                value: "Alpha"
            },
            Entities: {
                type: "list",
                value: {
                    type: "compound",
                    value: []
                }
            },
            TileEntities: {
                type: "list",
                value: {
                    type: "compound",
                    value: blockEntities
                }
            },
            Biomes: {
                type: "byteArray",
                value: blockBiomes
            },
            Blocks: {
                type: "byteArray",
                value: blockIds
            },
            Data: {
                type: "byteArray",
                value: blockData
            }
        }
    };

    return nbt.writeUncompressed(nbtContent);
};

exports.exportToFile = function(file, code, dimensions, cb) {
    fs.writeFile(file, exports.export(code, dimensions), cb);
};

exports.exportToFileSync = function(code, dimensions, file) {
    return fs.writeFileSync(file, exports.export(code, dimensions));
};
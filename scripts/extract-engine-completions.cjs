#!/usr/bin/env node

/*
 * Regenerates src/server/data/engineFunctions.json from a folder of .gml
 * scripts unpacked from a CMC+/SSBC .gmk with gmk-splitter
 * (https://github.com/Medo42/Gmk-Splitter).
 *
 * Usage: node scripts/extract-engine-completions.cjs <ScriptsFolder> [outputFile]
 */

const fs = require("fs");
const path = require("path");

const scriptsDir = process.argv[2];
const outFile = process.argv[3]
    || path.join(__dirname, "..", "src", "server", "data", "engineFunctions.json");

if (!scriptsDir) {
    console.error("Usage: node scripts/extract-engine-completions.cjs <ScriptsFolder> [outputFile]");
    process.exit(1);
}

/** Best-effort one-line description for a script: the first non-empty line of its leading "/* *\/" doc block, or its leading "//" comments, whichever is present. */
function extractDetail(content) {

    const blockMatch = content.match(/\/\*([\s\S]*?)\*\//);

    if (blockMatch) {
        const line = blockMatch[1]
            .split(/\r?\n/)
            .map(l => l.trim())
            .find(l => l.length > 0);
        if (line) return line.slice(0, 160);
    }

    const lineComments = [];
    for (const raw of content.split(/\r?\n/)) {
        const line = raw.trim();
        if (line.startsWith("//")) {
            const text = line.replace(/^\/\/+/, "").trim();
            if (text) lineComments.push(text);
        } else if (line.length === 0 && lineComments.length === 0) {
            continue;
        } else {
            break;
        }
    }

    return lineComments.length > 0 ? lineComments[0].slice(0, 160) : "";

}

/** GM8 scripts don't declare a parameter list; this infers one from the highest argumentN referenced anywhere in the body. */
function extractArity(content) {

    let maxArg = -1;
    const re = /\bargument(\d+)\b/g;
    let match;

    while ((match = re.exec(content)) !== null) {
        const n = parseInt(match[1], 10);
        if (n > maxArg) maxArg = n;
    }

    return maxArg + 1;

}

const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith(".gml"));

const entries = files.map(file => {

    const name = file.slice(0, -4);
    const content = fs.readFileSync(path.join(scriptsDir, file), "utf8");

    return {
        name,
        params: Array.from(
            { length: extractArity(content) },
            (_, i) => `argument${i}`
        ),
        detail: extractDetail(content)
    };

});

entries.sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(entries, null, 2));

console.log(`Wrote ${entries.length} engine functions to ${outFile}`);

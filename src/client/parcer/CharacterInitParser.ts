import * as fs from "fs";
import { CharacterInitFile } from "../models/CharacterInitFile";
import {InitSection} from "../models/CharacterInitFile";

export class CharacterInitParser {

    public static read(file: string): CharacterInitFile {

        const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

        const init: CharacterInitFile = {
            sections: []
        };

        let currentSection : InitSection = {
            name: "Global",
            entries: []
        };

        init.sections.push(currentSection);

        for (const line of lines) {

            const trimmed = line.trim();

            if (!trimmed.startsWith("//")){
                const functionRegex = /^\s*(?:(\w+)\s*=\s*)?(\w+)\((.*)\)\s*;?$/;
                const functionMatch = trimmed.match(functionRegex);

                if (functionMatch) {

                    currentSection.entries.push({

                        type: "function",

                        variable: functionMatch[1],

                        function: functionMatch[2],

                        args: CharacterInitParser.parseArguments(functionMatch[3])

                    });

                    continue;
                }

                const assignmentRegex = /^\s*(\w+)\s*=\s*(.+?)\s*;?$/;
                const assignmentMatch = trimmed.match(assignmentRegex);

                if (assignmentMatch) {

                    currentSection.entries.push({

                        type: "assignment",

                        variable: assignmentMatch[1],

                        value: assignmentMatch[2]

                    });

                    continue;
                }
            }

            currentSection.entries.push({type: "raw", raw: line});

        }

        return init;
    }

    public static write(file: string, data: CharacterInitFile): void {

        const output: string[] = [];

        // TODO: serialization

        fs.writeFileSync(file, output.join("\n"), "utf8");

    }

    private static parseArguments(args: string): string[] {

        return args
            .split(",")
            .map(a => a.trim().replace(/^"(.*)"$/, "$1"));

    }

}
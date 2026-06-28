import * as fs from "fs";
import { CrusadeAnalyzer } from "./CrusadeAnalyzer";
import { CrusadeNode } from "../explorer/crusadeNode";

export class ItemAnalyzer extends CrusadeAnalyzer {

    analyze(folder: string): CrusadeNode[] {

        const files = fs.readdirSync(folder);

        return [

            this.group(
                "⚙ Script",
                files,
                folder,
                ["main.txt"]
            ),

            this.category(
                "🖼 Sprites",
                files.filter(f =>
                    /\.(png|bmp|jpg|jpeg|gif)$/i.test(f)
                ),
                folder
            ),

            this.category(
                "🎵 Sounds",
                files.filter(f =>
                    /\.(ogg|wav|mp3)$/i.test(f)
                ),
                folder
            ),

            this.category(
                "📄 Other",
                files.filter(f => {

                    if (f === "main.txt") return false;

                    if (/\.(png|bmp|jpg|jpeg|gif)$/i.test(f)) return false;

                    if (/\.(ogg|wav|mp3)$/i.test(f)) return false;

                    if (f.toUpperCase().startsWith("PALETTE")) return false;

                    return true;

                }),
                folder
            )

        ].filter((n): n is CrusadeNode => {

            if (!n) {
                return false;
            }

            return n.children !== undefined
                && n.children.length > 0;

        });

    }

}
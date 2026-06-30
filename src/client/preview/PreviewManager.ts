import * as vscode from "vscode";

import { SpritePreview } from "./SpritePreview";
import { PalettePreview } from "./PalettePreview";
import { StagePreview } from "./StagePreview";
import { MusicPreview } from "./MusicPreview";
import { CharacterDataPreview } from "./CharacterDataPreview";
import { StageDataPreview } from "./StageDataPreview";

export class PreviewManager implements vscode.Disposable {

    private readonly spritePreview: SpritePreview;
    private readonly palettePreview: PalettePreview;
    private readonly stagePreview: StagePreview;
    private readonly musicPreview: MusicPreview;
    private readonly characterDataPreview: CharacterDataPreview;
    private readonly stageDataPreview: StageDataPreview;

    constructor(
        private readonly context: vscode.ExtensionContext
    ) {

        this.spritePreview = new SpritePreview(context);
        this.palettePreview = new PalettePreview(context);
        this.stagePreview = new StagePreview(context);
        this.musicPreview = new MusicPreview(context);
        this.characterDataPreview = new CharacterDataPreview(context);
        this.stageDataPreview = new StageDataPreview(context);

    }

    public register(): void {

        this.spritePreview.register();

        this.palettePreview.register();

        this.stagePreview.register();

        this.musicPreview.register();

        this.characterDataPreview.register();

        this.stageDataPreview.register();

    }

    public dispose(): void {

        this.spritePreview.dispose?.();

        this.palettePreview.dispose?.();

        this.stagePreview.dispose?.();

        this.musicPreview.dispose?.();

        this.characterDataPreview.dispose?.();

        this.stageDataPreview.dispose?.();

    }

}
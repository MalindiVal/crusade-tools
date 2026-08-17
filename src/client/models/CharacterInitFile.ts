export interface CharacterInitFile {

    sections: InitSection[];

}

export interface InitSection {

    name: string;

    entries: InitEntry[];

}
export type InitEntry =
    | RawEntry
    | FunctionEntry
    | AssignmentEntry;

export interface RawEntry {
    type: "raw";
    raw: string;
}

export interface FunctionEntry {
    type: "function";
    variable?: string;
    function: string;
    args: string[];
}

export interface AssignmentEntry {
    type: "assignment";
    variable: string;
    value: string;
}
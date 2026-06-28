export interface Node {
    kind:string;
}

export interface Program extends Node {
    statements:Node[];
}

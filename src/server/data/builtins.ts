export interface BuiltinVariable {
    name: string;
    detail: string;
}

export interface BuiltinFunction {
    name: string;
    params: string[];
    detail: string;
}

export const KEYWORDS: string[] = [
    "if", "else", "while", "do", "until", "for", "repeat",
    "switch", "case", "default", "break", "continue", "return", "exit",
    "with", "var", "globalvar",
    "true", "false", "and", "or", "not", "xor", "div", "mod",
    "self", "other", "all", "noone", "global"
];

// GameMaker 8 runtime built-ins (not user scripts, so they never show up
// in a .gmk's Scripts resources).
export const BUILTIN_FUNCTIONS: BuiltinFunction[] = [
    { name: "abs", params: ["x"], detail: "Absolute value of x." },
    { name: "sign", params: ["x"], detail: "-1, 0 or 1 depending on the sign of x." },
    { name: "min", params: ["...values"], detail: "Smallest of the given values." },
    { name: "max", params: ["...values"], detail: "Largest of the given values." },
    { name: "round", params: ["x"], detail: "Rounds x to the nearest integer." },
    { name: "floor", params: ["x"], detail: "Rounds x down." },
    { name: "ceil", params: ["x"], detail: "Rounds x up." },
    { name: "random", params: ["max"], detail: "Random real number between 0 and max." },
    { name: "irandom", params: ["max"], detail: "Random integer between 0 and max." },
    { name: "choose", params: ["...values"], detail: "Picks one of the given values at random." },
    { name: "string", params: ["value"], detail: "Converts a value to a string." },
    { name: "real", params: ["string"], detail: "Converts a string to a number." },
    { name: "point_distance", params: ["x1", "y1", "x2", "y2"], detail: "Distance between two points." },
    { name: "point_direction", params: ["x1", "y1", "x2", "y2"], detail: "Direction from one point to another." },
    { name: "distance_to_object", params: ["obj"], detail: "Distance from this instance to the nearest instance of obj." },
    { name: "distance_to_point", params: ["x", "y"], detail: "Distance from this instance to a point." },
    { name: "collision_rectangle", params: ["x1", "y1", "x2", "y2", "obj", "prec", "notme"], detail: "Checks for a collision with obj within a rectangle." },
    { name: "collision_point", params: ["x", "y", "obj", "prec", "notme"], detail: "Checks for a collision with obj at a point." },
    { name: "place_meeting", params: ["x", "y", "obj"], detail: "Whether obj would be met if this instance moved to (x, y)." },
    { name: "instance_create", params: ["x", "y", "obj"], detail: "Creates an instance of obj at (x, y)." },
    { name: "instance_destroy", params: [], detail: "Destroys the current instance." },
    { name: "instance_exists", params: ["obj"], detail: "Whether an instance of obj exists." },
    { name: "instance_number", params: ["obj"], detail: "Number of active instances of obj." },
    { name: "instance_nearest", params: ["x", "y", "obj"], detail: "Nearest instance of obj to (x, y)." },
    { name: "instance_find", params: ["obj", "n"], detail: "The n-th instance of obj." },
    { name: "sound_play", params: ["snd"], detail: "Plays a sound once." },
    { name: "sound_loop", params: ["snd"], detail: "Plays a sound in a loop." },
    { name: "sound_stop", params: ["snd"], detail: "Stops a playing sound." },
    { name: "sprite_get_xoffset", params: ["spr"], detail: "X offset of the sprite's origin." },
    { name: "sprite_get_yoffset", params: ["spr"], detail: "Y offset of the sprite's origin." },
    { name: "sprite_get_width", params: ["spr"], detail: "Width of a sprite." },
    { name: "sprite_get_height", params: ["spr"], detail: "Height of a sprite." },
    { name: "show_message", params: ["text"], detail: "Shows a debug message box (blocking)." },
    { name: "show_debug_message", params: ["text"], detail: "Writes a message to the debug console." }
];

// Vanilla GM8 instance variables that show up throughout fighter/item/stage
// scripts.
export const BUILTIN_VARIABLES: BuiltinVariable[] = [
    { name: "x", detail: "Instance x position." },
    { name: "y", detail: "Instance y position." },
    { name: "xprevious", detail: "x position on the previous step." },
    { name: "yprevious", detail: "y position on the previous step." },
    { name: "xstart", detail: "x position at instance creation." },
    { name: "ystart", detail: "y position at instance creation." },
    { name: "hspeed", detail: "Horizontal speed." },
    { name: "vspeed", detail: "Vertical speed." },
    { name: "speed", detail: "Speed along direction." },
    { name: "direction", detail: "Movement direction in degrees." },
    { name: "friction", detail: "Per-step speed reduction." },
    { name: "gravity", detail: "Per-step speed added along gravity_direction." },
    { name: "gravity_direction", detail: "Direction gravity pulls in." },
    { name: "sprite_index", detail: "Sprite currently assigned to the instance." },
    { name: "image_index", detail: "Current subimage/frame of the sprite." },
    { name: "image_speed", detail: "Animation speed, in frames per step." },
    { name: "image_xscale", detail: "Horizontal scale of the sprite." },
    { name: "image_yscale", detail: "Vertical scale of the sprite." },
    { name: "image_angle", detail: "Rotation of the sprite, in degrees." },
    { name: "image_alpha", detail: "Sprite transparency (0-1)." },
    { name: "image_blend", detail: "Sprite color blend." },
    { name: "depth", detail: "Draw depth (higher draws behind)." },
    { name: "visible", detail: "Whether the instance is drawn." },
    { name: "solid", detail: "Whether the instance blocks collisions." },
    { name: "persistent", detail: "Whether the instance survives a room change." },
    { name: "id", detail: "This instance's unique id." },
    { name: "object_index", detail: "The object this instance was created from." },
    { name: "alarm", detail: "Alarm clocks array, e.g. alarm[0]." },
    { name: "room", detail: "Index of the current room." },
    { name: "global", detail: "Namespace for global variables, e.g. global.something." }
];

// Crusade/SSBC engine conventions, confirmed against the fighter script
// templates (template/fighter/*.txt).
export const ENGINE_VARIABLES: BuiltinVariable[] = [
    { name: "state_type", detail: "Fighter state machine: \"stand\", \"jump\", \"air_attack\", \"land\", \"flinch\", \"air_flinch\", \"held\", ..." },
    { name: "attack_type", detail: "Name of the attack script currently running, e.g. \"bair\", \"fair\", \"dsmash\"." },
    { name: "timer", detail: "Frame counter for the current state/attack, counts up from 0." },
    { name: "time", detail: "Duration in frames the current state/attack lasts." },
    { name: "timer_speed", detail: "Multiplier applied to timer's advance rate." },
    { name: "air", detail: "Whether the fighter is airborne (0 = grounded)." },
    { name: "facing", detail: "Direction the fighter faces (0 or 1)." },
    { name: "angle_here", detail: "Angle passed into the current hit/attack, usually run through angle_correct()." },
    { name: "self", detail: "Reference to the calling instance itself." },
    { name: "enemy", detail: "Reference to the opposing fighter instance." },
    { name: "hitbox", detail: "The hitbox instance most recently created by create_hitbox()/create_projectile()." },
    { name: "hold_item", detail: "Whether the fighter is currently holding an item." },
    { name: "held_item", detail: "Reference to the item instance being held, or -1." },
    { name: "smash_power", detail: "Current smash-attack charge amount." },
    { name: "percent", detail: "Damage percent." },
    { name: "size", detail: "Fighter hurtbox/size multiplier." },
    { name: "ai_timer", detail: "Frame counter used by the AI state machine." },
    { name: "ai_state", detail: "Current AI decision state, e.g. \"idle\"." },
    { name: "char_custom1", detail: "First of the character's free custom variable slots (char_custom1..char_custom8)." }
];

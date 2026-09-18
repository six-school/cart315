/** @noSelfInFile */
/* eslint-disable @typescript-eslint/no-restricted-types */

// =============================================================================
// usagi engine — TypeScriptToLua declarations
// Generated from the Usagi API stubs (usagi 1.1.0).
// =============================================================================

// ---------------------------------------------------------------------------
// Shared geometry helpers (used by util.*)
// ---------------------------------------------------------------------------

interface Vec2 {
  x: number;
  y: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Circ {
  x: number;
  y: number;
  r: number;
}

// ---------------------------------------------------------------------------
// gfx
// ---------------------------------------------------------------------------

/**
 * Graphics API. All drawing happens in game-space pixels.
 *
 * Color constants use 1-based palette slots matching `gfx.spr` and the
 * default Pico-8 palette. Slot `0` is `COLOR_TRUE_WHITE` (pure white);
 * any index above the active palette's length renders as a magenta sentinel.
 */
declare namespace gfx {
  const COLOR_TRUE_WHITE: 0;
  const COLOR_BLACK: 1;
  const COLOR_DARK_BLUE: 2;
  const COLOR_DARK_PURPLE: 3;
  const COLOR_DARK_GREEN: 4;
  const COLOR_BROWN: 5;
  const COLOR_DARK_GRAY: 6;
  const COLOR_LIGHT_GRAY: 7;
  const COLOR_WHITE: 8;
  const COLOR_RED: 9;
  const COLOR_ORANGE: 10;
  const COLOR_YELLOW: 11;
  const COLOR_GREEN: 12;
  const COLOR_BLUE: 13;
  const COLOR_INDIGO: 14;
  const COLOR_PINK: 15;
  const COLOR_PEACH: 16;

  /** Clears the screen to the given color. */
  function clear(color: number): void;

  /**
   * Draws text at (x, y) using the bundled monogram font (5×7 px, 16 px
   * line height).
   */
  function text(text: string, x: number, y: number, color: number): void;

  /**
   * Extended `text` with scale, rotation, and alpha.
   * Rotation pivots around the center of the unrotated bounding box; (x, y)
   * stays the top-left at `rotation = 0`.
   * Use integer scale values for crisp rendering.
   * @param rotation radians — use `math.rad(deg)` for degree literals, `0` for none
   * @param alpha opacity 0..1; 1.0 is fully opaque
   */
  function text_ex(
    text: string,
    x: number,
    y: number,
    scale: number,
    rotation: number,
    color: number,
    alpha: number,
  ): void;

  /** Draws a rectangle outline. */
  function rect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
  ): void;

  /** Draws a filled rectangle. */
  function rect_fill(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
  ): void;

  /** Draws a circle outline centered at (x, y). */
  function circ(x: number, y: number, r: number, color: number): void;

  /** Draws a filled circle centered at (x, y). */
  function circ_fill(x: number, y: number, r: number, color: number): void;

  /** Draws a line from (x1, y1) to (x2, y2). */
  function line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
  ): void;

  /** Rectangle outline with a stroke thickness. */
  function rect_ex(
    x: number,
    y: number,
    w: number,
    h: number,
    thickness: number,
    color: number,
  ): void;

  /**
   * Circle outline with a stroke thickness.
   * Stroke is centered on the nominal radius, so concentric `circ_ex` calls
   * at decreasing radii draw flush rings with no gaps.
   */
  function circ_ex(
    x: number,
    y: number,
    r: number,
    thickness: number,
    color: number,
  ): void;

  /** Line with a stroke thickness. */
  function line_ex(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number,
    color: number,
  ): void;

  /** Draws a triangle outline from three vertices. */
  function tri(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number,
  ): void;

  /**
   * Draws a filled triangle from three vertices.
   * Vertex winding order doesn't matter; it is corrected internally.
   */
  function tri_fill(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number,
  ): void;

  /** Sets a single pixel. */
  function px(x: number, y: number, color: number): void;

  /**
   * Reads a pixel from the most recently rendered frame.
   * Returns RGB channels plus the 1-based palette slot when the color is an
   * exact palette match; returns four `undefined`s for off-screen coordinates
   * or before the first frame.
   */
  function get_px(
    x: number,
    y: number,
  ): LuaMultiReturn<
    | [number, number, number, number]
    | [undefined, undefined, undefined, undefined]
  >;

  /**
   * Draws a 16×16 sprite from `sprites.png` at (x, y).
   * Indices are 1-based, running left-to-right then top-to-bottom.
   * Alpha-channel pixels are transparent.
   */
  function spr(index: number, x: number, y: number): void;

  /**
   * Extended `spr` with flip, rotation, tint, and alpha.
   * Rotation pivots around the sprite center; (x, y) is the top-left of the
   * unrotated bounding box.
   * @param rotation radians — use `math.rad(deg)` for degree literals, `0` for none
   * @param tint palette color multiplied over the sprite; `gfx.COLOR_WHITE` for none
   * @param alpha opacity 0..1; 1.0 is fully opaque
   */
  function spr_ex(
    index: number,
    x: number,
    y: number,
    flip_x: boolean,
    flip_y: boolean,
    rotation: number,
    tint: number,
    alpha: number,
  ): void;

  /**
   * Reads a pixel from `sprites.png`.
   * `index` is 1-based (same as `gfx.spr`); (x, y) is the offset inside the
   * cell with (0, 0) at that cell's top-left.
   * Returns four `undefined`s for out-of-range, no sprite sheet, or a fully
   * transparent pixel.
   */
  function get_spr_px(
    index: number,
    x: number,
    y: number,
  ): LuaMultiReturn<
    | [number, number, number, number]
    | [undefined, undefined, undefined, undefined]
  >;

  /**
   * Draws a source rectangle from `sprites.png` at (dx, dy) at its original size.
   * `s*` args are in sprite-sheet pixels; `d*` args are game-space pixels.
   */
  function sspr(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
  ): void;

  /**
   * Extended `sspr`: source rect stretched to (dw, dh) with flip, rotation,
   * tint, and alpha.
   * All thirteen arguments are required.
   * @param rotation radians — use `math.rad(deg)` for degree literals, `0` for none
   * @param tint palette color multiplied over the sprite; `gfx.COLOR_WHITE` for none
   * @param alpha opacity 0..1; 1.0 is fully opaque
   */
  function sspr_ex(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    flip_x: boolean,
    flip_y: boolean,
    rotation: number,
    tint: number,
    alpha: number,
  ): void;

  /**
   * Activates a post-process fragment shader loaded from `shaders/<name>.fs`.
   * Pass `undefined` (nil) to clear the active shader.
   * On web the loader prefers `<name>_es.fs` (GLSL ES 100); on desktop it
   * prefers `<name>.fs` (GLSL 330). Source live-reloads in `usagi dev`.
   */
  function shader_set(name: string | undefined): void;

  /**
   * Sets a uniform on the active shader.
   * A `number` maps to `float`; a 2/3/4-element array maps to vec2/vec3/vec4.
   * Writes are queued and flushed once per frame before the post-process pass.
   */
  function shader_uniform(
    name: string,
    value:
      | number
      | [number, number]
      | [number, number, number]
      | [number, number, number, number],
  ): void;
}

// ---------------------------------------------------------------------------
// sfx
// ---------------------------------------------------------------------------

/** Sound-effect API. Names are file stems from the `sfx/` directory. */
declare namespace sfx {
  /**
   * Plays a sound effect by name.
   * Each sfx has a pool of 8 voices that overlap; the 9th simultaneous play
   * steals the oldest. Unknown names are silently ignored.
   */
  function play(name: string): void;

  /**
   * Plays a sound effect with per-call volume, pitch, and pan.
   * @param volume 0..1 multiplier on the pause-menu sfx volume; 1.0 = identity
   * @param pitch  pitch multiplier; 1.0 = identity, 0.5 = octave down, 2.0 = octave up
   * @param pan    stereo pan; -1 left, 0 center, 1 right
   */
  function play_ex(
    name: string,
    volume: number,
    pitch: number,
    pan: number,
  ): void;
}

// ---------------------------------------------------------------------------
// music
// ---------------------------------------------------------------------------

/**
 * Music API. Names are file stems from the `music/` directory.
 * Recognized extensions: ogg, mp3, wav, flac.
 */
declare namespace music {
  /**
   * Plays a music track once and stops at the end.
   * Stops any currently-playing track first. Unknown names are silently ignored.
   * Callable from `_init`.
   */
  function play(name: string): void;

  /**
   * Plays a music track and loops it indefinitely.
   * Stops any currently-playing track first. Callable from `_init`.
   */
  function loop(name: string): void;

  /** Stops whatever music is currently playing. No-op when nothing is playing. */
  function stop(): void;

  /**
   * Plays a music track with full configuration.
   * @param volume  0..1 multiplier on the pause-menu music volume; 1.0 = identity
   * @param pitch   pitch multiplier; 1.0 = identity
   * @param pan     stereo pan; -1 left, 0 center, 1 right
   * @param looping true to loop, false to play once
   */
  function play_ex(
    name: string,
    volume: number,
    pitch: number,
    pan: number,
    looping: boolean,
  ): void;

  /**
   * Modulates the currently-playing track's volume, pitch, and pan in place.
   * Replace semantics — each call sets the absolute current values.
   * No-op when nothing is playing.
   * @param volume 0..1 multiplier on the pause-menu music volume
   * @param pitch  pitch multiplier; 1.0 = identity
   * @param pan    stereo pan; -1 left, 0 center, 1 right
   */
  function mutate(volume: number, pitch: number, pan: number): void;
}

// ---------------------------------------------------------------------------
// input
// ---------------------------------------------------------------------------

/**
 * Input API.
 *
 * Action constants are abstract and map to keyboard keys, gamepad buttons,
 * and analog-stick directions:
 * - LEFT:  arrow left, A, dpad left, left stick left
 * - RIGHT: arrow right, D, dpad right, left stick right
 * - UP:    arrow up, W, dpad up, left stick up
 * - DOWN:  arrow down, S, dpad down, left stick down
 * - BTN1:  Z, J; gamepad south face (Xbox A / PS Cross)
 * - BTN2:  X, K; gamepad east face (Xbox B / PS Circle)
 * - BTN3:  C, L; gamepad north + west face (Xbox Y/X / PS Triangle/Square)
 */
declare namespace input {
  // Action constants
  const LEFT: number;
  const RIGHT: number;
  const UP: number;
  const DOWN: number;
  const BTN1: number;
  const BTN2: number;
  const BTN3: number;

  // Mouse button constants
  const MOUSE_LEFT: number;
  const MOUSE_RIGHT: number;
  const MOUSE_MIDDLE: number;

  // Source identifier constants
  const SOURCE_KEYBOARD: "keyboard";
  const SOURCE_GAMEPAD: "gamepad";

  // Keyboard key constants
  const KEY_A: number;
  const KEY_B: number;
  const KEY_C: number;
  const KEY_D: number;
  const KEY_E: number;
  const KEY_F: number;
  const KEY_G: number;
  const KEY_H: number;
  const KEY_I: number;
  const KEY_J: number;
  const KEY_K: number;
  const KEY_L: number;
  const KEY_M: number;
  const KEY_N: number;
  const KEY_O: number;
  const KEY_P: number;
  const KEY_Q: number;
  const KEY_R: number;
  const KEY_S: number;
  const KEY_T: number;
  const KEY_U: number;
  const KEY_V: number;
  const KEY_W: number;
  const KEY_X: number;
  const KEY_Y: number;
  const KEY_Z: number;
  const KEY_0: number;
  const KEY_1: number;
  const KEY_2: number;
  const KEY_3: number;
  const KEY_4: number;
  const KEY_5: number;
  const KEY_6: number;
  const KEY_7: number;
  const KEY_8: number;
  const KEY_9: number;
  const KEY_F1: number;
  const KEY_F2: number;
  const KEY_F3: number;
  const KEY_F4: number;
  const KEY_F5: number;
  const KEY_F6: number;
  const KEY_F7: number;
  const KEY_F8: number;
  const KEY_F9: number;
  const KEY_F10: number;
  const KEY_F11: number;
  const KEY_F12: number;
  const KEY_SPACE: number;
  const KEY_ENTER: number;
  const KEY_ESCAPE: number;
  const KEY_TAB: number;
  const KEY_BACKSPACE: number;
  const KEY_DELETE: number;
  const KEY_LEFT: number;
  const KEY_RIGHT: number;
  const KEY_UP: number;
  const KEY_DOWN: number;
  const KEY_LSHIFT: number;
  const KEY_RSHIFT: number;
  const KEY_LCTRL: number;
  const KEY_RCTRL: number;
  const KEY_LALT: number;
  const KEY_RALT: number;
  const KEY_BACKTICK: number;
  const KEY_MINUS: number;
  const KEY_EQUAL: number;
  const KEY_LBRACKET: number;
  const KEY_RBRACKET: number;
  const KEY_BACKSLASH: number;
  const KEY_SEMICOLON: number;
  const KEY_APOSTROPHE: number;
  const KEY_COMMA: number;
  const KEY_PERIOD: number;
  const KEY_SLASH: number;

  /** Returns true the frame any source bound to `action` first went down. */
  function pressed(action: number): boolean;

  /** Returns true while any source bound to `action` is held. */
  function held(action: number): boolean;

  /** Returns true the frame any source bound to `action` was released. */
  function released(action: number): boolean;

  /**
   * Returns the label of the active source's primary binding for `action`
   * (e.g. "Z" on keyboard, "Pad-A" on gamepad). Honors player key remaps.
   * Returns `undefined` for unknown actions or unbound actions.
   */
  function mapping_for(action: number): string | undefined;

  /**
   * Returns the input source that most recently fired any bound action.
   * Switches only when a *bound* input fires.
   */
  function last_source(): "keyboard" | "gamepad";

  /**
   * Returns the cursor position in game-space pixels as (x, y).
   * Values outside `0..usagi.GAME_W` / `0..usagi.GAME_H` indicate the
   * cursor is over a letterbox bar.
   */
  function mouse(): LuaMultiReturn<[number, number]>;

  /** Returns true while the given mouse button is held. */
  function mouse_held(button: number): boolean;

  /** Returns true the frame the given mouse button first went down. */
  function mouse_pressed(button: number): boolean;

  /** Returns true the frame the given mouse button was released. */
  function mouse_released(button: number): boolean;

  /**
   * Per-frame vertical scroll delta.
   * Positive = scrolled up, negative = scrolled down, 0 = no scroll.
   * May be fractional for trackpad swipes; compare with `> 0` / `< 0`.
   */
  function mouse_scroll(): number;

  /**
   * Returns true while the given keyboard key is held.
   * Bypasses the keymap and gamepad bindings — prefer `input.held(action)`
   * for remappable game actions.
   */
  function key_held(key: number): boolean;

  /**
   * Returns true the frame the given keyboard key first went down.
   * Bypasses the keymap and gamepad bindings.
   */
  function key_pressed(key: number): boolean;

  /**
   * Returns true the frame the given keyboard key was released.
   * Bypasses the keymap and gamepad bindings.
   */
  function key_released(key: number): boolean;

  /**
   * Shows or hides the OS cursor over the game window. Persists until changed.
   * Callable from `_init` to hide the cursor before the first frame draws.
   */
  function set_mouse_visible(visible: boolean): void;

  /**
   * Returns whether the OS cursor is currently shown.
   * Safe to use as a toggle: `input.set_mouse_visible(!input.mouse_visible())`.
   */
  function mouse_visible(): boolean;
}

// ---------------------------------------------------------------------------
// usagi
// ---------------------------------------------------------------------------

/**
 * Engine-level namespace with metadata, persistence, and utility helpers.
 */
declare namespace usagi {
  /** Game render width in pixels. */
  const GAME_W: number;
  /** Game render height in pixels. */
  const GAME_H: number;
  /** Side length in pixels of one cell in `sprites.png` (drives `gfx.spr` indexing). */
  const SPRITE_SIZE: number;
  /** Build target. */
  const PLATFORM: "web" | "macos" | "linux" | "windows" | "unknown";
  /** `true` under `usagi dev`; `false` for `usagi run` and compiled binaries. */
  const IS_DEV: boolean;
  /** Wall-clock seconds since session start; updated once per frame before `_update`. */
  const elapsed: number;

  /**
   * Measures `text` in the bundled font and returns its rendered size as
   * (width, height) in pixels.
   */
  function measure_text(text: string): LuaMultiReturn<[number, number]>;

  /**
   * Pretty-prints any Lua value to a string.
   * Tables are recursed with sorted keys; cycles render as `<cycle>`.
   * Useful with `gfx.text` for on-screen debug output.
   */
  function dump(v: unknown): string;

  /**
   * Persists a Lua table as JSON. Saves are namespaced by the `game_id` from
   * `_config()`. Functions, userdata, NaN, and cycles raise an error.
   */
  function save(t: object): void;

  /**
   * Reads the persisted save table back.
   * Returns `undefined` (nil) on first run (no save file).
   * Idiomatic: `const state = usagi.load() ?? { ...defaults }`.
   */
  function load(): object | undefined;

  /**
   * Reads a JSON file from the project's `data/` directory and returns it as
   * a Lua table. Path is forward-slash-separated and relative to `data/`.
   * Bundled by `usagi export`; hot-reloads in `usagi dev`.
   */
  function read_json(path: string): object;

  /**
   * Reads a text file from the project's `data/` directory as a UTF-8 string.
   * Same path rules as `usagi.read_json`.
   */
  function read_text(path: string): string;

  /**
   * Serializes a Lua table to a pretty-printed JSON string.
   * Same shape rules as `usagi.save`.
   */
  function to_json(t: object): string;

  /**
   * Registers a custom row on the pause menu's top view (between Continue and
   * Settings). Up to 3 items; exceeding the cap raises an error. Items are
   * cleared before each `_init` re-run.
   * @param callback fired when the player selects this row; return `true` to keep the menu open
   */
  function menu_item(label: string, callback: () => boolean | void): void;

  /**
   * Removes all Lua-registered menu items.
   * Rarely needed — items auto-clear on `_init` re-run.
   */
  function clear_menu_items(): void;

  /**
   * Toggles fullscreen state and persists to `settings.json`.
   * The window flip happens at the next frame start.
   * @returns `true` if fullscreen is now on
   */
  function toggle_fullscreen(): boolean;

  /** Returns whether the window is currently fullscreen. */
  function is_fullscreen(): boolean;

  /**
   * Terminates the main loop the same way the pause-menu Quit row does.
   * On web, the canvas freezes on the last frame rather than closing the page.
   */
  function quit(): void;
}

// ---------------------------------------------------------------------------
// util
// ---------------------------------------------------------------------------

/** Pure math/geometry helpers. No engine state. */
declare namespace util {
  /** Clamps `v` into `[lo, hi]`. */
  function clamp(v: number, lo: number, hi: number): number;

  /** Returns -1, 0, or 1 according to the sign of `v`. */
  function sign(v: number): -1 | 0 | 1;

  /** Half-up rounding to the nearest integer. */
  function round(v: number): number;

  /**
   * Moves `current` toward `target` by at most `max_delta`, never
   * overshooting. Scale `max_delta` by `dt` for frame-rate independence.
   */
  function approach(current: number, target: number, max_delta: number): number;

  /** Linear interpolation. `t = 0` → `a`, `t = 1` → `b`. Extrapolates outside `[0, 1]`. */
  function lerp(a: number, b: number, t: number): number;

  /**
   * Wraps `v` into `[lo, hi)`.
   * Works for negative values: `util.wrap(-1, 0, 4) === 3`.
   */
  function wrap(v: number, lo: number, hi: number): number;

  /**
   * Boolean from time. Toggles `hz` times per second.
   * Useful for invincibility flicker, UI blinks, and low-health warnings.
   */
  function flash(t: number, hz: number): boolean;

  /**
   * Remaps `v` from the range `[start_a, end_a]` into `[start_b, end_b]`.
   * Example: `util.remap(128, 0, 256, 0, 100)` → `50`.
   */
  function remap(
    v: number,
    start_a: number,
    end_a: number,
    start_b: number,
    end_b: number,
  ): number;

  /** Normalizes a `{x, y}` vector to unit length. Returns a new table; input is unchanged. A zero vector returns `{x: 0, y: 0}`. */
  function vec_normalize(v: Vec2): Vec2;

  /** Euclidean distance between two `{x, y}` points. */
  function vec_dist(a: Vec2, b: Vec2): number;

  /** Squared distance between two `{x, y}` points. Cheaper than `vec_dist`; compare against `r * r`. */
  function vec_dist_sq(a: Vec2, b: Vec2): number;

  /**
   * Builds a vector at `angle` radians with magnitude `len` (default 1).
   * Pair with `math.atan(dy, dx)` to convert a direction into a velocity.
   */
  function vec_from_angle(angle: number, len?: number): Vec2;

  /**
   * Returns true when the `{x, y}` point is inside `{x, y, w, h}`.
   * Half-open: left/top edges are inside, right/bottom edges are outside.
   */
  function point_in_rect(p: Vec2, r: Rect): boolean;

  /**
   * Returns true when the `{x, y}` point is strictly inside circle `{x, y, r}`.
   * Points on the boundary are considered outside.
   */
  function point_in_circ(p: Vec2, c: Circ): boolean;

  /** Returns true when the two AABBs share interior area. Edge-adjacent rects are non-overlapping. */
  function rect_overlap(a: Rect, b: Rect): boolean;

  /** Returns true when the two circles overlap. Tangent circles are non-overlapping. */
  function circ_overlap(a: Circ, b: Circ): boolean;

  /** Returns true when a circle and an AABB overlap (closest-point method). */
  function circ_rect_overlap(c: Circ, r: Rect): boolean;
}

// ---------------------------------------------------------------------------
// effect
// ---------------------------------------------------------------------------

/**
 * Juice primitives: hitstop, screen shake, flash, and slow-motion.
 * Each call sets per-session state that decays once per frame.
 * Stacking rule: longer duration wins; for magnitude params the latest call wins.
 * Spam-calling is safe.
 */
declare namespace effect {
  /**
   * Freezes `_update` for `time` seconds. `_draw` keeps running.
   * If a longer hitstop is already in flight this call is a no-op.
   */
  function hitstop(time: number): void;

  /**
   * Shakes the rendered view for `time` seconds by up to `intensity`
   * game-pixels. Magnitude decays linearly to zero.
   * @param intensity maximum offset in game pixels (try 2–6)
   */
  function screen_shake(time: number, intensity: number): void;

  /**
   * Flashes a full-screen palette color overlay for `time` seconds.
   * Alpha decays linearly from opaque to transparent.
   */
  function flash(time: number, color: number): void;

  /**
   * Scales the `dt` passed to `_update` for `time` seconds.
   * `scale = 0.5` is half-speed; `scale > 1` plays faster.
   * The slow-mo timer counts down at real (wall-clock) time.
   */
  function slow_mo(time: number, scale: number): void;

  /**
   * Cancels every active effect immediately.
   * Useful on game-over or scene transitions. Reset / F5 call this internally.
   */
  function stop(): void;
}

// ---------------------------------------------------------------------------
// Game callbacks
// ---------------------------------------------------------------------------

/** Engine config returned by `_config()`. All fields are optional except `game_id` when using save/load. */
interface UsagiConfig {
  /** Display name — window title and (slugged) export names. Defaults to the project directory name. */
  name?: string;
  /**
   * `false` (default): any scale that fits the window while preserving aspect ratio.
   * `true`: integer scale only with letterbox bars.
   */
  pixel_perfect?: boolean;
  /** Reverse-DNS identifier (e.g. `"com.you.mygame"`), required for `usagi.save` / `usagi.load`. */
  game_id?: string;
  /** 1-based tile index into `sprites.png` for the window icon (same indexing as `gfx.spr`). */
  icon?: number;
  /** Game render width in pixels. Default 320. Tested range 160..640. */
  game_width?: number;
  /** Game render height in pixels. Default 180. Tested range 90..360. */
  game_height?: number;
  /**
   * Side length in pixels of one cell in `sprites.png`. Default 16.
   * Drives `gfx.spr` indexing, the tilepicker tool grid, and the icon slicer.
   * `sprites.png` must be a multiple of this value on both axes.
   */
  sprite_size?: number;
  /**
   * `true` (default): engine handles Esc/P/Enter/Start to open the built-in pause overlay.
   * `false`: those keys flow through to user code for custom menus.
   */
  pause_menu?: boolean;
}

/**
 * Optional. Returns engine config read once before the window opens.
 * Omit if the defaults are fine.
 */
declare function _config(): UsagiConfig | undefined;

/** Called once when the game starts. Use for loading assets and initializing state. */
declare function _init(): void;

/**
 * Called every frame to update game state. Runs before `_draw`.
 * @param dt delta-time: seconds since last frame
 */
declare function _update(dt: number): void;

/**
 * Called every frame to render. Runs after `_update`.
 * @param dt delta-time: seconds since last frame
 */
declare function _draw(dt: number): void;

/** @noSelfInFile */
/* eslint-disable @typescript-eslint/no-restricted-types */

interface UsagiConfig {
  /** display name. Window title, macOS .app bundle directory, and (slugged) archive/binary names on `usagi export` (default: project directory name) */
  name?: string;
  /** false (default) = any scale that fits the window while preserving aspect ratio; true = integer scale only with letterbox bars */
  pixel_perfect?: boolean;
  /** reverse-DNS identifier (e.g. "com.you.mygame"), required for save/load */
  game_id?: string;
  /** 1-based tile index into sprites.png to use as the window icon (same indexing as gfx.spr); omit for the default Usagi bunny */
  icon?: number;
  /** game render width in pixels (default 320). Tested range 160..640 */
  game_width?: number;
  /** game render height in pixels (default 180). Tested range 90..360 */
  game_height?: number;
  /** side length, in pixels, of one cell in sprites.png (default 16). Drives gfx.spr indexing, the tilepicker tool's grid, and the window-icon slicer. sprites.png must be a multiple of this value on both axes. */
  sprite_size?: number;
  /** true (default) = engine handles Esc/P/Enter/Start to open the built-in pause overlay; false = those keys flow through to user code so games can roll their own menu. With it off you also give up keyboard remap UI, the Input Tester, and gamepad-driven menu nav. `usagi.menu_item` registrations no longer render. Suitable for keyboard-driven prototypes. */
  pause_menu?: boolean;
}

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

declare namespace gfx {
  /** 0 */
  const COLOR_TRUE_WHITE: number;
  /** 1 */
  const COLOR_BLACK: number;
  /** 2 */
  const COLOR_DARK_BLUE: number;
  /** 3 */
  const COLOR_DARK_PURPLE: number;
  /** 4 */
  const COLOR_DARK_GREEN: number;
  /** 5 */
  const COLOR_BROWN: number;
  /** 6 */
  const COLOR_DARK_GRAY: number;
  /** 7 */
  const COLOR_LIGHT_GRAY: number;
  /** 8 */
  const COLOR_WHITE: number;
  /** 9 */
  const COLOR_RED: number;
  /** 10 */
  const COLOR_ORANGE: number;
  /** 11 */
  const COLOR_YELLOW: number;
  /** 12 */
  const COLOR_GREEN: number;
  /** 13 */
  const COLOR_BLUE: number;
  /** 14 */
  const COLOR_INDIGO: number;
  /** 15 */
  const COLOR_PINK: number;
  /** 16 */
  const COLOR_PEACH: number;
  /**
   * Clears the screen to the given color.
   * @param color  a gfx.COLOR_* constant
   */
  function clear(color: number): void;
  /**
   * Draws text at (x, y) in the given color. Uses the bundled monogram
   * font at its 16px design size (a 5×7 pixel font with 16px line height).
   * @param text  string to render
   * @param x  left edge in game-space pixels
   * @param y  top edge in game-space pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function text(text: string, x: number, y: number, color: number, alpha?: number): void;
  /**
   * Extended `text`: scale, rotation, and alpha. Rotation pivots around
   * the center of the text's unrotated bounding box; (x, y) stays the
   * top-left at `rotation = 0`. Integer scale values render crisp
   * (monogram is a bitmap font with POINT filter); fractional values
   * blur, so use integers unless you specifically want a smooth tween.
   * @param text  string to render
   * @param x  left edge in game-space pixels (unrotated bounding box)
   * @param y  top edge in game-space pixels (unrotated bounding box)
   * @param scale  font-size multiplier; integer recommended for crisp text
   * @param rotation  rotation in radians; use `math.rad(deg)` for literal-degree values, `0` for none
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; `1.0` is opaque
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
  /**
   * Draws a rectangle outline.
   * @param x  left edge in game-space pixels
   * @param y  top edge in game-space pixels
   * @param w  width in pixels
   * @param h  height in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function rect(x: number, y: number, w: number, h: number, color: number, alpha?: number): void;
  /**
   * Draws a filled rectangle.
   * @param x  left edge in game-space pixels
   * @param y  top edge in game-space pixels
   * @param w  width in pixels
   * @param h  height in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function rect_fill(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Draws a circle outline centered at (x, y).
   * @param x  center x in game-space pixels
   * @param y  center y in game-space pixels
   * @param r  radius in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function circ(x: number, y: number, r: number, color: number, alpha?: number): void;
  /**
   * Draws a filled circle centered at (x, y).
   * @param x  center x in game-space pixels
   * @param y  center y in game-space pixels
   * @param r  radius in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function circ_fill(x: number, y: number, r: number, color: number, alpha?: number): void;
  /**
   * Draws a line from (x1, y1) to (x2, y2).
   * @param x1  start x in game-space pixels
   * @param y1  start y in game-space pixels
   * @param x2  end x in game-space pixels
   * @param y2  end y in game-space pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Extended `rect`: rectangle outline with a thickness param.
   * @param x  left edge in game-space pixels
   * @param y  top edge in game-space pixels
   * @param w  width in pixels
   * @param h  height in pixels
   * @param thickness  stroke thickness in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function rect_ex(
    x: number,
    y: number,
    w: number,
    h: number,
    thickness: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Extended `circ`: circle outline with a thickness param. Stroke is
   * centered on the nominal radius so concentric `circ_ex` calls at
   * radii `r`, `r-1`, `r-2`, ... draw flush rings with no gaps.
   * @param x  center x in game-space pixels
   * @param y  center y in game-space pixels
   * @param r  radius in pixels
   * @param thickness  stroke thickness in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function circ_ex(
    x: number,
    y: number,
    r: number,
    thickness: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Extended `line`: line with a thickness param.
   * @param x1  start x in game-space pixels
   * @param y1  start y in game-space pixels
   * @param x2  end x in game-space pixels
   * @param y2  end y in game-space pixels
   * @param thickness  stroke thickness in pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function line_ex(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Draws a triangle outline from three points.
   * @param x1  first vertex x in game-space pixels
   * @param y1  first vertex y in game-space pixels
   * @param x2  second vertex x in game-space pixels
   * @param y2  second vertex y in game-space pixels
   * @param x3  third vertex x in game-space pixels
   * @param y3  third vertex y in game-space pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function tri(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Draws a filled triangle from three points. Vertex order doesn't
   * matter; winding is corrected internally.
   * @param x1  first vertex x in game-space pixels
   * @param y1  first vertex y in game-space pixels
   * @param x2  second vertex x in game-space pixels
   * @param y2  second vertex y in game-space pixels
   * @param x3  third vertex x in game-space pixels
   * @param y3  third vertex y in game-space pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function tri_fill(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: number,
    alpha?: number,
  ): void;
  /**
   * Sets a single pixel.
   * @param x  x in game-space pixels
   * @param y  y in game-space pixels
   * @param color  a gfx.COLOR_* constant
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function px(x: number, y: number, color: number, alpha?: number): void;
  /**
   * Reads a pixel from the most recently rendered frame. Returns the
   * RGB channels of the color at `(x, y)` plus the 1-based palette
   * slot when the color is an exact match for an active palette entry
   * (e.g. anything drawn with a `gfx.COLOR_*` constant). Returns four
   * `nil`s for off-screen coordinates, or on the very first frame
   * before any drawing has happened.
   * Reads reflect the previous frame's finished image, so in-progress
   * draws inside the current `_draw` aren't visible. Common uses:
   * collision-by-color, fog-of-war reveals, water reflections, palette
   * swap effects.
   * PERFORMANCE: expensive on web and can drop performance.
   * If you only need to sample your own sprite art, use `gfx.get_spr_px`,
   * which is not expensive.
   * @param x  x in game-space pixels (0 = left edge)
   * @param y  y in game-space pixels (0 = top edge)
   * @returns r              red channel, 0..255
   * @returns g              green channel, 0..255
   * @returns b              blue channel, 0..255
   * @returns palette_index  1-based palette slot, or nil if off-palette
   */
  function get_px(
    x: number,
    y: number,
  ): LuaMultiReturn<
    [number | undefined, number | undefined, number | undefined, number | undefined]
  >;
  /**
   * Draws a 16×16 sprite from the loaded sheet at (x, y). The sheet is
   * `sprites.png` next to the game's main .lua; indices run left-to-right,
   * top-to-bottom. Alpha-channel pixels render as transparent.
   * @param index  one-based sprite index (1 = top-left cell)
   * @param x  destination left edge in game-space pixels
   * @param y  destination top edge in game-space pixels
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function spr(index: number, x: number, y: number, alpha?: number): void;
  /**
   * Extended `spr`: draws a sprite with required flip flags, rotation,
   * tint, and alpha. Rotation pivots around the center of the sprite;
   * (x, y) stays the top-left of the unrotated bounding box.
   * @param index  one-based sprite index (1 = top-left cell)
   * @param x  destination left edge in game-space pixels
   * @param y  destination top edge in game-space pixels
   * @param flip_x  flip horizontally (mirror left/right) when true
   * @param flip_y  flip vertically (mirror top/bottom) when true
   * @param rotation  rotation in radians; use `math.rad(deg)` for literal-degree values, `0` for none
   * @param tint  palette color to multiply over the sprite; `gfx.COLOR_TRUE_WHITE` for none
   * @param alpha  opacity in `0..1`; `1.0` is opaque
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
   * Reads a pixel from `sprites.png`. `index` selects a sprite cell
   * (1-based, same shape as `gfx.spr`); `(x, y)` is the offset inside
   * the cell, with `(0, 0)` as that cell's top-left. Returns RGB plus
   * the 1-based palette slot for exact RGB matches; returns four
   * `nil`s for an out-of-range index, out-of-cell coordinates, a
   * project with no `sprites.png`, or a fully transparent pixel
   * (`gfx.spr` draws alpha-keyed, so a transparent pixel reads as
   * "nothing here" rather than as its backing RGB).
   * Unlike `gfx.get_px`, sprite reads are deterministic and unaffected
   * by draw order: handy for pixel-perfect sprite collision and for
   * data-baked levels where you paint the layout into the sheet and
   * read it back at startup to spawn entities.
   * @param index  one-based sprite index (1 = top-left cell)
   * @param x  0-based x inside the cell, in pixels
   * @param y  0-based y inside the cell, in pixels
   * @returns r              red channel, 0..255
   * @returns g              green channel, 0..255
   * @returns b              blue channel, 0..255
   * @returns palette_index  1-based palette slot, or nil if off-palette
   */
  function get_spr_px(
    index: number,
    x: number,
    y: number,
  ): LuaMultiReturn<
    [number | undefined, number | undefined, number | undefined, number | undefined]
  >;
  /**
   * Draws an arbitrary (sx, sy, sw, sh) rectangle from `sprites.png` at
   * (dx, dy) at its original size. `s*` args index into the source sheet
   * in pixels; `d*` args are the destination on screen.
   * @param sx  source rect left edge on `sprites.png` (pixels)
   * @param sy  source rect top edge on `sprites.png` (pixels)
   * @param sw  source rect width in pixels
   * @param sh  source rect height in pixels
   * @param dx  destination left edge in game-space pixels
   * @param dy  destination top edge in game-space pixels
   * @param alpha  opacity in `0..1`; omit or `1.0` for opaque
   */
  function sspr(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    alpha?: number,
  ): void;
  /**
   * Extended `sspr`: source rect stretched to (dw, dh) at the destination
   * with required flip flags, rotation, tint, and alpha. Rotation pivots
   * around the center of the destination rect; (dx, dy) stays the
   * top-left of the unrotated bounding box. All thirteen args required;
   * write a thin wrapper if a particular flag combination shows up often
   * in your code.
   * @param sx  source rect left edge on `sprites.png` (pixels)
   * @param sy  source rect top edge on `sprites.png` (pixels)
   * @param sw  source rect width in pixels
   * @param sh  source rect height in pixels
   * @param dx  destination left edge in game-space pixels
   * @param dy  destination top edge in game-space pixels
   * @param dw  destination width in pixels (stretches the source)
   * @param dh  destination height in pixels (stretches the source)
   * @param flip_x  flip horizontally (mirror left/right) when true
   * @param flip_y  flip vertically (mirror top/bottom) when true
   * @param rotation  rotation in radians; use `math.rad(deg)` for literal-degree values, `0` for none
   * @param tint  palette color to multiply over the sprite; `gfx.COLOR_TRUE_WHITE` for none
   * @param alpha  opacity in `0..1`; `1.0` is opaque
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
   * Activates a post-process fragment shader. Loads `shaders/<name>.fs`
   * (and optional `<name>.vs`) and runs it as the final pass when the
   * game render target is blitted to the window. Pass nil to clear.
   * On web the loader prefers `<name>_es.fs` (GLSL ES 100); on desktop
   * it prefers `<name>.fs` (GLSL 330). Shader source live-reloads on
   * save in `usagi dev`.
   * @param name  shader name (file stem under `shaders/`), or nil to clear
   */
  function shader_set(name: string | undefined): void;
  /**
   * Sets a uniform on the active shader. The value type drives the
   * uniform type: a number maps to float, a 2/3/4-length numeric table
   * maps to vec2 / vec3 / vec4. Queues the write; the engine flushes
   * queued uniforms once per frame before the post-process pass.
   * @param name  uniform name as declared in the shader source
   * @param value  float, or {x, y} / {x, y, z} / {x, y, z, w}
   */
  function shader_uniform(name: string, value: number | number[]): void;
}

declare namespace sfx {
  /**
   * Plays a sound effect by name. Names are file stems from the `sfx/`
   * directory next to the game's main .lua (e.g. `sfx/jump.wav` → "jump").
   * Unknown names silently no-op. Each sfx has a pool of 8 voices that
   * overlap; the 9th simultaneous play steals the oldest.
   * @param name  file stem of a `.wav` under `sfx/`
   */
  function play(name: string): void;
  /**
   * Plays a sound effect with per-call volume, pitch, and pan. Useful
   * for varied one-shot effects (random pitch on every step, panned
   * positional cues, attenuated UI clicks) without committing extra
   * `.wav` files.
   * @param name  file stem of a `.wav` under `sfx/`
   * @param volume  `0..1` multiplier on the pause-menu sfx volume; `1.0` = identity
   * @param pitch  pitch multiplier; `1.0` = identity, `0.5` = octave down, `2.0` = octave up
   * @param pan  stereo pan; `-1` left, `0` center, `1` right
   */
  function play_ex(name: string, volume: number, pitch: number, pan: number): void;
  /**
   * Stops every playing voice of a sound effect. Unknown or idle names
   * silently no-op.
   * @param name  file stem of a `.wav` under `sfx/`
   */
  function stop(name: string): void;
  /** Stops every playing voice of every loaded sound effect. */
  function stop_all(): void;
  /**
   * Returns true if any voice of the named sound effect is currently
   * playing. False for unknown or idle names.
   * @param name  file stem of a `.wav` under `sfx/`
   */
  function is_playing(name: string): boolean;
}

declare namespace music {
  /**
   * Plays a music track once and stops at the end. Names are file stems
   * from the `music/` directory next to the game's main .lua (e.g.
   * `music/intro.ogg` → "intro"). Recognized extensions: ogg, mp3, wav,
   * flac. Stops the currently-playing track first if there is one.
   * Unknown names silently no-op. Callable from `_init` so a title
   * track can start the moment the window opens.
   * @param name  file stem under `music/`
   */
  function play(name: string): void;
  /**
   * Plays a music track and loops it forever. Stops the currently-
   * playing track first. Callable from `_init`.
   * @param name  file stem under `music/`
   */
  function loop(name: string): void;
  /** Stops whatever music is currently playing. No-op when nothing is. */
  function stop(): void;
  /**
   * Plays a music track with initial volume / pitch / pan / loop
   * settings. Replaces the simple `play` and `loop` for cases that need
   * configuration; subsequent `music.mutate` calls modulate from these
   * initial values.
   * @param name  file stem under `music/`
   * @param volume  `0..1` multiplier on the pause-menu music volume; `1.0` = identity
   * @param pitch  pitch multiplier; `1.0` = identity
   * @param pan  stereo pan; `-1` left, `0` center, `1` right
   * @param looping  `true` plays in a loop, `false` plays once
   */
  function play_ex(
    name: string,
    volume: number,
    pitch: number,
    pan: number,
    looping: boolean,
  ): void;
  /**
   * Modulates the currently-playing music's volume / pitch / pan in
   * place. Replace semantics — each call sets the absolute current
   * values. No-op when nothing is playing. Common uses: ducking volume
   * during dialogue, pitch-warping during hitstun, fading on death.
   * Track the params in your own game state if you want tweens; the
   * engine doesn't expose getters by design.
   * @param volume  `0..1` multiplier on the pause-menu music volume
   * @param pitch  pitch multiplier; `1.0` = identity
   * @param pan  stereo pan; `-1` left, `0` center, `1` right
   */
  function mutate(volume: number, pitch: number, pan: number): void;
}

declare namespace input {
  const LEFT: number;
  const RIGHT: number;
  const UP: number;
  const DOWN: number;
  const BTN1: number;
  const BTN2: number;
  const BTN3: number;
  const MOUSE_LEFT: number;
  const MOUSE_RIGHT: number;
  const MOUSE_MIDDLE: number;
  const SOURCE_KEYBOARD: string;
  const SOURCE_GAMEPAD: string;
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
  /**
   * Returns true the frame any source bound to `action` first went down.
   * @param action  one of input.LEFT / RIGHT / UP / DOWN / BTN1 / BTN2 / BTN3
   */
  function pressed(action: number): boolean;
  /**
   * Returns true while any source bound to `action` is held.
   * @param action  one of input.LEFT / RIGHT / UP / DOWN / BTN1 / BTN2 / BTN3
   */
  function held(action: number): boolean;
  /**
   * Returns true the frame any source bound to `action` first went up
   * (transitioned from held to released). Mirrors `input.pressed` for the
   * release edge.
   * @param action  one of input.LEFT / RIGHT / UP / DOWN / BTN1 / BTN2 / BTN3
   */
  function released(action: number): boolean;
  /**
   * Label of the active input source's primary binding for `action` (e.g.
   * "Z" on keyboard, "Pad-A" on gamepad). Honors any keymap remap the
   * player set via the pause menu's Configure Keys flow. Useful for
   * rendering contextual control prompts. Returns `nil` for unknown
   * actions or when the active source has no binding for `action`.
   * @param action  one of input.LEFT / RIGHT / UP / DOWN / BTN1 / BTN2 / BTN3
   */
  function mapping_for(action: number): string | undefined;
  /**
   * The input source that most recently fired any bound action. Returns
   * `input.SOURCE_KEYBOARD` ("keyboard") or `input.SOURCE_GAMEPAD`
   * ("gamepad"). Switches only when a *bound* input fires, so menu keys
   * and idle activity don't flip it.
   * @returns matches one of input.SOURCE_KEYBOARD / input.SOURCE_GAMEPAD
   */
  function last_source(): string;
  /**
   * Cursor position in game-space pixels (so it lines up with `gfx.*`
   * coords regardless of window size or pixel-perfect scaling). Returns
   * two values: `x, y`. When the cursor sits over the letterbox bars,
   * the values fall outside `0..usagi.GAME_W` / `0..usagi.GAME_H` —
   * bounds-check before treating them as in-game coords.
   * @returns x  game-space x in pixels
   * @returns y  game-space y in pixels
   */
  function mouse(): LuaMultiReturn<[number, number]>;
  /**
   * True when the cursor is over the drawn game area. Returns false when
   * the cursor is outside the window or over the letterbox bars (so it
   * lines up with the in-bounds range of `input.mouse`). Handy for
   * gating hover/click handling to the play area.
   */
  function mouse_over(): boolean;
  /**
   * Returns true while the given mouse button is held.
   * @param button  one of input.MOUSE_LEFT / input.MOUSE_RIGHT / input.MOUSE_MIDDLE
   */
  function mouse_held(button: number): boolean;
  /**
   * Returns true the frame the given mouse button first went down.
   * @param button  one of input.MOUSE_LEFT / input.MOUSE_RIGHT / input.MOUSE_MIDDLE
   */
  function mouse_pressed(button: number): boolean;
  /**
   * Returns true the frame the given mouse button first went up
   * (transitioned from held to released).
   * @param button  one of input.MOUSE_LEFT / input.MOUSE_RIGHT / input.MOUSE_MIDDLE
   */
  function mouse_released(button: number): boolean;
  /**
   * Per-frame vertical scroll delta. Positive when scrolled up this
   * frame, negative when down, 0 when no scroll. Floats are supported,
   * so trackpad swipes can emit fractional values; match against `> 0`
   * / `< 0` rather than equality with 1 / -1.
   */
  function mouse_scroll(): number;
  /**
   * Returns true while the given keyboard key is held.
   * Direct keyboard reads bypass the keymap override and gamepad
   * bindings — prefer `input.held(action)` for game actions players
   * should be able to remap or play with a controller. Use this for dev
   * hotkeys (toggling debug overlays, F-key shortcuts) and for
   * keyboard-and-mouse-only games.
   * @param key  one of the input.KEY_* constants
   */
  function key_held(key: number): boolean;
  /**
   * Returns true the frame the given keyboard key first went down. See
   * `input.key_held` for the bypass-the-keymap caveat.
   * @param key  one of the input.KEY_* constants
   */
  function key_pressed(key: number): boolean;
  /**
   * Returns true the frame the given keyboard key first went up
   * (transitioned from held to released). See `input.key_held` for the
   * bypass-the-keymap caveat.
   * @param key  one of the input.KEY_* constants
   */
  function key_released(key: number): boolean;
  /**
   * Show or hide the OS cursor over the game window. Persists until
   * changed. Callable from `_init` so games can hide the cursor before
   * the first frame draws (e.g. when rendering a custom in-game cursor).
   * @param visible  true to show, false to hide
   */
  function set_mouse_visible(visible: boolean): void;
  /**
   * Returns true when the OS cursor is currently shown over the window.
   * Reflects the latest `input.set_mouse_visible` call synchronously, so
   * it's safe to use as part of a toggle:
   * `input.set_mouse_visible(not input.mouse_visible())`.
   */
  function mouse_visible(): boolean;
}

declare namespace usagi {
  /** game render width in pixels */
  const GAME_W: number;
  /** game render height in pixels */
  const GAME_H: number;
  /** side length, in pixels, of one cell in `sprites.png` (drives `gfx.spr` indexing) */
  const SPRITE_SIZE: number;
  /** build target: "web" | "macos" | "linux" | "windows" | "unknown" */
  const PLATFORM: string;
  /** true under `usagi dev`; false for `usagi run` and compiled binaries */
  const IS_DEV: boolean;
  /** inverse of IS_DEV; true for `usagi run` and compiled binaries */
  const IS_RELEASE: boolean;
  /** wall-clock seconds since session start; updated once per frame before _update */
  const elapsed: number;
  /**
   * Measures `text` in the bundled font and returns its rendered size
   * in pixels. Returns two values: `width, height`. Available from any
   * callback (`_init`, `_update`, `_draw`) — useful for pre-computing
   * layout once in `_init` and reusing the result every frame.
   * @param text  string to measure
   * @returns width   pixel width
   * @returns height  pixel height (equals the font's line height)
   */
  function measure_text(text: string): LuaMultiReturn<[number, number]>;
  /**
   * Pretty-prints any Lua value to a string. Tables are recursed with
   * sorted keys; arrays render in order; cycles render as `<cycle>`;
   * non-serializable values (functions, userdata, threads) render as
   * placeholders. Pair with `print(usagi.dump(state))` for terminal
   * debugging or feed the result into `gfx.text` to draw it on screen.
   * @param v  the value to inspect
   * @returns pretty  human-readable Lua-ish source for `v`
   */
  function dump(v: unknown): string;
  /**
   * Persist a Lua table as JSON. Saves are per-game, namespaced by
   * `game_id` from `_config()`. One file per game; nest your own
   * structure inside (settings, run state, unlocks).
   * @param t  table to serialize. functions, userdata, NaN, and cycles error
   */
  function save(t: object): void;
  /**
   * Read the persisted save table back. Returns `nil` on first run
   * (no save file). Idiomatic call: `state = usagi.load() or { ... defaults ... }`.
   */
  function load(): object | undefined;
  /**
   * Reads a JSON file from the project's `data/` dir and returns it
   * as a Lua table. `path` is forward-slash-separated and relative to
   * `data/` (e.g. `"levels/01.json"`). Bundled by `usagi export`, so
   * the same call works in dev and shipped builds. Hot-reload-aware:
   * editing any file under `data/` triggers a script reload, so
   * top-level `local levels = usagi.read_json("levels.json")` picks
   * up new bytes without F5.
   * @param path  forward-slash path under `data/`, e.g. `"levels/01.json"`
   */
  function read_json(path: string): object;
  /**
   * Reads a text file from the project's `data/` dir as a UTF-8
   * string. Same path rules as `usagi.read_json` (forward slashes,
   * under `data/`, bundled by `usagi export`). Use this for plain
   * text (dialog scripts, CSV grids, hand-rolled formats) and split /
   * parse in Lua.
   * @param path  forward-slash path under `data/`, e.g. `"dialog/intro.txt"`
   */
  function read_text(path: string): string;
  /**
   * Serializes a Lua table to a pretty-printed JSON string. Shares its
   * shape validator with `usagi.save`, so the same rules apply: keys
   * must be all strings or a dense `1..n` integer array; functions,
   * userdata, NaN, and cycles raise an error. Useful for devtools
   * overlays, structured logs, and any place you want JSON without
   * going through the save file. Pair with `usagi.read_json` for a
   * read/encode story; `usagi.dump` is the cycle-tolerant
   * pretty-printer for ad-hoc debugging.
   * @param t  table to serialize
   * @returns json  pretty-printed JSON
   */
  function to_json(t: object): string;
  /**
   * Register a custom row on the pause menu's Top view, between
   * Continue and Settings. Up to 3 items can be registered; calls past
   * the cap raise a Lua error. Items auto-clear before each `_init`
   * re-run so registrations in `_init` start fresh every reset.
   * The callback fires when the player picks the row. The menu closes
   * after the callback returns; return Lua `true` to keep it open
   * (useful for toggles like "Mute").
   * @param label  label drawn on the row
   * @param callback  boolean?  called on selection; return true to keep the menu open
   */
  function menu_item(label: string, callback: (...args: unknown[]) => unknown): void;
  /**
   * Wipes every Lua-registered menu item. Rarely needed in practice:
   * items auto-clear on `_init` re-run. Call manually if you want to
   * swap the registered items mid-game.
   */
  function clear_menu_items(): void;
  /**
   * Flips fullscreen state and persists to `settings.json`. Same effect
   * as the pause-menu Fullscreen row and the Alt+Enter shortcut, so all
   * three paths stay in sync. The actual window flip happens at the
   * next frame start; this call's return value reflects the new state
   * immediately so `if usagi.toggle_fullscreen() then ... end` reads
   * naturally.
   * @returns fullscreen  true if fullscreen is now on
   */
  function toggle_fullscreen(): boolean;
  /**
   * Returns whether the window is currently fullscreen. Useful for
   * rendering a "Fullscreen: On/Off" row in a custom settings menu.
   */
  function is_fullscreen(): boolean;
  /**
   * Terminate the main loop the same way the pause-menu Quit row and
   * Shift+Esc do. Intended for custom in-game menus. On web the
   * internal flag still flips but the emscripten main loop owns
   * lifetime, so the canvas freezes on the last frame rather than
   * tearing down the page; gate with `usagi.PLATFORM == "web"` if your
   * menu shouldn't offer a quit option there.
   */
  function quit(): void;
}

declare namespace util {
  /**
   * Clamps `v` into `[lo, hi]`.
   * @param v
   * @param lo
   * @param hi
   */
  function clamp(v: number, lo: number, hi: number): number;
  /**
   * Returns -1, 0, or 1 according to the sign of `v`.
   * @param v
   */
  function sign(v: number): number;
  /**
   * Half-up rounding to the nearest integer. Pixel snapping is the
   * driving use case in 2D pixel-art games.
   * @param v
   */
  function round(v: number): number;
  /**
   * Moves `current` toward `target` by at most `max_delta`, never
   * overshooting. Per-frame smoothing primitive — pass a delta
   * scaled by `dt` for frame-rate independence.
   * @param current
   * @param target
   * @param max_delta
   */
  function approach(current: number, target: number, max_delta: number): number;
  /**
   * Linear interpolation. `t = 0` returns `a`, `t = 1` returns `b`.
   * Values of `t` outside `[0, 1]` extrapolate (no clamping).
   * @param a
   * @param b
   * @param t
   */
  function lerp(a: number, b: number, t: number): number;
  /**
   * Wraps `v` into `[lo, hi)`. Useful for cyclic values like angles or
   * looped indexing. Works for negative `v`: `util.wrap(-1, 0, 4) == 3`.
   * @param v
   * @param lo
   * @param hi
   */
  function wrap(v: number, lo: number, hi: number): number;
  /**
   * Boolean from time. Toggles `hz` times per second — the on/off
   * interval is `1/hz` seconds. For invincibility flicker, UI blinks,
   * low-health warnings.
   * @param t  seconds
   * @param hz  toggles per second
   */
  function flash(t: number, hz: number): boolean;
  /**
   * Remaps the value `v` from the range [start_a, end_a] into the
   * range [start_b, end_b]
   * Useful for converting between different value ranges, like
   * from [-1; 1] to [0; 1] or from [0; 1] to [0; 255]
   * Example: `util.remap(128, 0,256, 0,100)` will return 50,
   * because 128 is exactly at half of the range 0 - 256 and the
   * half of the second range (0 - 100) is 50
   * @param v  value
   * @param start_a
   * @param end_a
   * @param start_b
   * @param end_b
   */
  function remap(v: number, start_a: number, end_a: number, start_b: number, end_b: number): number;
  /**
   * Normalizes a `{x, y}` vector to unit length. Returns a new table;
   * the input is unchanged. A zero vector returns `{x = 0, y = 0}`.
   * @param v
   */
  function vec_normalize(v: Vec2): Vec2;
  /**
   * Distance between two `{x, y}` points.
   * @param a
   * @param b
   */
  function vec_dist(a: Vec2, b: Vec2): number;
  /**
   * Squared distance between two `{x, y}` points. Cheaper than
   * `vec_dist` (skips the sqrt); use for "is X closer than Y?" by
   * comparing against `r * r`.
   * @param a
   * @param b
   */
  function vec_dist_sq(a: Vec2, b: Vec2): number;
  /**
   * Builds a vector at `angle` (radians) with magnitude `len`. `len`
   * defaults to 1 for a unit vector. Pair with `math.atan(dy, dx)` to
   * convert any direction into a velocity.
   * @param angle  radians
   * @param len  magnitude (default 1)
   */
  function vec_from_angle(angle: number, len?: number): Vec2;
  /**
   * True when the `{x, y}` point is inside the rect `{x, y, w, h}`.
   * Half-open: left/top edges are inside, right/bottom edges are
   * outside. Matches typical sprite-rect hit testing.
   * @param p
   * @param r
   */
  function point_in_rect(p: Vec2, r: Rect): boolean;
  /**
   * True when the `{x, y}` point is strictly inside the circle
   * `{x, y, r}`. Points on the boundary are considered outside.
   * @param p
   * @param c
   */
  function point_in_circ(p: Vec2, c: Circ): boolean;
  /**
   * True when the two AABBs share interior area. Edge-adjacent rects
   * are considered non-overlapping.
   * @param a
   * @param b
   */
  function rect_overlap(a: Rect, b: Rect): boolean;
  /**
   * True when the two circles overlap. Tangent circles are
   * considered non-overlapping.
   * @param a
   * @param b
   */
  function circ_overlap(a: Circ, b: Circ): boolean;
  /**
   * True when a circle and a rect overlap. Uses the closest-point
   * method: clamp the circle center to the rect, test distance.
   * @param c
   * @param r
   */
  function circ_rect_overlap(c: Circ, r: Rect): boolean;
}

declare namespace effect {
  /**
   * Freezes the game's `_update` loop for `time` seconds. `_draw` keeps
   * running so the world stays on-screen. The classic juice trick for
   * weighty hits: pair with `effect.screen_shake` and `effect.flash` on
   * impact. If a longer hitstop is already in flight, this call is a
   * no-op (longer wins).
   * @param time  seconds to freeze update
   */
  function hitstop(time: number): void;
  /**
   * Shakes the rendered view for `time` seconds with up to `intensity`
   * game-pixel offset. Magnitude decays linearly to zero across the
   * duration. The shake is applied to the RT-to-screen blit, so
   * overlays drawn outside the world (error overlay) stay
   * stable.
   * @param time  seconds to shake
   * @param intensity  maximum offset in game pixels (try 2-6)
   */
  function screen_shake(time: number, intensity: number): void;
  /**
   * Flashes a full-screen overlay of palette color `color` over the
   * rendered view for `time` seconds. Alpha decays linearly from
   * opaque to transparent. White on hits, red on damage, etc.
   * @param time  seconds the flash is visible
   * @param color  a gfx.COLOR_* constant
   */
  function flash(time: number, color: number): void;
  /**
   * Scales the `dt` passed to `_update` for `time` seconds. `scale=0.5`
   * is half-speed; `scale=0` freezes update (use `effect.hitstop` for
   * that explicitly); `scale>1` plays faster. Wall-clock decay is
   * unaffected; the slow_mo timer itself counts down at real time.
   * @param time  seconds the scale is applied
   * @param scale  dt multiplier; 0..1 for slow, >1 for fast
   */
  function slow_mo(time: number, scale: number): void;
  /**
   * Cancels every active effect immediately (hitstop, screen_shake,
   * flash, slow_mo). Useful on game-over, scene transitions, or
   * anywhere lingering juice would clash with the new state. Reset and
   * F5 / Ctrl+R already call this internally; this is the manual
   * escape hatch.
   */
  function stop(): void;
}

/**
 * Optional. Returns engine config read once before the window opens.
 * Omit if the defaults are fine.
 */
declare let _config: () => UsagiConfig | undefined;

/** Called once when the game starts. Use for loading assets and initializing state. */
declare let _init: () => void;

/**
 * Called every frame to update game state. Runs before `_draw`.
 * @param dt delta-time: seconds since last frame
 */
declare let _update: (dt: number) => void;

/**
 * Called every frame to render. Runs after `_update`.
 * @param dt delta-time: seconds since last frame
 */
declare let _draw: (dt: number) => void;

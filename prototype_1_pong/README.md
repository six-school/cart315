a little pong.

This runs on [Usagi Engine](https://usagiengine.com/), with [TypeScript](https://www.typescriptlang.org/) code compiled via [TypeScriptToLua](https://typescripttolua.github.io/). Sorry to be a weirdo, but it's comfortable for me and pretty nice for prototypes.

To run or tweak the game, first download [Usagi 1.3.2](https://codeberg.org/brettchalupa/usagi/releases/tag/v1.3.2). Grab the binary for your platform and place it in `bin/`. (Untested on Windows, scripts might need to be tweaked to handle `.exe` extension, sorry!)

You'll also need [Node.js](http://nodejs.org/) installed. If you install Node manually, you should match the version listed in [the `.node-version`](.node-version) file — but instead of installing Node directly, I recommend using [`fnm`](https://github.com/Schniz/fnm), which can automatically handle installing and switching Node versions by detecting `.node-version` files.

Once you're set, open the directory in a terminal and run:

```sh
corepack enable # enables use of the pnpm package manager for Node
pnpm install
pnpm build # compile to lua once, so usagi picks up the files
```

From now on, you should be able to run `pnpm dev` to spin up the compiler and game engine in parallel. The main file is [`src/main.ts`](./src/main.ts). You can tweak it with the game open and changes will be hot-reloaded instantly. You may need to `F5` to reset the game state if things get funky.

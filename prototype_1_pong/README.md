a few pongs.

[**play online here.**](https://six-school.github.io/cart315/)

This runs on [Usagi Engine](https://usagiengine.com/), with [TypeScript](https://www.typescriptlang.org/) code compiled via [TypeScriptToLua](https://typescripttolua.github.io/). Sorry to be a weirdo — I've found it's a really comfortable API for small game prototypes, with hot-reloading and convenient web builds.

# Developing

To tweak and modify the game yourself, first download [Usagi 1.3.2](https://codeberg.org/brettchalupa/usagi/releases/tag/v1.3.2). Grab the binary for your platform and place it in `bin/`. (Untested on Windows, scripts might need to be tweaked to handle `.exe` extension, sorry!)

You'll also need [Node.js](http://nodejs.org/) installed. If you install Node manually, you should match the version listed in [the `.node-version`](.node-version) file — but instead of installing Node directly, I recommend using [`fnm`](https://github.com/Schniz/fnm), which can automatically handle installing and switching Node versions by detecting `.node-version` files.

Once you're set, open the directory in a terminal and run:

```sh
corepack enable # enables use of the pnpm package manager for Node
pnpm install
pnpm tstl # compile to lua once to "warm up" so that usagi picks up the files
```

After the above one-time setup is complete, from now on you can run

```sh
pnpm dev
```

and it'll spin up the compiler and game engine in parallel. The main file is [`src/main.ts`](./src/main.ts). You can tweak it with the game open and changes will be hot-reloaded instantly. Hot-reloading preserves game state! You can hit `F5` to reset it to the initial state (and indeed you may occasionally need to do so if things get funky).

To build the web version, run `pnpm build`.

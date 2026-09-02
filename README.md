# A PedroPath visualizer

![GIF of visualizer](./docs/screencap.gif)

## How to use this thing:

0. Have a _non-Safari_ web browser installed.
1. Install the [Bun](https://bun.com) or [NodeJS](https://nodejs.org) Javascript
   runtime.
2. Either:
   1. Navigate to the root of your robot source code directory from a command
      line
      - Windows: use Windows Terminal or the Command Host, and PowerShell or
        Command Prompt.
      - MacOS: use Terminal or iTerm (or WezTerm, or whatever terminal emulator
        and shell you want).
      - Linux: Use your favorite terminal emulator and shell. If you're using
        Linux, you don't need my help.
      - use `cd <folder location>` to get to where you put your source code.
   2. Type `bunx @freik/pedroviz` or `npx @freik/pedroviz` (depending on if you
      prefer Bun or NodeJS)
3. Or:
   1. Open up a command line inside Android Studio
   2. type `bunx @freik/pedroviz` (or `npx @freik/pedroviz`) and hit _`enter`_
      (because Android Studio puts you in the right directory automagically)
4. Advanced folks (who might use Bun or NodeJS for other things as well):
   1. Add it to your `package.json` dependency list: `bun add @freik/pedroviz`
      or `npm install @freik/pedroviz`
   2. Make a script to call `pedroviz`. If the `package.json` file isn't in your
      source repo root, add the location of your source as the second command.
      Something like this: `"pedro": "pedroviz ../BioBuzz"` and then you can
      call it by typing `bun pedro` or `npm run pedro` if you'd prefer!

The first time you use the app, it will take some time to download & install the
package. Once it's been installed, you no longer need to be connected to the
interwebs to use the visualizer. So you can be connected to your _robot_ :D

You'll see something like this:

```text
🚀 🚀 🚀 🚀 🚀
Pedro Visualization application is running at http://localhost:58888

(Your browser should open automatically, but if it doesn't, open a browser
and go to that URL. The 'http://' is important, as the browser will not allow
the application to run without it.)

*********************************************
>>> Press Ctrl+C to stop the application. <<<
*********************************************
```

And then a browser window should open up. If it comes up with a 404, just
refresh the window. Depending on how fast your computer is, it can take a few
seconds. Once the application is visible:

1. Select your robot (if you have multiple TeamCode-like directories), source
   file (if you have multiple files that contain PedroPath Poses, Beziers, and
   PathChains), and the specific Java Class (if you have multiple nested classes
   in a single `.java` source file). If you only have one file with all your
   paths-n-stuff in it, it will be automatically selected for you.
2. Expand the Values, Poses, Curves, and PathChains section to see the data.
3. Select a PathChain to see a robot follow the path.

# Goals / What is this? / Why not just use the [PedroPath Visualizer](https://visualizer.pedropathing.com)?

The **goal** is for this to be a _local_ application that let's you vizualize
and edit PedroPath's. The _reasons_ for this as opposed to just using
[visualizer.pedropathing.com](https://visualizer.pedropathing.com/) are twofold:

1. When you're connected to the bot (for deployment, debugging, or using a
   panel) you can't use the Visualizer, so you have to launch it, then switch
   your wifi. BOOO!
2. This integrates into your code. It's currently not capable of _creating_
   paths, but writing the code and seeing it is, IMO, much better than trying to
   keep a source file in sync with the visualizer yourself through horrible
   copy-paste shenanigans.

Basically: **_No more copying stuff back and forth!_** Just write your code and
see what it looks like. _Eventually_, this will create a class for you, and
allow you to name values, points, curves, and paths. Honestly, using Panels to
update things live while keeping the source code "in sync" would also be
_amazing_, but that's probably not going to happen in the foreseeable future.

# Current status

Reading, rendering poses, curves, and paths, and animating paths including
_most_ headings works (`offset`s, some `reverse` usages, and
`GlobalHeadingInterpolator`s don't currently work). You can't do anything
fancier than `Math.toRadians(...)` in a numeric expression, either. I'm certain
that folks have code & coding styles/patterns that I don't (yet) properly
handle, but if you started using the
[PP Visualizer](https://visualizer.pedropathing.com) and then added a bunch more
straight forward code from there, this thing will probably show you your paths.

# Hey, Kevin, this doesn't work!

If your code doesn't show up properly, please send the file my way! I'm happy to
extend my silly Java interpretation engine to handle your way of doing stuff!
You can also create an issue. I'll do my best to stay on top of them. I'm
retired, so this is a priority for me (along with all my other random projects
around the house, and other coding projects, but I do let FTC Robotics eat a lot
of my frei time, because I love working with FTC students...)

**Task TODO list, in some sort of order:**

- [x] Read paths from code
  - [x] Specify robot dimensions (and other settings)
- [x] Document basic usage
- [x] Allow detection of `field-dark.jpg` and `field-light.jpg` from the users's
      code for game-specific field backgrounds
- [ ] Increase test coverage (ongoing)
- [ ] Display Java source parsing issues so users can see if they should fix
      their code, or send their code to me.
- [ ] Fix interpolation to be a per-path thing.
- [ ] Get this stuff working on Safari. I've enabled dev mode, and it looks like
      something with the ResizeObserver for the Canvas isn't working. Works fine
      on Firefox, Chrome, and Brave on Mac, Linux, and Windows (and Edge works,
      too).
- [ ] Support more complex math expression parsing & evaluation
- [ ] Edit existing:
  - [ ] Named values
  - [ ] Named poses
  - [ ] Named curves
  - [ ] Named PathChains
- [ ] Allow editing points by dragging them on the canvas
- [ ] Reflect those changes in the code
  - [ ] Checksum the code to detect external edits
  - [ ] When external edits have occurred, try to resolve the conflicts?
        (ugh...)
  - [ ] Maintain comments
  - [ ] Maintain any code that I don't actually parse from the source code (keep
        chunks of code that aren't represented in the UI)
- [ ] Allow creation:
  - [ ] Named values
  - [ ] Named poses
  - [ ] Named curves
  - [ ] Named PathChains
- [ ] Enable "warning" lines: warn if the robot crosses a line on a path
- [ ] Make work with nodejs (`npx`) as well?
- [x] Specify different alliance paths (doable through multiple classes...)
  - [ ] Bonus: Reflect a path along a line or axis
- [ ] Support additional parts of the path builder
  - [x] multiple paths
  - [x] path headings (global and last)
  - [ ] max velocity (or, you know, any velocity/acceleration model for
        animation)
  - [ ] braking strength
  - [ ] tValues (Not sure what this would really look like...)
- [ ] Eventually, migrate to use a text file, instead of java source code for
      static paths?
  - [ ] Maybe as part of the SystemCore migration? I've got this done, so adding
        stuff over there seems reasonable...

# Development

This whole thing is built with [Typescript](https://www.typescriptlang.org/).
I'm using [Hono](https://hono.dev/) as a local web server,
[React](https://react.dev/) with [Jotai](https://jotai.org/) for state
management and [FluentUI](https://developer.microsoft.com/en-us/fluentui#/) as
the UI/control toolbox. None of these frameworks are too complicated to get
started with, but each have their own sets of weirdness. Feel free to reach out
to me if you're trying to understand the code, add a feature, or fix a bug.

The back end code is all served through `src/entry.ts` which serves up the
.ts/.tsx files from the `src/client` subdirectory, and runs the stuff in the
`src/server` subdirectory on the backend.

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev:bundle
```

then in a different window:

```bash
bun dev {FTC Source Location}
```

To bundle for production (only for Kevin, sorry):

```bash
bun prod:bundle
npm publish --access=public
```

### Buy, why????

Why did I build it this way, instead of using Java? Because I didn't want to
learn a new UI toolkit. I've been using React for a very, very long time. It's
cross-platform, and functional (in the mathematical/programming sense of the
word). Typescript is just flat out better than Javascript (fight me...), and I
switched to using [Recoil](https://github.com/facebookexperimental/Recoil) when
one of the engineers I supported while working at Facebook built in back in 2020
because I really hated all the boilerplate in Redux. Recoil is dead, but Jotai
was a public reimplementation that's still actively supported.

While a Microsoft employee, I had learned WinForms and WPF way way way back in
the day, but the various MVC/MVVM data-binding shenanigans just slowly sapped my
will to build UI's. Writing UI as functional, composable components makes my
brain so much happier than MVC or MVVM or any sort of forced "this is the UI,
and that's the data model" kind a crap.

I also have no interest in learning a different UI framework, particularly
something that's not going to be available everywhere I care about (Java on an
iPhone is not really a thing). So, it's TypeScript, and React. (I actually built
[a little C++ app framework](https://github.com/kevinfrei/cuark) that lets me
write much bigger, more complex things that use React + Typescript for the UI
across Linux, macOS, and Windows, and it's _not_ React Native: Maybe in the
footure I'll migrate to that framework? I dunno: `bunx @freik/pedroviz` is
embarassingly easy to do...).

Just know that I'm a grumpy old programmer who retired before Claude Code stole
the joy of coding if you're willing to pay $500+/month to light the planet on
fire. I love to write code. I _can_ code review (that's my primary role as a
mentor on FTC) but honestly, asking some miserable AI to create code when I'd
prefer to do it myself, and then have to code review that miserable AI's code
is...well, miserable. There's no joy to be had in helping the techno-fascists
pillage and destroy the planet, while **also** killing jobs that humans are
pretty good at, and that I actually happen to really enjoy.

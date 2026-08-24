# A PedroPath visualizer

The **goal** is for this to be a _local_ application that let's you vizualize
and edit PedroPath's. The _reasons_ for this as opposed to just using
[visualizer.pedropathing.com](https://visualizer.pedropathing.com/) are twofold:

1. When you're connected to the bot (for deployment, debugging, or using a
   panel) you can't use the Visualizer, so you have to launch it, then switch
   your wifi. BOOO!
2. This should integrate into your code. No more copying stuff back and forth!
   It will (eventually) create the class for you, and allow you to name points,
   instead of just having random numerical names. Honestly, using Panels to
   update things live would be _amazing_: Your code and the bot on the field are
   kept in sync!

# Current status

Reading, rendering poses, curves, and paths, and animating paths including
_most_ headings works. You can't currently do anything fancier than
`Math.toRadians(...)` in a numeric expression, and I'm certain that folks have
patterns that I don't properly handle, but if you started using the
[PP Visualizer](https://visualizer.pedropathing.com) and then added a bunch more
straight forward code from there, this thing will probably show you your paths.

That's all well and good, but you can't use it without using it as a git
submodule yet, so I need to publish what I have to NPM so that average humans
can actually use it...

**Tasks, in order:**

- [x] Read paths from code
- [x] Display those paths on the canvas.
- [x] Highlight hovered-over paths/curves/points
  - [x] Highlight the hovered path/curve/point in the PathChain list
- [x] Animate the robot along the path
  - [ ] Specify robot dimensions
- [x] Put the field graphic under the canvas
- [x] Have a grid key near/under the canvas
- [x] Publish to NPM to enable use without using it as a git submodule
- [ ] Document Usage!
- [ ] Increase test coverage
- [ ] Make work with nodejs as well
- [ ] Support more complex math expression evaluation
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
- [x] Specify different alliance paths (this is doable through multiple
      classes...)
  - [ ] Bonus: Reflect a path along a line or axis
- [ ] Support additional parts of the path builder
  - [x] multiple paths
  - [x] path headings (global and last)
  - [ ] max velocity (or, you know, any velocity/acceleration model)
  - [ ] braking strength
  - [ ] tValues

# Docs-n-stuff

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun pvdev
```

To run for production:

```bash
bun pvstart
```

## Development

I'm using [React](https://react.dev/),
[Typescript](https://www.typescriptlang.org/), with [Jotai](https://jotai.org/)
for state management and
[FluentUI](https://developer.microsoft.com/en-us/fluentui#/) as the UI/control
toolbox. None of them are too complicated, but each have their own sets of
weirdness. Feel free to reach out to me if you're trying to understand the code,
add a feature, or fix a bug.

On the backend, everything is just written in Typescript. It made deployment
much easier. It's built and served from a `Bun.serve` invocation. I'll probably
want to figure out how to package it up in a single bundle in the future, but
for now, that's good enough.

The back end code is all served through `index.tsx` which serves up the .ts/.tsx
files from the `pedroviz` subdirectory, and runs the stuff in the `server`
subdirectory on the backend.

TODO: Write moar dox

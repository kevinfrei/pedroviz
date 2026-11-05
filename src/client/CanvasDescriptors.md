# Canvas Descriptors

I need a way to describe where a given point or heading 'lives' to be able to
support graphical changes to points & headings. The bottom of the hierarchy is a
"value". From there you have Poses (2 values, plus a heading), Interpolations
(Headings & points/poses), curves (mulitple points, with interpolations), and
paths (multiple curves, with an interpolation). There may be multiple uniquely
identified points at the same numeric location (discrete selection is possible
through the named lists) but there's also likely a high degree of "shared"
poses, such that moving one changes multiple curves, paths, and potentially even
headings. Only uniquely identified points should be selectable. In the code,
this basically means that only values that exist in the ShallowEval symbol table
need to be rendered. Similarly, only values that exist in the ShallowEval table
can be _changed_.

This is all encoded in the SymbolTable types: ValueRef, PoseRef, InterpRef,
CurveRefs, and Path's. For each point, I need to be able to get back to it's
container. If the user clicks a point, I need to be able to get to the correct
item to change. Enumerated from easiest to hardest:

- Named Pose: Value Ref X, Value Ref Y, (heading Ref)
- Interpolation Facing Point: Named or Anonymous Pose
- Curve Pose: Named or Anonymous Pose _list_
- Path pose: Named or Anonymouse Curve Pose

So I need to encode which type of point each one that's rendered/selectable is.

I believe I want to build a little 'language' that allows interpretation to get
to the container cell for a given value. It should be easy to interpret, and
obvious if it's wrong. For each value (X, Y, Angle) it could be

- A value: `v:<name>`
- A raw pose value: `p:<name>:x`, `p:<name>:y`, or `p:<name>:h`
- An interpolation:
  - A Constant interpolation heading: `i:<name>:c`
  - A Linear interpolation heading: `i:<name>:s` or `i:<name>:e`
  - A FacingPoint interpolation: `i:<name>:x`, or `i:<name>:y`
  - A Piecewise entry: `ip:<name>:<index>:[dig]`
- A curve point: `c:<name>:<index>:x`, `c:<name>:<index>:y`
- A curve's interpolation: `ci:<name>:[dig]`
- A path's curve's point: `P:<name>:<index>:[dig]`
- A path's global interpolator `P:<name>:[dig]`

If I actually ending this stuff as strings, I need to worry about name
conflicts, so instead maybe split it into descriptor and data fields.

For ease of 'stuff' all headings are in degrees, and all numbers are
zero-indexed:

- ["name",<selector>...]
- <selector>:
  - 'v': a value
  - 'x': a pose x value (may have a prefix)
  - 'y': a pose y value (may have a prefix)
  - 'h': a pose heading value (may have a prefix)
  - 't': a constant interpolation heading (may have a prefix)
  - 's': a linear interpolation start heading (may have a prefix)
  - 'e': a linear interpolation end heading (may have a prefix)
  - 'f': a facing interpolation pose (may have a prefix)
  - 'u##': an 'until' piece (not needed, but here for ease of dealing with
    stuff)
  - 'w##...': a piece-wise interpolator, item ##, with the subsequent info after
    the ##
  - 'c##...': a curve/line's pose ##
  - 'C...': a curve/line's interpolator
  - 'p##...': a path's ## curve's data (... is the curve data)
  - 'I...': a path's global interpolator (... is the interpolator data)

I need a generator (create a descriptor from a value 'location') and a setter
(change the value for the specific location). It might also make sense to make a
'getter': Read a value from the given location, though that's not obviously
useful right now.

Instead, perhaps, X, Y, and H values are [get,set] pairs? _Maybe_ less
complicated, but most definitely uses more memory.

# Mathematical background collection

Sixteen original SVGs with transparent canvases, a restrained violet/cyan
palette, fine lines and explicit depth or crossing cues where appropriate.
They are schematic constructions inspired by the site's research themes,
not reproductions of paper figures or plots of measured data.

| SVG | Mathematical content |
| --- | --- |
| `brillouin-torus.svg` | Parametric torus, with independent meridian and longitude cycles. |
| `mobius-band.svg` | Ruled strip with a half twist and a single continuous boundary. |
| `hopf-fibres.svg` | Eight pairwise linked Hopf fibres, stereographically projected from the three-sphere. Each pair is linked once. |
| `trefoil-knot.svg` | Tubular rendering of `(sin t + 2 sin 2t, cos t − 2 cos 2t, −sin 3t)`. |
| `bloch-sphere.svg` | Unit sphere, basis-state poles, coordinate axes and a normalized pure-state vector. |
| `dirac-cone.svg` | Conical two-band dispersion, `E±` proportional to `±sqrt(kx² + ky²)`. |
| `euler-winding.svg` | Winding-two planar vector field `(cos 2θ, sin 2θ)`. |
| `node-braid.svg` | Three smooth band-node trajectories, with successive exchanges and over/under ordering. |
| `surface-code.svg` | Edge qubits on a square lattice, with a Z plaquette and X star highlighted; a bulk schematic without specified finite boundaries. |
| `toric-code.svg` | Square cellulation of a torus, with qubits on edges and two noncontractible cycles. |
| `fano-plane.svg` | Seven points and seven lines of `PG(2,2)`. Binary vector labels on each line sum to zero. |
| `quantum-circuit.svg` | Hadamard and CNOT chain preparing a four-qubit GHZ state. |
| `syndrome-circuit.svg` | Four data-controlled CNOTs and an ancilla measurement measuring `Z₁Z₂Z₃Z₄`. |
| `kagome-lattice.svg` | Nearest-neighbour corner-sharing triangles and a highlighted six-site loop. |
| `band-contours.svg` | Energy contours of the toy Hamiltonian `sin(kx)σx + sin(ky)σy + (1.2 + cos(kx) + cos(ky))σz`. |
| `temporal-network.svg` | Three schematic snapshots of an eight-node network with changing interactions. |

## Placement

Each decorated page samples uniformly from all 16 motifs without replacement.
The Graphics page has no background decorations. On desktop, positions are
sampled continuously across the viewport, with a modest bias toward the
margins and a check against excessive clipping or overlap. There are no fixed
corner slots. Each drawing gets its own size, opacity and rotation: up to
19 degrees in either direction, or 9 degrees for labelled circuit/Fano diagrams.
Diagrams are never mirrored, preserving their handedness. Background opacity
is reduced by 12% from the initial version; the Graphics page shows each figure
at its original contrast.

Small screens (720px and below) and touch-only devices show one graphic centered
behind the reading column, in the fixed background layer. This includes phones
in landscape orientation. Initial placement uses the introductory text when
that text is in view; otherwise it uses the center of the available viewport.
Its pixel coordinates and size then stay fixed while scrolling, including when
the browser address bar changes height or fonts finish loading. Placement is
recomputed only when the screen width or mobile/desktop layout mode changes.
The initial rotated canvas fits within the viewport below the header, with rotation
limited to 6 degrees in either direction. Opacity stays between 16% and 22%,
and the reading-column fade is removed, so fine lines remain visible behind the
text. The graphic adds no space to the page and never changes the reading order.

Desktop screens show one or two graphics, with a chance of three on large
screens. Resizing preserves the selected motifs and restores their original
random arrangement when returning to desktop. The drawings remain still between
refreshes. The Graphics page continues to omit these decorations at every size.

On desktop, the actual `.page-inner` bounds determine a gentle opacity mask over
the reading column. On devices with a fine pointer and hover support, exposed backgrounds
highlight on hover or keyboard focus and link to their exact `graphics.html#…`
entry. Each link has a descriptive accessible name and a hover title. The full
reading column, including its text, figures, gaps and footer, blocks background
clicks; the header also stays above the graphics. Scrolling remains native.
Touch-only devices keep the graphics decorative and hidden from assistive
technology. Graphics are omitted from print and from the Graphics page itself.
Only the chosen local SVGs load; no `fetch()` or external image service is used.

All diagram labels are typeset from LaTeX notation in Computer Modern, including
subscripted qubits and stabilizers, kets, Greek letters and coordinate labels.
Glyphs are embedded as SVG paths, so no visitor font installation or font
request is needed. The source notation is retained in each label's `data-latex`
attribute. The catalogue includes the same updated drawings; its prose headings
use embedded Latin Modern Roman outlines.

At the website root, `script.js` controls motif choice, counts, sampling and
angles. The final marked block in `styles.css` controls fading and presentation.
Page content and the existing graphic selection probabilities are preserved.

`background-catalogue.svg` shows all 16 graphics at full strength. The optional
`tools/generate_backgrounds.py` regenerates the SVGs using Python, NumPy and
Matplotlib. Those are authoring dependencies only; the website requires no build
step or new JavaScript library.

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
The Graphics page has no background decorations. Positions are sampled
continuously across the viewport, with a modest bias toward the
margins and a check against excessive clipping or overlap. There are no fixed
corner slots. Each drawing gets its own size, opacity and rotation: up to
19 degrees in either direction, or 9 degrees for labelled circuit/Fano diagrams.
Diagrams are never mirrored, preserving their handedness. Background opacity
is reduced by 12% from the initial version; the Graphics page shows each figure
at its original contrast.

Mobile screens show one graphic. Desktop screens show one or two, with a chance
of three on large screens. Resizing preserves the chosen arrangement while
scaling its coordinates. The drawings remain still between refreshes.

The actual `.page-inner` bounds determine a gentle opacity mask over the reading
column. Graphics have empty alternative text, live inside an `aria-hidden`
layer, cannot intercept clicks or scrolling, and are omitted from print.
Only the chosen local SVGs load; no `fetch()` or external image service is used.

At the website root, `script.js` controls motif choice, counts, sampling and
angles. The final marked block in `styles.css` controls fading and presentation.
The rest of the original script and stylesheet is preserved.

`background-catalogue.svg` shows all 16 graphics at full strength. The optional
`tools/generate_backgrounds.py` regenerates the SVGs using Python, NumPy and
Matplotlib. Those are authoring dependencies only; the website requires no build
step or new JavaScript library.

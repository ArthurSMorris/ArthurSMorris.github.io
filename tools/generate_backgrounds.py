"""Optional SVG authoring tool. Run with Python, NumPy and Matplotlib.

The website itself has no Python, build or plotting-library dependency.
All figures are geometric constructions or schematic models, not empirical data.
"""
from pathlib import Path
import html
import json
import math
from functools import lru_cache
import numpy as np
from matplotlib.font_manager import FontProperties
from matplotlib.path import Path as GlyphPath
from matplotlib.textpath import TextPath, TextToPath

OUT = Path(__file__).resolve().parents[1] / "assets" / "backgrounds"
TAU = 2 * math.pi
INK, VIOLET, CYAN, MUTED, BG = "#c6c3ff", "#a8a5ff", "#87c8d6", "#7186a4", "#1b2432"
MANIFEST = []


def n(x):
    return f"{float(x):.2f}".rstrip("0").rstrip(".")


def attrs(**kw):
    return " ".join(f'{k.replace("_", "-")}="{html.escape(str(v), quote=True)}"' for k, v in kw.items() if v is not None)


def path(points, color=INK, width=1.4, opacity=1, close=False, fill="none", dash=None):
    p = np.asarray(points)
    d = "M" + " L".join(f"{n(x)},{n(y)}" for x, y in p[:, :2]) + (" Z" if close else "")
    return f'<path {attrs(d=d, fill=fill, stroke=color, stroke_width=width, opacity=opacity, stroke_dasharray=dash)}/>'


def circle(x, y, r, color=INK, width=1.4, fill="none", opacity=1):
    return f'<circle {attrs(cx=n(x), cy=n(y), r=n(r), stroke=color, stroke_width=width, fill=fill, opacity=opacity)}/>'


@lru_cache(maxsize=128)
def math_glyphs(latex, size):
    """Typeset LaTeX notation with Computer Modern and embed its glyph outlines.

    Matplotlib's mathtext renderer supplies the font and mathematical layout;
    visitors need neither a font download nor a TeX installation.
    """
    properties = FontProperties(size=size, math_fontfamily="cm")
    expression = "$" + latex + "$"
    width, _, _ = TextToPath().get_text_width_height_descent(expression, properties, ismath=True)
    glyphs = TextPath((0, 0), expression, prop=properties, usetex=False)
    commands = []
    command_names = {GlyphPath.MOVETO: "M", GlyphPath.LINETO: "L", GlyphPath.CURVE3: "Q", GlyphPath.CURVE4: "C"}
    for points, code in glyphs.iter_segments(curves=True, simplify=False):
        if code == GlyphPath.CLOSEPOLY:
            commands.append("Z")
        else:
            commands.append(command_names[code] + " ".join(n(value) for value in points))
    return float(width), " ".join(commands)


def label(x, y, text, color=INK, size=21, anchor="middle"):
    width, outline = math_glyphs(text, size)
    offset = {"start": 0, "middle": .5, "end": 1}[anchor] * width
    transform = f"translate({n(x-offset)} {n(y)}) scale(1 -1)"
    return f'<g class="math-label" {attrs(data_latex=text, fill=color, stroke="none", transform=transform)}><path d="{outline}"/></g>'


def arrow(a, b, color=INK, width=1.6, head=7, opacity=1):
    a, b = np.array(a, dtype=float), np.array(b, dtype=float)
    v = (b-a) / np.linalg.norm(b-a)
    side = np.array([-v[1], v[0]])
    return path([a,b],color,width,opacity) + path([b-v*head+side*head*.4,b,b-v*head-side*head*.4],color,width,opacity)


def save(name, title, description, elements):
    OUT.mkdir(parents=True, exist_ok=True)
    content = '\n'.join([
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" aria-labelledby="title description">',
        f'<title id="title">{html.escape(title)}</title>',
        f'<desc id="description">{html.escape(description)}</desc>',
        '<g fill="none" stroke-linecap="round" stroke-linejoin="round">',
        *elements, '</g>', '</svg>'
    ])
    (OUT / (name+'.svg')).write_text(content+'\n',encoding='utf-8')
    MANIFEST.append(dict(name=name,title=title,description=description,file=name+'.svg'))


class Camera:
    def __init__(self, az=-.7, el=.56, scale=95, center=(320,320)):
        self.right = np.array([-math.sin(az), math.cos(az), 0])
        self.up = np.array([-math.cos(az)*math.sin(el), -math.sin(az)*math.sin(el), math.cos(el)])
        self.eye = np.array([math.cos(az)*math.cos(el), math.sin(az)*math.cos(el), math.sin(el)])
        self.scale, self.center = scale, np.array(center)

    def project(self, points):
        p = np.asarray(points)
        return np.stack([p@self.right*self.scale+self.center[0], -p@self.up*self.scale+self.center[1], p@self.eye],axis=-1)


def mesh(scene,cam,fn,us,vs,color=MUTED,width=.62,fill='#263249'):
    q = cam.project(np.array([[fn(u,v) for v in vs] for u in us]))
    for i in range(len(us)-1):
        for j in range(len(vs)-1):
            face = q[[i,i+1,i+1,i],[j,j,j+1,j+1]]
            scene.append((float(face[:,2].mean()),path(face,color,width,close=True,fill=fill)))


def curve(scene,cam,points,color=INK,width=2,bias=.018):
    q = cam.project(points)
    for a,b in zip(q[:-1],q[1:]):
        scene.append(((a[2]+b[2])/2+bias,path([a,b],color,width)))


def sorted_scene(scene):
    return [element for depth,element in sorted(scene,key=lambda item:item[0])]


def torus_function(u,v):
    return [(1.82+.66*math.cos(v))*math.cos(u),(1.82+.66*math.cos(v))*math.sin(u),.66*math.sin(v)]


def torus():
    cam=Camera(az=-.65,el=.68,scale=92); scene=[]; f=torus_function
    mesh(scene,cam,f,np.linspace(0,TAU,65),np.linspace(0,TAU,25))
    curve(scene,cam,[f(u,.47) for u in np.linspace(0,TAU,400)],INK,2.2)
    curve(scene,cam,[f(1.1,v) for v in np.linspace(0,TAU,180)],CYAN,2.5)
    save('brillouin-torus','Brillouin torus','A parametric torus with its two independent cycles highlighted; a geometric model of a two-dimensional Brillouin zone.',sorted_scene(scene))


def mobius():
    cam=Camera(az=-.45,el=.6,scale=91); scene=[]
    def f(u,v):
        return [(1.88+v*math.cos(u/2))*math.cos(u),(1.88+v*math.cos(u/2))*math.sin(u),v*math.sin(u/2)]
    mesh(scene,cam,f,np.linspace(0,TAU,97),np.linspace(-.7,.7,15),width=.66)
    for v in [-.7,.7]:
        curve(scene,cam,[f(u,v) for u in np.linspace(0,TAU,400)],INK,2.3)
    curve(scene,cam,[f(u,0) for u in np.linspace(0,TAU,400)],CYAN,1.9)
    save('mobius-band','Möbius band','A ruled strip with a half twist. Its two parameter edges join into one continuous boundary.',sorted_scene(scene))


def broken_curves(curves,colors,width=2.6,gap=8):
    """Cut only the lower arc at each projected crossing, preserving link topology."""
    cuts=[np.zeros(len(q)-1,dtype=bool) for q in curves]
    for i,a in enumerate(curves):
        for j in range(i,len(curves)):
            b=curves[j]
            for k,(a0,a1) in enumerate(zip(a[:-1],a[1:])):
                delta=a1[:2]-a0[:2]; origin=b[:-1,:2]-a0[:2]; edges=b[1:,:2]-b[:-1,:2]
                denom=delta[0]*edges[:,1]-delta[1]*edges[:,0]
                valid=np.abs(denom)>1e-8; den=np.where(valid,denom,1)
                s=(origin[:,0]*edges[:,1]-origin[:,1]*edges[:,0])/den
                t=(origin[:,0]*delta[1]-origin[:,1]*delta[0])/den
                for l in np.where(valid & (s>0) & (s<1) & (t>0) & (t<1))[0]:
                    if i==j and (abs(k-l)<4 or abs(k-l)>len(a)-5): continue
                    za=a0[2]+s[l]*(a1[2]-a0[2]); zb=b[l,2]+t[l]*(b[l+1,2]-b[l,2])
                    target,seg=(i,k) if za<zb else (j,l); q=curves[target]
                    radius=max(1,int(math.ceil(gap/max(np.linalg.norm(q[seg+1,:2]-q[seg,:2]),.2)/2)))
                    cuts[target][max(0,seg-radius):min(len(q)-1,seg+radius+1)]=True
    elements=[]
    for q,cut,col in zip(curves,cuts,colors):
        start=None
        for k in range(len(cut)+1):
            visible=k<len(cut) and not cut[k]
            if visible and start is None: start=k
            if not visible and start is not None:
                elements.append(path(q[start:k+1],col,width)); start=None
    return elements


def hopf():
    cam=Camera(az=-.85,el=1.08,scale=107); curves=[]
    for phi in np.linspace(0,TAU,8,endpoint=False):
        t=np.linspace(.001,TAU+.001,420); c,s=math.cos(.68),math.sin(.68)
        den=1-s*np.sin(t+phi)
        curves.append(cam.project(np.column_stack([c*np.cos(t)/den,c*np.sin(t)/den,s*np.cos(t+phi)/den])))
    save('hopf-fibres','Linked Hopf fibres','Eight fibres of the Hopf map stereographically projected from the three-sphere. Each pair is linked once; gaps preserve their projected over-under ordering.',broken_curves(curves,[INK,VIOLET,CYAN,MUTED]*2,2.3,9))


def trefoil():
    cam=Camera(az=-.1,el=1.16,scale=78); t=np.linspace(0,TAU,241)
    p=np.column_stack([np.sin(t)+2*np.sin(2*t),np.cos(t)-2*np.cos(2*t),-np.sin(3*t)])
    tangent=np.gradient(p,axis=0); tangent/=np.linalg.norm(tangent,axis=1)[:,None]
    normal=np.cross(tangent,np.tile([0,0,1.],(len(p),1))); normal/=np.linalg.norm(normal,axis=1)[:,None]
    binormal=np.cross(tangent,normal); angles=np.linspace(0,TAU,13)
    tube=p[:,None,:]+.115*(np.cos(angles)[None,:,None]*normal[:,None,:]+np.sin(angles)[None,:,None]*binormal[:,None,:])
    q=cam.project(tube); scene=[]
    for i in range(len(t)-1):
        for j in range(len(angles)-1):
            face=q[[i,i+1,i+1,i],[j,j,j+1,j+1]]
            shade=.32+.68*max(0,float((math.cos(angles[j])*normal[i]+math.sin(angles[j])*binormal[i])@cam.eye))
            rgb=np.array([78,90,128])+(np.array([190,184,247])-np.array([78,90,128]))*shade
            fill='#'+''.join(f'{int(x):02x}' for x in rgb)
            scene.append((float(face[:,2].mean()),path(face,fill,.35,close=True,fill=fill)))
    for angle,col in [(math.pi/3,INK),(math.pi,CYAN),(5*math.pi/3,VIOLET)]:
        curve(scene,cam,p+.117*(math.cos(angle)*normal+math.sin(angle)*binormal),col,.8,bias=.002)
    save('trefoil-knot','Trefoil knot','A smooth tubular embedding of the (2,3) torus knot, with depth-sorted faces making its three crossings legible.',sorted_scene(scene))


def bloch():
    cam=Camera(az=-.65,el=.31,scale=190,center=(320,314)); els=[]
    for latitude in [-math.pi/3,-math.pi/6,0,math.pi/6,math.pi/3]:
        t=np.linspace(0,TAU,241)
        q=cam.project(np.column_stack([np.cos(t)*math.cos(latitude),np.sin(t)*math.cos(latitude),np.full(len(t),math.sin(latitude))]))
        for a,b in zip(q[:-1],q[1:]):
            els.append(path([a,b],CYAN if latitude==0 else MUTED,1.35 if latitude==0 else .75,.85 if a[2]+b[2]>0 else .28))
    for phi in np.linspace(0,math.pi,6,endpoint=False):
        t=np.linspace(0,TAU,241)
        q=cam.project(np.column_stack([np.sin(t)*math.cos(phi),np.sin(t)*math.sin(phi),np.cos(t)]))
        for a,b in zip(q[:-1],q[1:]):
            els.append(path([a,b],MUTED,.7,.72 if a[2]+b[2]>0 else .22))
    els.append(circle(320,314,190,INK,1.7))
    for vec,name in [([1,0,0],'x'),([0,1,0],'y'),([0,0,1],'z')]:
        q=cam.project([np.array(vec)*-1.17,np.array(vec)*1.22])
        els.extend([arrow(q[0,:2],q[1,:2],MUTED,1.2,7,.85),label(q[1,0]+10,q[1,1]+4,name,MUTED,18)])
    psi=np.array([.2,.75,.63]); psi/=np.linalg.norm(psi); endpoint=cam.project([psi])[0]
    els.extend([arrow([320,314],endpoint[:2],INK,2.8,11),circle(endpoint[0],endpoint[1],5,INK,0,INK),label(endpoint[0]+22,endpoint[1]-10,r'|\psi\rangle',INK,25,'start')])
    for v,name,shift in [([0,0,1],r'|0\rangle',-15),([0,0,-1],r'|1\rangle',31)]:
        q=cam.project([v])[0]; els.extend([circle(q[0],q[1],3.5,INK,0,INK),label(q[0]-18,q[1]+shift,name)])
    save('bloch-sphere','Bloch sphere','A unit sphere, coordinate axes, computational-basis poles and a normalized pure-qubit state vector. Back-facing curves are attenuated.',els)


def dirac():
    cam=Camera(az=-.72,el=.38,scale=112); scene=[]
    for sign in [-1,1]:
        def f(u,r): return [r*math.cos(u),r*math.sin(u),sign*.98*r]
        mesh(scene,cam,f,np.linspace(0,TAU,49),np.linspace(.006,1.82,18),width=.62,fill='#243147')
        for u,col in [(.16,INK),(2.5,CYAN)]: curve(scene,cam,[f(u,r) for r in np.linspace(0,1.82,140)],col,2.1)
    els=[path([[100,391],[536,243]],MUTED,1,.6,dash='4 8'),path([[125,258],[527,384]],MUTED,1,.6,dash='4 8')]+sorted_scene(scene)+[circle(320,320,4.3,INK,0,INK)]
    save('dirac-cone','Conical band crossing','Two energy sheets proportional to plus or minus the magnitude of momentum, shown as touching wireframe cones. An illustrative two-band dispersion, not measured data.',els)


def winding():
    els=[circle(320,320,r,MUTED,.9,opacity=.4) for r in [83,151,221]]
    for y in range(-210,211,28):
        for x in range(-210,211,28):
            if not 43<=math.hypot(x,y)<=230: continue
            theta=2*math.atan2(y,x); v=np.array([math.cos(theta),-math.sin(theta)])*9; p=np.array([320+x,320-y])
            els.append(arrow(p-v,p+v,CYAN if x*y>0 else INK,1.15,4.4,.8))
    t=np.linspace(0,TAU,361); els.append(path(np.column_stack([320+183*np.cos(t),320-183*np.sin(t)]),VIOLET,1.45,.7))
    for phi in np.linspace(0,TAU,12,endpoint=False):
        p=np.array([320+183*math.cos(phi),320-183*math.sin(phi)]); v=np.array([math.cos(2*phi),-math.sin(2*phi)])*13
        els.append(arrow(p-v,p+v,INK,1.8,6))
    els.extend([circle(320,320,5,VIOLET,0,VIOLET),label(320,350,r'\nu = 2',INK,22)])
    save('euler-winding','Euler winding','The planar vector (cos 2θ, sin 2θ) turns twice around one circuit of the origin. A schematic texture relevant to Euler band crossings.',els)


def braid():
    xs=np.array([170.,320.,470.]); strands=[[] for _ in range(3)]; order=[0,1,2]
    for stage,(pair,sign) in enumerate([(0,1),(1,1),(0,-1)]):
        a,b=order[pair:pair+2]; starts=xs.copy()
        for t in np.linspace(0,1,151):
            s=(1-math.cos(math.pi*t))/2
            for node in range(3):
                x=starts[node]; z=0
                if node==a: x=(1-s)*starts[a]+s*starts[b]; z=sign*math.sin(math.pi*t)
                if node==b: x=(1-s)*starts[b]+s*starts[a]; z=-sign*math.sin(math.pi*t)
                strands[node].append([x,120+(stage+t)*132,z])
        xs[a],xs[b]=xs[b],xs[a]; order[pair],order[pair+1]=order[pair+1],order[pair]
    els=[path([[124,y],[516,y]],MUTED,.85,.4,dash='3 8') for y in [120,252,384,516]]
    els+=broken_curves([np.array(p) for p in strands],[INK,CYAN,VIOLET],3.3,12)
    for points,col in zip(strands,[INK,CYAN,VIOLET]):
        for q in [points[0],points[-1]]: els.append(circle(q[0],q[1],5.5,col,1.8,BG))
    save('node-braid','Band-node braid','Three smooth node trajectories with three exchanges and explicit crossing order, illustrating multiband node braiding.',els)


def surface_code():
    els=[]; xy=lambda i,j:np.array([125+i*78,125+j*78])
    for i in range(6): els.extend([path([xy(i,0),xy(i,5)],MUTED,1,.68),path([xy(0,i),xy(5,i)],MUTED,1,.68)])
    for i in range(5):
        for j in range(6):
            for p in [xy(i+.5,j),xy(j,i+.5)]: els.append(circle(*p,3.3,INK,0,INK,.8))
    els.append(path([xy(1,1),xy(2,1),xy(2,2),xy(1,2)],VIOLET,2.3,close=True,fill='#2d3552'))
    for p in [xy(1.5,1),xy(2,1.5),xy(1.5,2),xy(1,1.5)]: els.append(circle(*p,6.2,INK,1.7,BG))
    els.append(label(*xy(1.5,1.62),'Z',INK,25)); center=xy(4,3)
    for direction in [(-1,0),(1,0),(0,-1),(0,1)]:
        p=center+np.array(direction)*39; els.extend([path([center,p],CYAN,2.8),circle(*p,6.2,CYAN,1.7,BG)])
    els.extend([circle(*center,15,CYAN,1.2,BG),label(center[0],center[1]+7,'X',CYAN,21)])
    save('surface-code','Surface-code stabilizers','A square-lattice bulk schematic with data qubits on edges, one four-qubit Z plaquette and one four-qubit X star. No finite-code boundary conditions are asserted.',els)


def toric_code():
    cam=Camera(az=-.7,el=.79,scale=91); scene=[]; f=torus_function
    # Fine faces provide occlusion; the overlaid coarse grid is the code lattice.
    mesh(scene,cam,f,np.linspace(0,TAU,73),np.linspace(0,TAU,33),color='#28354b',width=.3)
    nu,nv=12,8
    for i in range(nu): curve(scene,cam,[f(i*TAU/nu,v) for v in np.linspace(0,TAU,160)],MUTED,1.25)
    for j in range(nv): curve(scene,cam,[f(u,j*TAU/nv) for u in np.linspace(0,TAU,300)],MUTED,1.25)
    curve(scene,cam,[f(u,0) for u in np.linspace(0,TAU,360)],INK,2.25)
    curve(scene,cam,[f(2*TAU/nu,v) for v in np.linspace(0,TAU,160)],CYAN,2.25)
    for i in range(nu):
        for j in range(nv):
            for u,v in [((i+.5)*TAU/nu,j*TAU/nv),(i*TAU/nu,(j+.5)*TAU/nv)]:
                p=cam.project([f(u,v)])[0]
                scene.append((p[2]+.026,circle(p[0],p[1],2.4,INK,0,INK)))
    save('toric-code','Toric-code lattice','A square cellulation of a torus with data qubits at edge midpoints and two noncontractible cycles highlighted. The qubit placement and periodic identifications form a toric-code lattice.',sorted_scene(scene))


def fano():
    a=np.array([320.,94.]); b=np.array([111.,456.]); c=np.array([529.,456.]); d=(a+b)/2; e=(a+c)/2; f=(b+c)/2; g=(a+b+c)/3
    els=[path([a,b,c],INK,1.8,close=True),circle(*g,np.linalg.norm(f-g),CYAN,2.3,fill='#223344')]
    for p,q in [(a,f),(b,e),(c,d)]: els.append(path([p,q],VIOLET,1.35))
    for p,text,offset in [(a,'001',(0,-20)),(b,'010',(-27,23)),(c,'100',(27,23)),(d,'011',(-35,-8)),(e,'101',(35,-8)),(f,'110',(0,33)),(g,'111',(35,5))]:
        els.extend([circle(*p,6.5,INK,1.8,BG),circle(*p,2.3,INK,0,INK),label(p[0]+offset[0],p[1]+offset[1],text,CYAN if text in ['011','101','110'] else INK,18)])
    save('fano-plane','Fano plane','The seven points and seven three-point lines of PG(2,2). Nonzero binary vectors label points; every line has vector sum zero. Related to the Hamming and Steane code constructions.',els)


def cnot(els,x,y0,y1,color=CYAN):
    els.extend([path([[x,y0],[x,y1]],color,2),circle(x,y0,5.6,color,0,color),circle(x,y1,15,INK,1.8,BG),path([[x-9,y1],[x+9,y1]],INK,1.8),path([[x,y1-9],[x,y1+9]],INK,1.8)])


def circuit():
    els=[]; ys=[176,270,364,458]
    for y in ys: els.extend([path([[113,y],[549,y]],MUTED,1.6),label(82,y+7,r'|0\rangle',INK,25)])
    x,y=174,ys[0]
    els.extend([path([[x-23,y-23],[x+23,y-23],[x+23,y+23],[x-23,y+23]],INK,1.8,close=True,fill='#273249'),label(x,y+8,'H',INK,26)])
    for i,x in enumerate([277,380,483]): cnot(els,x,ys[i],ys[i+1])
    save('quantum-circuit','GHZ preparation circuit','A Hadamard on the first of four zero-state qubits and a chain of three CNOT gates prepare (0000 plus 1111) divided by the square root of two.',els)


def syndrome():
    els=[]; ys=[132,211,290,369,478]
    for i,y in enumerate(ys): els.extend([path([[105,y],[550,y]],MUTED,1.5),label(81,y+6,r'|0\rangle' if i==4 else f'q_{{{i+1}}}',INK,21)])
    for i,x in enumerate([175,265,355,445]): cnot(els,x,ys[i],ys[4])
    x,y=528,ys[4]
    els.append(path([[x-23,y-23],[x+23,y-23],[x+23,y+23],[x-23,y+23]],INK,1.7,close=True,fill=BG))
    t=np.linspace(math.pi,TAU,60)
    els.append(path(np.column_stack([x+14*np.cos(t),y+6+14*np.sin(t)]),INK,1.4))
    els.append(arrow([x,y+6],[x+10,y-9],CYAN,1.5,4))
    els.append(label(326,544,r'Z_1 Z_2 Z_3 Z_4',CYAN,23))
    save('syndrome-circuit','Stabilizer measurement','Four data-controlled CNOTs accumulate their computational-basis parity in a zero-state ancilla; measuring the ancilla in Z measures the four-body Z stabilizer.',els)


def kagome():
    root3=math.sqrt(3); center=np.array([1.5,root3/2]); pts=[]
    for i in range(-4,5):
        for j in range(-4,5):
            for offset in [[0,0],[1,0],[.5,root3/2]]:
                p=np.array([2*i+j,root3*j])+offset-center
                if np.linalg.norm(p)<4.52: pts.append(p)
    pts=np.array(pts); a=.13; rot=np.array([[math.cos(a),-math.sin(a)],[math.sin(a),math.cos(a)]]); screen=pts@rot.T*52+320; els=[]
    for i in range(len(pts)):
        for j in range(i):
            if abs(np.linalg.norm(pts[i]-pts[j])-1)<1e-6:
                special=abs(np.linalg.norm(pts[i])-1)<1e-6 and abs(np.linalg.norm(pts[j])-1)<1e-6
                els.append(path([screen[i],screen[j]],CYAN if special else MUTED,2.1 if special else 1.15,.9))
    for p,q in zip(pts,screen):
        special=abs(np.linalg.norm(p)-1)<1e-6
        els.append(circle(*q,4.4 if special else 2.8,CYAN if special else INK,0,CYAN if special else INK,.95 if special else .7))
    save('kagome-lattice','Kagome lattice','A nearest-neighbour graph of corner-sharing triangles, a standard frustrated-spin geometry, with one six-site loop highlighted.',els)


def contours():
    import matplotlib
    matplotlib.use('Agg')
    from matplotlib import pyplot as plt
    k=np.linspace(-math.pi,math.pi,301); x,y=np.meshgrid(k,k)
    energy=np.sqrt(np.sin(x)**2+np.sin(y)**2+(1.2+np.cos(x)+np.cos(y))**2)
    fig,ax=plt.subplots(); cs=ax.contour(x,y,energy,levels=np.linspace(float(energy.min())+.015,float(energy.max())-.04,19))
    def project(p): return np.column_stack([320+(p[:,0]-p[:,1])*40,320+(p[:,0]+p[:,1])*31])
    border=project(np.array([[-math.pi,-math.pi],[math.pi,-math.pi],[math.pi,math.pi],[-math.pi,math.pi]]))
    els=[path(border,MUTED,1,.6,close=True,dash='4 7')]
    for i,pp in enumerate(cs.get_paths()):
        for polygon in pp.to_polygons(closed_only=False):
            if len(polygon)>2: els.append(path(project(polygon),CYAN if i%4==0 else INK,1.6 if i%4==0 else 1,.82 if i%4==0 else .57))
    plt.close(fig)
    save('band-contours','Band-energy contours','Computed energy contours of the two-band toy Hamiltonian d dot sigma, with d = (sin kx, sin ky, 1.2 + cos kx + cos ky). Periodic momentum space is shown in oblique projection. Not measured data.',els)


def temporal():
    t=np.linspace(0,TAU,7,endpoint=False)+.15; points=np.vstack([np.column_stack([np.cos(t),np.sin(t)]),[[0,0]]])
    layers=[points*np.array([166,66])+[279+frame*40,452-frame*133] for frame in range(3)]; els=[]
    for node in [0,2,4,7]: els.append(path([layer[node] for layer in layers],MUTED,1,.47,dash='3 7'))
    base=[(i,(i+1)%7) for i in range(7)]; extra=[[(7,0),(7,2),(7,5),(1,5)],[(7,1),(7,3),(7,6),(2,5)],[(7,0),(7,4),(7,6),(1,4)]]
    for frame,layer in enumerate(layers):
        ring=np.column_stack([np.cos(np.linspace(0,TAU,180))*193+279+frame*40,np.sin(np.linspace(0,TAU,180))*84+452-frame*133])
        els.append(path(ring,MUTED,.85,.6))
        for a,b in base: els.append(path([layer[a],layer[b]],MUTED,1.3,.65))
        for a,b in extra[frame]: els.append(path([layer[a],layer[b]],CYAN if frame==1 else INK,1.8))
        for node,p in enumerate(layer):
            col=CYAN if node==7 else INK; els.append(circle(*p,5.3,col,1.5,BG))
        els.append(label(71+frame*40,458-frame*133,['t',r't + \Delta t',r't + 2\Delta t'][frame],MUTED,19,'end'))
    save('temporal-network','Temporal network','Three schematic snapshots of the same eight-node network, with changing edges and dotted inter-layer correspondences. No empirical network is implied.',els)


if __name__ == '__main__':
    for generate in [torus,mobius,hopf,trefoil,bloch,dirac,winding,braid,surface_code,toric_code,fano,circuit,syndrome,kagome,contours,temporal]:
        generate()
        print(generate.__name__)
    (OUT/'manifest.json').write_text(json.dumps(MANIFEST,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

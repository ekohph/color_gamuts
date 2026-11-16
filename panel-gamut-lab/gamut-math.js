/* Adapted from SemiBooks common.js. Copyright (c) 2026 geniuskey and SemiBooks contributors. MIT; see LICENSE-MIT. */
(function(root){'use strict'; const G={};
G.xy2uv=(x,y)=>{const d=-2*x+12*y+3;return [4*x/d,9*y/d]};
G.references={p3:{R:[.680,.320],G:[.265,.690],B:[.150,.060]},bt2020:{R:[.708,.292],G:[.170,.797],B:[.131,.046]}};
  G.polyArea = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
  /** 볼록 다각형 클리핑(Sutherland–Hodgman): subject ∩ clip(볼록) */
  G.clipPoly = function (subject, clip) {
    let out = subject.slice();
    const area = G.polyArea(clip), ccw = (() => { let a = 0; for (let i = 0; i < clip.length; i++) { const [x1, y1] = clip[i], [x2, y2] = clip[(i + 1) % clip.length]; a += x1 * y2 - x2 * y1; } return a > 0; })();
    if (!area) return [];
    for (let i = 0; i < clip.length && out.length; i++) {
      const A = clip[i], B = clip[(i + 1) % clip.length];
      const inside = (p) => { const c = (B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0]); return ccw ? c >= 0 : c <= 0; };
      const inter = (p, q) => { const a1 = B[1] - A[1], b1 = A[0] - B[0], c1 = a1 * A[0] + b1 * A[1]; const a2 = q[1] - p[1], b2 = p[0] - q[0], c2 = a2 * p[0] + b2 * p[1]; const d = a1 * b2 - a2 * b1; return [(b2 * c1 - b1 * c2) / d, (a1 * c2 - a2 * c1) / d]; };
      const inp = out; out = [];
      for (let j = 0; j < inp.length; j++) {
        const P = inp[j], Q = inp[(j + 1) % inp.length];
        if (inside(Q)) { if (!inside(P)) out.push(inter(P, Q)); out.push(Q); }
        else if (inside(P)) out.push(inter(P, Q));
      }
    }
    return out;
  };
  /** 색역 삼각형 g가 기준 색역 ref를 덮는 비율(커버리지)과 면적비. 좌표계 'xy' 또는 'uv' */
  G.gamutStats = function (g, ref, space = "xy") {
    const tri = (gamut) => [gamut.R, gamut.G, gamut.B].map((p) => (space === "uv" ? G.xy2uv(p[0], p[1]) : p));
    const a = tri(g), b = tri(ref);
    return { coverage: G.polyArea(G.clipPoly(a, b)) / G.polyArea(b), ratio: G.polyArea(a) / G.polyArea(b) };
  };

G.validate=function(g){for(const k of ['R','G','B']){const p=g[k];if(!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||p[0]<0||p[1]<=0||p[0]+p[1]>1+1e-9)throw Error(k+': 유한한 xy 값, x ≥ 0, y > 0, x+y ≤ 1이 필요합니다.');}if(G.polyArea([g.R,g.G,g.B])<1e-9)throw Error('RGB 점이 중복되거나 일직선입니다. 면적이 있는 삼각형을 입력하세요.');return true;};
G.calculate=function(g,space='xy'){G.validate(g);if(!['xy','uv'].includes(space))throw Error('space must be xy or uv');return Object.fromEntries(['p3','bt2020'].map(k=>{const v=G.gamutStats(g,G.references[k],space);v.coverage=Math.max(0,Math.min(1,v.coverage));return[k,v]}));};
if(typeof module!=='undefined')module.exports=G;else root.GamutMath=G;
})(typeof globalThis!=='undefined'?globalThis:this);

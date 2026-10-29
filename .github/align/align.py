# align.py feats.npz qprefix tprefix out.json : windows of query files vs all target files
import sys, json, numpy as np
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0]); from feat import norm, FPS
d = dict(np.load(sys.argv[1])); qp, tp = sys.argv[2], sys.argv[3]
W, H, B = 30*FPS, 15*FPS, 1 << 16
T = sorted(k for k in d if k.startswith(tp)); Q = sorted(k for k in d if k.startswith(qp))
tn = {k: norm(d[k]) for k in T}
cat = np.concatenate([tn[k] for k in T]); owner = np.concatenate([np.full(len(tn[k]), i) for i, k in enumerate(T)])
start = np.cumsum([0] + [len(tn[k]) for k in T])
step = B - W
blocks = []
for s in range(0, len(cat), step):
    seg = np.zeros(B, np.float32); c = cat[s:s+B]; seg[:len(c)] = c
    blocks.append((s, np.fft.rfft(seg)))
def run(q):
    e = norm(d[q]); rows = []
    for a in range(0, len(e) - W + 1, H):
        w = e[a:a+W]; w = (w - w.mean()) / (w.std() + 1e-6)
        wf = np.conj(np.fft.rfft(w, B))
        best = (-1, 0)
        for s, bf in blocks:
            c = np.fft.irfft(bf * wf, B)[:step] / W
            if qp == tp:
                o = owner[s:s+step]; c = c[:len(o)].copy(); c[o == T.index(q)] = -1
            i = int(c.argmax())
            if c[i] > best[0]: best = (float(c[i]), s + i)
        sc, g = best
        if g >= len(cat): g = len(cat) - 1
        t = int(owner[g]); rows.append([a / FPS, round(sc, 3), T[t], round((g - start[t]) / FPS, 1)])
    print(q, len(rows), file=sys.stderr, flush=True); return q, rows
import multiprocessing as mp
with mp.get_context("fork").Pool() as pool: res = dict(pool.map(run, Q))
json.dump({'dur': {k: len(d[k]) / FPS for k in d}, 'res': res}, open(sys.argv[4], 'w'))

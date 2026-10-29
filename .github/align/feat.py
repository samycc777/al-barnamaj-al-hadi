import sys, subprocess, numpy as np
FPS = 10
def feat(path):
    raw = subprocess.run(['ffmpeg','-loglevel','quiet','-i',path,'-ac','1','-ar','8000','-f','s16le','-'],capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32)
    hop = 8000 // FPS; n = len(x) // hop
    fr = x[:n*hop].reshape(n, hop)
    sp = np.abs(np.fft.rfft(fr * np.hanning(hop), axis=1)) ** 2
    f = np.fft.rfftfreq(hop, 1/8000)
    e = np.log(sp[:, (f > 300) & (f < 3400)].sum(1) + 1e3)
    return e.astype(np.float32)
def norm(e, w=300):
    k = np.ones(w) / w
    m = np.convolve(e, k, 'same'); s = np.sqrt(np.maximum(np.convolve(e*e, k, 'same') - m*m, 1e-4))
    return ((e - m) / s).astype(np.float32)
if __name__ == '__main__':
    out = sys.argv[1]; d = {}
    for p in sys.argv[2:]:
        d[p.rsplit('/',1)[-1].split('.')[0]] = feat(p)
    np.savez_compressed(out, **d)

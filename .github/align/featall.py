import sys, glob, multiprocessing as mp, numpy as np
sys.path.insert(0, sys.argv[0].rsplit('/',1)[0]); from feat import feat
files = sorted(glob.glob(sys.argv[2] + '/*.mp3'))
with mp.get_context('fork').Pool() as p: fs = p.map(feat, files)
np.savez_compressed(sys.argv[1], **{f.rsplit('/',1)[-1][:-4]: x for f, x in zip(files, fs)})

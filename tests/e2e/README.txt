Browser checks (Playwright for Python; not part of `npm test`). They need a running dev server: `node dev.mjs` (port 4173),
Chromium for Playwright and Pillow. The generate / generation API is mocked in the page, so no image provider is called.
  python3 tests/e2e/make_fixtures.py                 # test pictures into tests/e2e/out
  python3 -I tests/e2e/states.py                     # fail, unknown, slow (>90 s), offline mid-job, lost, retry, neutral copy
  python3 -I tests/e2e/zoom.py                       # zoom button on before/after at 360/390/430/1280
  python3 -I tests/e2e/views.py                      # angle viewer: waiting scene, ready, failure, closing stops the loop
  python3 -I tests/e2e/fallbacks.py                  # no ctx.filter, low-end, no CSS support, reduced motion, no canvas, tainted canvas, dress 404
  python3 -I tests/e2e/perf.py label                 # frame timing and long tasks, CPU x1 and x4
  python3 -I tests/e2e/final.py /tmp/final2          # key frames and GIFs for three dresses
The dev server keeps per-IP rate limits in .local/preview.sqlite: run `git checkout .local` and restart it if uploads start failing.

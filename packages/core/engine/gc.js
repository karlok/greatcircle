/* ============================================================
   GREAT CIRCLE : registry
   Loaded before everything else. Substrate files register themselves here;
   the engine looks them up at init, once the scene has been read.
   ============================================================ */
window.GC = {
  version: '0.1.0',
  _substrates: {},
  substrate(name, build) { this._substrates[name] = build; },
  get(name) { return this._substrates[name]; },
  list() { return Object.keys(this._substrates); }
};

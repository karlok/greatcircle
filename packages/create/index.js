#!/usr/bin/env node
/* npm create greatcircle@latest my-talk

   A thin front door. The scaffold itself lives in @greatcircle/core, so the
   template and the engine can never drift apart. */
require('@greatcircle/core/cli/new')(process.argv[2]);

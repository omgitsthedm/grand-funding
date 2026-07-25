#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const LEGACY_VIDEO_LOADER =
  '(()=>{if(window.innerWidth>720){const e=document.querySelector(".hero-video");if(e&&!e.querySelector("source")){const t=document.createElement("source");t.src="/images/arizona-hero.mp4",t.type="video/mp4",e.appendChild(t),e.load()}}})();';

const CAPABILITY_AWARE_VIDEO_LOADER =
  '(()=>{const e=()=>{const e=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false,t=navigator.connection||navigator.mozConnection||navigator.webkitConnection,a=Boolean(t?.saveData)||["slow-2g","2g"].includes(t?.effectiveType||"");if(window.innerWidth>720&&!e&&!a&&document.visibilityState!=="hidden"){const t=document.querySelector(".hero-video");if(t&&!t.querySelector("source")){const e=document.createElement("source");e.src="/images/arizona-hero.mp4",e.type="video/mp4",t.appendChild(e),t.load()}}};if(document.visibilityState==="hidden"&&window.innerWidth>720){const t=()=>{document.visibilityState==="visible"&&(document.removeEventListener("visibilitychange",t),e())};document.addEventListener("visibilitychange",t)}else e()})();';

const LEGACY_PHONE_TRACKER =
  'document.querySelectorAll(\'a[href^="tel:"]\').forEach(e=>{e.addEventListener("click",()=>{"function"==typeof gtag&&gtag("event","phone_click",{event_category:"contact",event_label:e.href})})}),';

function replaceExactlyOnce(source, needle, replacement, label) {
  const first = source.indexOf(needle);
  const last = source.lastIndexOf(needle);
  if (first < 0) {
    throw new Error(`Legacy runtime contract failed: missing ${label}`);
  }
  if (first !== last) {
    throw new Error(`Legacy runtime contract failed: duplicate ${label}`);
  }
  return source.replace(needle, replacement);
}

export async function refineLegacyRuntime({ dist }) {
  const runtimePath = path.join(dist, "script.js");
  let runtime = await fs.readFile(runtimePath, "utf8");

  runtime = replaceExactlyOnce(
    runtime,
    LEGACY_VIDEO_LOADER,
    CAPABILITY_AWARE_VIDEO_LOADER,
    "hero video loader",
  );
  runtime = replaceExactlyOnce(
    runtime,
    LEGACY_PHONE_TRACKER,
    "",
    "phone analytics listener",
  );

  await fs.writeFile(runtimePath, runtime);
}

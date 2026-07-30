#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const LEGACY_VIDEO_LOADER =
  '(()=>{if(window.innerWidth>720){const e=document.querySelector(".hero-video");if(e&&!e.querySelector("source")){const t=document.createElement("source");t.src="/images/arizona-hero.mp4",t.type="video/mp4",e.appendChild(t),e.load()}}})();';

const CAPABILITY_AWARE_VIDEO_LOADER =
  '(()=>{const e=window.matchMedia?.("(prefers-reduced-motion: reduce)"),t=navigator.connection||navigator.mozConnection||navigator.webkitConnection,a=()=>{const a=document.querySelector(".hero-video"),i=Boolean(t?.saveData)||["slow-2g","2g"].includes(t?.effectiveType||"");if(!a)return;if(e?.matches||i||document.visibilityState==="hidden"){a.pause();return}if(!a.querySelector("source")){const e=document.createElement("source");e.src="/images/arizona-hero.mp4",e.type="video/mp4",a.appendChild(e),a.load()}const n=()=>{const e=a.play();e?.catch?.(()=>{})};a.readyState>=2?n():a.addEventListener("canplay",n,{once:true})};e?.addEventListener?.("change",a),t?.addEventListener?.("change",a),document.addEventListener("visibilitychange",a),window.addEventListener("pageshow",a),a()})();';

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

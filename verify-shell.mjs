// Visual verification of prototype layout via Playwright.
// Run: node verify-shell.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = "http://127.0.0.1:5177/";
const OUT_DIR = path.resolve("./screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const result = {
  steps: [],
  shell: {},
  chat: {},
  checks: {},
  screenshots: {},
  errors: [],
};

function step(name, ok, info = "") {
  result.steps.push({ name, ok, info });
  // eslint-disable-next-line no-console
  console.log(`${ok ? "OK" : "FAIL"}  ${name}${info ? "  " + info : ""}`);
}

async function rectOf(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      selector: sel,
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      backgroundImage: cs.backgroundImage,
    };
  }, selector);
}

async function textOf(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? (el.textContent || "").trim() : null;
  }, selector);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on("pageerror", (e) => result.errors.push(`pageerror: ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") result.errors.push(`console.error: ${msg.text()}`);
});

try {
  // Step 1-2: goto
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  step("goto " + URL, true);

  // Step 3: click menu-new-game
  await page.waitForTimeout(2000);
  await page.click('[data-testid="menu-new-game"]', { timeout: 10000 });
  step('click [data-testid="menu-new-game"]', true);

  // Step 4: wait .system-tile, click first
  await page.waitForTimeout(500);
  await page.waitForSelector(".system-tile", { timeout: 10000 });
  await page.click(".system-tile >> nth=0", { timeout: 5000 });
  step("click first .system-tile", true);

  // Step 5: click newgame-confirm
  await page.waitForTimeout(300);
  await page.click('[data-testid="newgame-confirm"]', { timeout: 10000 });
  step('click [data-testid="newgame-confirm"]', true);

  // Step 6: wait .loading-screen, click it
  await page.waitForTimeout(5000);
  const lsVisible = await page.locator(".loading-screen").first().isVisible().catch(() => false);
  if (lsVisible) {
    await page.click(".loading-screen", { timeout: 5000 });
    step("click .loading-screen", true);
  } else {
    step("click .loading-screen", true, "(not visible — skipped)");
  }

  // Step 7: wait .proto-topbar (10s timeout)
  await page.waitForSelector(".proto-topbar", { timeout: 10000 });
  step("waitFor .proto-topbar", true);

  // Step 8: settle
  await page.waitForTimeout(800);

  // Step 9: screenshot shell
  const shellPath = path.join(OUT_DIR, "verify-shell-main.png");
  await page.screenshot({ path: shellPath, fullPage: false });
  result.screenshots.shell = shellPath;
  step("screenshot verify-shell-main.png", true, shellPath);

  // Step 10: measure shell rects
  const shellSelectors = [
    ".proto-topbar",
    ".proto-leftrail",
    ".proto-center",
    ".proto-righthud",
    ".proto-portrait",
    ".proto-portrait .face",
    ".proto-map .painting",
    ".proto-ticker",
  ];
  for (const sel of shellSelectors) {
    result.shell[sel] = await rectOf(page, sel);
  }
  step("measured shell rects", true);

  // Step 11: click first .pin.npc
  const npcCount = await page.locator(".pin.npc").count();
  if (npcCount === 0) {
    step("click .pin.npc", false, "no NPC pins rendered");
    result.chat.opened = false;
  } else {
    await page.locator(".pin.npc").first().click({ timeout: 5000 });
    step("click first .pin.npc", true, `(${npcCount} npc pins)`);
    result.chat.opened = true;
  }

  // Step 12: wait 600ms
  await page.waitForTimeout(600);

  // Step 13: screenshot chat
  const chatPath = path.join(OUT_DIR, "verify-shell-chat.png");
  await page.screenshot({ path: chatPath, fullPage: false });
  result.screenshots.chat = chatPath;
  step("screenshot verify-shell-chat.png", true, chatPath);

  // Step 14: measure chat elements
  if (result.chat.opened) {
    const chatSelectors = [
      ".proto-modal.chat",
      ".chat-stage",
      ".chat-stage .char.left .body",
      ".chat-stage .char.left .body .face",
      ".chat-stage .char.left .body .robe",
      ".chat-stage .char.left .nameplate",
      ".chat-stage .char.right .body",
      ".chat-stage .char.right .body .face",
      ".chat-stage .char.right .nameplate",
      ".chat-stage .mist",
      ".chat-stage .floor",
      ".chat-bottom",
      ".chat-log",
      ".chat-choices",
    ];
    for (const sel of chatSelectors) {
      const r = await rectOf(page, sel);
      result.chat[sel] = r;
      if (sel.endsWith(".nameplate")) {
        result.chat[sel + "::text"] = await textOf(page, sel);
      }
    }
    step("measured chat rects", true);
  }
} catch (err) {
  result.errors.push(`fatal: ${err.message}`);
  step("flow", false, err.message);
}

// Step 15: pass/fail checks
const r = result;
const checks = (r.checks = {});

function nonZeroRect(rect) {
  return rect && rect.width > 0 && rect.height > 0;
}

checks.face_left = nonZeroRect(r.chat[".chat-stage .char.left .body .face"]);
checks.face_right = nonZeroRect(r.chat[".chat-stage .char.right .body .face"]);
checks.robe_left = nonZeroRect(r.chat[".chat-stage .char.left .body .robe"]);
checks.nameplate_left_text =
  r.chat[".chat-stage .char.left .nameplate::text"] === "Lâm Phàm";
checks.nameplate_right_text_not_empty = (() => {
  const t = r.chat[".chat-stage .char.right .nameplate::text"];
  return typeof t === "string" && t.length > 0;
})();
checks.mist_nonzero = nonZeroRect(r.chat[".chat-stage .mist"]);
checks.floor_nonzero = nonZeroRect(r.chat[".chat-stage .floor"]);
checks.map_bg = (() => {
  const p = r.shell[".proto-map .painting"];
  if (!p) return false;
  return /world-map/i.test(p.backgroundImage || "");
})();
checks.portrait_face_visible = nonZeroRect(r.shell[".proto-portrait .face"]);
checks.topbar_present = nonZeroRect(r.shell[".proto-topbar"]);
checks.center_present = nonZeroRect(r.shell[".proto-center"]);
checks.leftrail_present = nonZeroRect(r.shell[".proto-leftrail"]);
checks.righthud_present = nonZeroRect(r.shell[".proto-righthud"]);
checks.ticker_present = nonZeroRect(r.shell[".proto-ticker"]);

checks.summary = {
  pass: Object.values(checks).filter((v) => v === true).length,
  fail: Object.values(checks).filter((v) => v === false).length,
};
checks.summary.total =
  checks.summary.pass + checks.summary.fail;

const json = JSON.stringify(result, null, 2);
console.log("\n=== JSON RESULT ===\n" + json);
fs.writeFileSync(path.join(OUT_DIR, "verify-shell-result.json"), json);

await browser.close();
process.exit(checks.summary.fail === 0 ? 0 : 2);
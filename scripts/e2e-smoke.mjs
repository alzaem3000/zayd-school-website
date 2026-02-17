import { spawn } from "node:child_process";

const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const timeoutMs = 45_000;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  for (let i = 0; i < 20; i += 1) {
    if (child.exitCode !== null) return;
    await wait(100);
  }
  child.kill("SIGKILL");
}

async function fetchText(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Request failed ${path}: ${res.status}`);
  }
  return text;
}

async function run() {
  const preview = spawn("node", ["./node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  let ready = false;
  let output = "";

  preview.stdout.on("data", (chunk) => {
    output += chunk.toString();
    if (output.includes("http://127.0.0.1:4173/")) {
      ready = true;
    }
  });

  preview.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  const start = Date.now();
  while (!ready && Date.now() - start < timeoutMs) {
    if (preview.exitCode !== null) {
      throw new Error(`vite preview exited early: ${preview.exitCode}\n${output}`);
    }
    await wait(200);
  }

  if (!ready) {
    await stopProcess(preview);
    throw new Error(`Timed out waiting for vite preview\n${output}`);
  }

  try {
    const landing = await fetchText("/");
    if (!landing.includes("<title>توثيق شواهد الأداء الوظيفي")) {
      throw new Error("Landing page title marker missing");
    }

    const login = await fetchText("/login");
    if (!login.includes('<div id="root"></div>')) {
      throw new Error("Login SPA shell marker missing");
    }

    const home = await fetchText("/home");
    if (!home.includes('<div id="root"></div>')) {
      throw new Error("Home SPA shell marker missing");
    }

    console.log("E2E smoke passed: Landing/Login/Home shell reachable");
  } finally {
    await stopProcess(preview);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

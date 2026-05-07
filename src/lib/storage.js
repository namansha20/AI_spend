import { promises as fs } from "node:fs";
import path from "node:path";

const inMemoryAudits = new Map();
const inMemoryLeads = [];
const FALLBACK_FILE = path.join("/tmp", "ai-spend-audits.json");

async function readFallbackAudits() {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeFallbackAudit(id, payload) {
  const audits = await readFallbackAudits();
  audits[id] = payload;
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(audits), "utf8");
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function supabaseInsert(table, payload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase insert failed: ${response.status}`);
  }

  const data = await response.json();
  return data[0];
}

async function supabaseGetAudit(id) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const table = process.env.SUPABASE_AUDITS_TABLE || "audits";
  const response = await fetch(`${url}/rest/v1/${table}?id=eq.${id}&select=*`, {
    headers: supabaseHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data[0] || null;
}

export async function saveAudit(audit) {
  const payload = {
    id: audit.id,
    data: audit,
    public_data: audit.publicReport,
    created_at: audit.generatedAt,
  };

  try {
    const table = process.env.SUPABASE_AUDITS_TABLE || "audits";
    const row = await supabaseInsert(table, payload);
    if (row) return row.data;
  } catch {}

  inMemoryAudits.set(audit.id, payload);
  await writeFallbackAudit(audit.id, payload);
  return audit;
}

export async function getAudit(id) {
  const dbRow = await supabaseGetAudit(id);
  if (dbRow?.data) return dbRow.data;
  const memory = inMemoryAudits.get(id)?.data;
  if (memory) return memory;
  const fileAudits = await readFallbackAudits();
  return fileAudits[id]?.data || null;
}

export async function saveLead(lead) {
  const payload = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...lead,
  };

  try {
    const table = process.env.SUPABASE_LEADS_TABLE || "leads";
    const row = await supabaseInsert(table, payload);
    if (row) return row;
  } catch {}

  inMemoryLeads.push(payload);
  return payload;
}

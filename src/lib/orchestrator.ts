const BASE_URL = process.env.ORCHESTRATOR_URL || "http://localhost:3000";
const API_KEY = process.env.ORCHESTRATOR_API_KEY || "";

async function orchestratorFetch<T = unknown>(path: string, timeout = 15000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      signal: controller.signal,
      headers: {
        ...(API_KEY ? { "X-Api-Key": API_KEY } : {}),
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Orchestrator ${res.status}: ${await res.text()}`);
    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export interface OrchestratorAccount {
  id: string;
  vpsId: string;
  login: string;
  server: string;
  broker: string | null;
  status: string;
  balance: number;
  equity: number;
  freeMargin: number;
  profit: number;
  connected: boolean;
  lastSynced: string | null;
  vpsName: string;
}

export interface OrchestratorDeal {
  deal: number;
  order: number;
  symbol: string;
  type: string;
  entry: string;
  volume: number;
  price: number;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
  time: number;
  positionId: number;
}

export interface OrchestratorPosition {
  ticket: string;
  symbol: string;
  type: string;
  volume: number;
  openPrice: number;
  profit: number;
  sl: number;
  tp: number;
}

export interface OrchestratorSnapshot {
  id: string;
  balance: number;
  equity: number;
  profit: number;
  positions: number;
  timestamp: string;
}

export async function fetchAccounts(): Promise<OrchestratorAccount[]> {
  return orchestratorFetch("/api/accounts");
}

export async function fetchDeals(vpsId: string, server: string, login: string, days = 30) {
  return orchestratorFetch<{ count: number; deals: OrchestratorDeal[] }>(
    `/api/accounts/${vpsId}/${encodeURIComponent(server)}/${login}/deals?days=${days}`,
    30000
  );
}

export async function fetchPositions(vpsId: string, server: string, login: string) {
  return orchestratorFetch<OrchestratorPosition[]>(
    `/api/accounts/${vpsId}/${encodeURIComponent(server)}/${login}/positions`
  );
}

export async function fetchSnapshots(vpsId: string, server: string, login: string, hours = 168) {
  return orchestratorFetch<OrchestratorSnapshot[]>(
    `/api/accounts/${vpsId}/${encodeURIComponent(server)}/${login}/snapshots?hours=${hours}`
  );
}

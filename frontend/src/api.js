const BASE = "http://localhost:5000";

export async function predictToxicity(smiles) {
  const res = await fetch(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ smiles }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Prediction failed");
  return data;
}

export async function sendChat(message, context = {}) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat failed");
  return data;
}
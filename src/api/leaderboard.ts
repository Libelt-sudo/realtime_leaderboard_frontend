const BASE_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res: Response) {
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function registerPlayer(username: string): Promise<{ response: string }> {
  const res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  return handleResponse(res);
}

export async function updateScore(
  username: string,
  score: number
): Promise<{ response: string }> {
  const res = await fetch(`${BASE_URL}/update/${encodeURIComponent(username)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score }),
  });
  return handleResponse(res);
}

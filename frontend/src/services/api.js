export async function verifyTokenRequest(token) {
  const res = await fetch("http://localhost:5000/dashboard", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Unauthorized or token expired");
  }

  return res.json();
}
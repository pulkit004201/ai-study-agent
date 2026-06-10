export async function recordLoginHistory(email: string, name: string) {
  if (!email) return;
  await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  }).catch(() => {});
}

export async function recordQuizAnswerHistory(email: string, name: string) {
  if (!email) return;
  await fetch("/api/users/quiz-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  }).catch(() => {});
}

export async function fetchUserHistory(limit = 50) {
  const res = await fetch(`/api/users/history?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Unable to fetch user history.");
  }
  return (await res.json()) as {
    rows: Array<{
      email: string;
      name: string;
      loginCount: number;
      quizAnsweredCount: number;
      firstLoginAt: string;
      lastLoginAt: string;
    }>;
  };
}

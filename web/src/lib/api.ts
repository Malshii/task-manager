import type { CreateTaskInput, Task, UpdateTaskInput } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// NestJS returns `message` as a string, or a string[] for validation errors.
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? response.statusText);
  } catch {
    return response.statusText || `Request failed (${response.status})`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // fetch only rejects when no response arrives (API down, network error, CORS).
    throw new Error("Can't reach the server. Is the API running?");
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  // DELETE returns 204 with no body.
  return (response.status === 204 ? undefined : await response.json()) as T;
}

export const getTasks = () => request<Task[]>("/tasks");

export const createTask = (input: CreateTaskInput) =>
  request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) });

export const updateTask = (id: string, input: UpdateTaskInput) =>
  request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

export const deleteTask = (id: string) =>
  request<void>(`/tasks/${id}`, { method: "DELETE" });

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const project = await res.json();
      router.push(`/project/${project.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "var(--space-2)",
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project name..."
        style={{
          flex: 1,
          padding: "var(--space-2) var(--space-3)",
          fontSize: "var(--font-size-base)",
          fontFamily: "inherit",
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-bg-input)",
          border: "1px solid var(--color-bg-border)",
          borderRadius: "var(--radius-md)",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={!name.trim() || loading}
        style={{
          padding: "var(--space-2) var(--space-4)",
          fontSize: "var(--font-size-sm)",
          fontWeight: 500,
          fontFamily: "inherit",
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-bg-border)",
          borderRadius: "var(--radius-md)",
          cursor: name.trim() && !loading ? "pointer" : "default",
          opacity: name.trim() && !loading ? 1 : 0.5,
        }}
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

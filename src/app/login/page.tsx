export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            OST Tool
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
            Enter the password to continue
          </p>
        </div>

        <form
          method="POST"
          action="/login"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            style={{
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

          {error && (
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-status-abandoned)" }}>
              Wrong password. Try again.
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontSize: "var(--font-size-sm)",
              fontWeight: 500,
              fontFamily: "inherit",
              color: "var(--color-text-primary)",
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-bg-border)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

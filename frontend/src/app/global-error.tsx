"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#f5f1e8",
          color: "#20251f",
          fontFamily: '"Avenir Next", Avenir, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        <title>Something went wrong | NatureMist</title>
        <main
          style={{
            boxSizing: "border-box",
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "72px 24px",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#e8dfce",
              fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
              fontSize: "clamp(7rem, 17vw, 15rem)",
              lineHeight: 0.7,
            }}
            aria-hidden="true"
          >
            ○
          </span>
          <p
            style={{
              margin: "28px 0 16px",
              color: "#527744",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            A deeper pause
          </p>
          <h1
            style={{
              maxWidth: "12ch",
              margin: "0 0 20px",
              color: "#153b2d",
              fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
              fontSize: "clamp(3.25rem, 6vw, 6.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.06em",
              lineHeight: 0.9,
            }}
          >
            NatureMist needs a fresh start.
          </h1>
          <p style={{ maxWidth: 460, margin: 0, color: "#5f665e", lineHeight: 1.7 }}>
            This page could not be restored safely. Try the ritual again.
          </p>
          <button
            style={{
              minHeight: 50,
              marginTop: 28,
              border: 0,
              borderRadius: 999,
              background: "#153b2d",
              boxShadow: "0 10px 26px rgba(21, 59, 45, 0.2)",
              color: "#fffcf5",
              cursor: "pointer",
              padding: "13px 24px",
              font: "inherit",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
            type="button"
            onClick={retry}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

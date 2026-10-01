"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "var(--background)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-inter), sans-serif",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "500px",
        padding: "2rem",
        backgroundColor: "var(--panel-bg)",
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: "600", 
          marginBottom: "1rem",
          color: "var(--error)"
        }}>
          Something went wrong!
        </h2>
        <p style={{
          marginBottom: "1.5rem",
          color: "var(--text-secondary)",
          lineHeight: "1.5"
        }}>
          A critical error occurred in the application interface.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--accent-primary)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary)")}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

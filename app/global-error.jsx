"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred. Please try again.</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{ padding: "0.6rem 1.2rem" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

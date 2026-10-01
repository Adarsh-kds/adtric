"use client";

export default function Error({ reset }) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-start justify-center px-5 sm:px-8 lg:px-10">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="heading mt-4 text-5xl">We could not load this page.</h1>
      <p className="mt-4 max-w-md text-muted">
        The server may be waking up. Please wait a few seconds and try again.
      </p>
      <button type="button" onClick={reset} className="btn btn-white mt-8">
        Try again
      </button>
    </section>
  );
}

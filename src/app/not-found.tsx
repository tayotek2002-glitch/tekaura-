import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center bg-ink text-white">
      <div className="container-x">
        <p className="eyebrow text-white/40">404</p>
        <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)]">Lost signal.</h1>
        <p className="mt-4 text-white/60">We couldn&apos;t find that page.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn btn-light">Home</Link>
          <Link href="/shop" className="btn btn-ghost-light">Shop all</Link>
        </div>
      </div>
    </div>
  );
}

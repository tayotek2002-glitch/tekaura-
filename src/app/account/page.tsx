import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="bg-mist">
      <div className="container-x max-w-3xl pb-28 pt-12 md:pt-20">
        <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)]">Account</h1>
        <div className="mt-10 rounded-[28px] bg-white p-8">
          <p className="text-[18px] font-medium tracking-tight">Customer accounts are coming soon.</p>
          <p className="mt-2 text-[15px] text-slate">
            Sign-in, order history and saved addresses will be available once the store&apos;s commerce platform is connected.
          </p>
          <Link href="/shop" className="btn btn-dark mt-8">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}

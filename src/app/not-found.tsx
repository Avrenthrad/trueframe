import Link from "next/link";
import { UnpatchedMark } from "@/components/UnpatchedLogo";

export default function NotFound() {
  return (
    <div className="up-container grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="space-y-5">
        <UnpatchedMark size={56} className="mx-auto" />
        <p className="font-mono text-sm text-muted">404 · Page not found</p>
        <h1 className="text-4xl font-bold uppercase">This page shipped without a patch.</h1>
        <p className="text-muted">It may have been unpublished, renamed, or never existed.</p>
        <Link href="/" className="inline-block border border-fg px-4 py-2.5 font-bold uppercase tracking-wide hover:bg-fg hover:text-bg">Back to the front page</Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { TrueFrameMark } from "@/components/TrueFrameLogo";

export default function NotFound() {
  return (
    <div className="tf-container grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="space-y-5">
        <TrueFrameMark size={56} className="mx-auto opacity-80" />
        <p className="font-mono text-sm text-muted">404 · Out of frame</p>
        <h1 className="text-4xl font-bold">We couldn&apos;t find that page.</h1>
        <p className="text-muted">It may have been unpublished, renamed, or never existed.</p>
        <Link href="/" className="inline-block rounded-lg bg-mint px-4 py-2.5 font-semibold text-on-mint">Back to the front page</Link>
      </div>
    </div>
  );
}

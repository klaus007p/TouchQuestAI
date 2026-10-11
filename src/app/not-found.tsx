import Link from "next/link";

export default function NotFound() {
    return (
        <div className="animate-rise space-y-4 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">🍂</div>
            <h1 className="text-2xl font-bold">You wandered off the path</h1>
            <p className="text-white/60">We couldn't find that page.</p>
            <Link
                href="/"
                className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-black hover:bg-emerald-400"
            >
                Back to the trail
            </Link>
        </div>
    );
}
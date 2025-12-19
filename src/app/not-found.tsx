import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-bold font-[family-name:var(--font-cinzel)] text-gray-900">
                    404
                </h1>
                <h2 className="text-3xl font-semibold text-gray-800 font-[family-name:var(--font-cinzel)]">
                    Page Not Found
                </h2>
                <p className="text-gray-600 max-w-md mx-auto text-lg">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <div className="pt-4">
                    <Link href="/">
                        <Button size="lg" className="min-w-[200px]">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

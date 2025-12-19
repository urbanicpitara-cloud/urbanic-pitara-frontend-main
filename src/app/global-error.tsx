"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Global Error must include html and body tags
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical Global Error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center font-sans">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Critical Application Error
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md">
                        A critical error halted the application. We apologize for the inconvenience.
                    </p>
                    <Button onClick={() => reset()} size="lg">
                        Reload Application
                    </Button>
                </div>
            </body>
        </html>
    );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error using your preferred logging service
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md mx-auto">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-gray-900 font-[family-name:var(--font-cinzel)]">
                    Something went wrong!
                </h2>

                <p className="text-gray-600">
                    We apologize for the inconvenience. An unexpected error occurred while processing your request.
                </p>

                <div className="flex gap-4 justify-center pt-2">
                    <Button onClick={() => reset()} variant="outline">
                        Try Again
                    </Button>
                    <Button onClick={() => window.location.href = "/"}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

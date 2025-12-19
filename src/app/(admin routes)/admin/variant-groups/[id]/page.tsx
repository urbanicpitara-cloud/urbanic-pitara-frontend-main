"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { variantGroupsAPI } from "@/lib/api";
import VariantGroupForm from "../components/VariantGroupForm";
import { VariantGroup } from "@/types/api";
import { Loader2 } from "lucide-react";

export default function EditVariantGroupPage() {
    const { id } = useParams();
    const [group, setGroup] = useState<VariantGroup | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchGroup() {
            try {
                const res = await variantGroupsAPI.getById(id as string);
                setGroup(res.data);
            } catch (err: unknown) {
                const error = err as Error;
                setError(error.message || "Failed to load group");
            } finally {
                setLoading(false);
            }
        }
        fetchGroup();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>{error || "Variant group not found"}</p>
            </div>
        );
    }

    return <VariantGroupForm group={group} />;
}

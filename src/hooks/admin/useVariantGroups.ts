"use client";

import { useState, useCallback, useEffect } from "react";
import { variantGroupsAPI } from "@/lib/api";
import { VariantGroup } from "@/types/api";

export function useVariantGroups() {
    const [groups, setGroups] = useState<VariantGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const fetchGroups = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            // The API uses 'q' for search
            const res = await variantGroupsAPI.getAll({ q: search });
            setGroups(res.data);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Failed to fetch variant groups:", error);
            setError(error.message || "Failed to load groups");
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGroups();
        }, 400);
        return () => clearTimeout(timer);
    }, [fetchGroups]);

    const refresh = useCallback(async () => {
        await fetchGroups();
    }, [fetchGroups]);

    return {
        groups,
        loading,
        error,
        search,
        setSearch,
        refresh
    };
}

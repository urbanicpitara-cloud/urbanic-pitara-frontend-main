"use client";

import { useState } from "react";
import { Plus, Search, Loader2, Trash2, Edit } from "lucide-react";
import { useVariantGroups } from "@/hooks/admin/useVariantGroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { variantGroupsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function VariantGroupsPage() {
    const router = useRouter();
    const { groups, loading, error, search, setSearch, refresh } = useVariantGroups();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        setDeletingId(id);
        try {
            await variantGroupsAPI.delete(id);
            toast.success("Group deleted successfully");
            refresh();
        } catch (err: any) {
            toast.error("Failed to delete group");
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/variant-groups/${id}`);
    };

    const handleCreate = () => {
        router.push("/admin/variant-groups/new");
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <h1 className="text-xl font-bold">Variant Groups</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search groups..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus size={16} /> Create Group
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                {loading && !groups.length ? (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading...
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p>No variant groups found.</p>
                        {search && <Button variant="link" onClick={() => setSearch("")}>Clear Search</Button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-4">Group Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Products</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {groups.map((group) => (
                                    <tr key={group.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium">{group.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{group.description || "-"}</td>
                                        <td className="px-6 py-4">
                                            {group.products && group.products.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                                        {group.products.length} Products
                                                    </span>
                                                    <span className="text-gray-400 text-xs truncate max-w-[200px]">
                                                        {group.products.map(p => p.title).join(", ")}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">No products</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(group.id)}
                                                className="mr-1"
                                            >
                                                <Edit size={16} className="text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(group.id)}
                                                disabled={deletingId === group.id}
                                            >
                                                {deletingId === group.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} className="text-red-500" />
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

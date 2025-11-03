"use client";

import { useEffect, useState } from "react";
import { usersAPI } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Number of users per page
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      let allUsers: User[] = res.data.users || [];

      // Apply search filter
      if (search) {
        const s = search.toLowerCase();
        allUsers = allUsers.filter(
          (u) =>
            u.firstName.toLowerCase().includes(s) ||
            u.lastName.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s)
        );
      }

      setTotalUsers(allUsers.length);

      // Apply pagination
      const paginatedUsers = allUsers.slice((page - 1) * pageSize, page * pageSize);
      setUsers(paginatedUsers);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => setEditingUser(user);

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await usersAPI.update(editingUser.id, editingUser);
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await usersAPI.remove(id);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Reset this user's password?")) return;
    try {
      await usersAPI.resetPassword(id);
      toast.success("Password reset email sent");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password");
    }
  };

  const handleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(users.map((u) => u.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Delete ${selectedUsers.size} selected users?`)) return;

    try {
      await usersAPI.removeMany(Array.from(selectedUsers));
      toast.success("Selected users deleted");
      setSelectedUsers(new Set());
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected users");
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Users</h1>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleBulkDelete}
          disabled={selectedUsers.size === 0}
        >
          Delete Selected ({selectedUsers.size})
        </button>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedUsers.size === users.length && users.length > 0}
              />
            </th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="p-2 border text-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td className="p-2 border">
                {editingUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, firstName: e.target.value })
                    }
                    placeholder="First Name"
                    className="border p-1 w-full"
                  />
                ) : (
                  `${user.firstName} ${user.lastName}`
                )}
              </td>
              <td className="p-2 border">
                {editingUser?.id === user.id ? (
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="p-2 border">
                {editingUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.phone || ""}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, phone: e.target.value })
                    }
                    className="border p-1 w-full"
                  />
                ) : (
                  user.phone || "-"
                )}
              </td>
              <td className="p-2 border">
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.isAdmin ? "admin" : "user"}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, isAdmin: e.target.value === "admin" })
                    }
                    className="border p-1 w-full"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : user.isAdmin ? (
                  "Admin"
                ) : (
                  "User"
                )}
              </td>
              <td className="p-2 border flex gap-2">
                {editingUser?.id === user.id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 px-2 py-1 rounded"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => handleResetPassword(user.id)}
                    >
                      Reset PW
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <button
            className="px-2 py-1 border rounded"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

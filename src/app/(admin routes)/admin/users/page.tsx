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

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      toast.error("Subject and message are required");
      return;
    }

    const confirmMessage =
      selectedUsers.size > 0
        ? `Send email to ${selectedUsers.size} users?`
        : "Send email to ALL users?";

    if (!confirm(confirmMessage)) return;

    try {
      setSendingEmail(true);
      const res = await usersAPI.sendEmail({
        userIds: Array.from(selectedUsers),
        selectAll: selectedUsers.size === 0, // If none selected, send to ALL
        subject: emailSubject,
        message: emailMessage,
        isHtml,
      });
      // Use message from backend (e.g., "Email queuing for 1 users.")
      toast.success(res.data?.message || "Email process started");
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailMessage("");
      setIsHtml(false);
      setSelectedUsers(new Set()); // Clear selection after action
    } catch (err) {
      console.error(err);
      toast.error("Failed to send emails");
    } finally {
      setSendingEmail(false);
    }
  };

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

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1 sm:flex-none whitespace-nowrap"
            onClick={() => setShowEmailModal(true)}
          >
            Send Email {selectedUsers.size > 0 ? `(${selectedUsers.size})` : "(All)"}
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 flex-1 sm:flex-none whitespace-nowrap"
            onClick={handleBulkDelete}
            disabled={selectedUsers.size === 0}
          >
            Delete Selected ({selectedUsers.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300 rounded mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 border-r text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedUsers.size === users.length && users.length > 0}
                />
              </th>
              <th className="p-3 border-r text-left font-semibold">Name</th>
              <th className="p-3 border-r text-left font-semibold">Email</th>
              <th className="p-3 border-r text-left font-semibold">Phone</th>
              <th className="p-3 border-r text-left font-semibold">Role</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 border-b last:border-0">
                <td className="p-3 border-r text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td className="p-3 border-r">
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.firstName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, firstName: e.target.value })
                      }
                      placeholder="First Name"
                      className="border p-1 w-full rounded"
                    />
                  ) : (
                    `${user.firstName} ${user.lastName}`
                  )}
                </td>
                <td className="p-3 border-r">
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      className="border p-1 w-full rounded"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="p-3 border-r">
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.phone || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, phone: e.target.value })
                      }
                      className="border p-1 w-full rounded"
                    />
                  ) : (
                    user.phone || "-"
                  )}
                </td>
                <td className="p-3 border-r">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.isAdmin ? "admin" : "user"}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, isAdmin: e.target.value === "admin" })
                      }
                      className="border p-1 w-full rounded"
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
                <td className="p-3 flex gap-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 transition"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        Reset PW
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
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
      </div>

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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Send Custom Email</h3>
            <p className="text-sm text-gray-600 mb-4">
              Sending to:{" "}
              <span className="font-semibold">
                {selectedUsers.size > 0 ? `${selectedUsers.size} Selected Users` : "All Users"}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Subject</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Message (Supports HTML)</label>
                <textarea
                  className="w-full border rounded p-2 h-32"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter your message here..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isHtml"
                  checked={isHtml}
                  onChange={(e) => setIsHtml(e.target.checked)}
                />
                <label htmlFor="isHtml" className="text-sm">
                  Send as HTML?
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSendEmail}
                disabled={sendingEmail}
              >
                {sendingEmail ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

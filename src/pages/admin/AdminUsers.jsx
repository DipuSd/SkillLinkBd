import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers, updateUserStatus, deleteUser } from "../../api/users";

const roleFilters = [
  { label: "All", value: "all" },
  { label: "Clients", value: "client" },
  { label: "Providers", value: "provider" },
  { label: "Admins", value: "admin" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Banned", value: "banned" },
];

function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { roleFilter, searchTerm }],
    queryFn: () =>
      listUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: searchTerm || undefined,
      }),
    staleTime: 30_000,
  });

  const { mutateAsync, isPending: isUpdating } = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = useMemo(() => data?.users ?? [], [data]);

  const handleStatusChange = async (userId, status) => {
    await mutateAsync({ userId, status });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-gray-500">
            Review and moderate clients, providers, and admins.
          </p>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search users by name or email..."
          className="w-full md:w-80 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </header>

      <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-full md:w-fit">
        {roleFilters.map((option) => (
          <button
            key={option.value}
            onClick={() => setRoleFilter(option.value)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
              roleFilter === option.value
                ? "bg-white text-cyan-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Jobs
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || "/sampleProfile.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap capitalize text-gray-600">
                    {user.role}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                    {user.completedJobs ?? user.postedJobs ?? 0}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-600 capitalize">
                    {user.status ?? "active"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      <select
                        value={user.status ?? "active"}
                        onChange={(event) =>
                          handleStatusChange(user._id, event.target.value)
                        }
                        disabled={isUpdating}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {user.status === "banned" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                              deleteMutation.mutate(user._id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-700 font-semibold text-sm px-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;


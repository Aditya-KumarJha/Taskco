import { useMemo, useState } from "react";
import {
  Trash2,
  Shield,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  BadgeCheck,
  BadgeX,
  Users,
} from "lucide-react";
import { useDispatch } from "react-redux";
import {
  deleteUser,
  updateUserRole,
  toggleUserVerification,
} from "../../store/adminSlice";
import { toast } from "react-toastify";

const UsersTable = ({ users = [], pagination, onPageChange, onSearch }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (userId) => {
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.success("User deleted successfully");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  const handleVerificationToggle = async (userId) => {
    try {
      await dispatch(toggleUserVerification(userId)).unwrap();
      toast.success("User verification status updated");
    } catch (error) {
      toast.error(error.message || "Failed to update verification status");
    }
  };

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const showingText = useMemo(() => {
    if (!pagination) return "";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Showing ${start} to ${end} of ${pagination.total} users`;
  }, [pagination]);

  const roleBadge = (role) => {
    if (role === "admin") return "bg-purple-50 text-purple-700 ring-purple-200";
    return "bg-blue-50 text-blue-700 ring-blue-200";
  };

  const statusBadge = (isVerified) => {
    if (isVerified) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return "bg-yellow-50 text-yellow-800 ring-yellow-200";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-500">
                Manage roles, verification and user accounts
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[360px]">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search users..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
              />
            </div>

            <button
              onClick={handleSearch}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Users className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700">No users found</p>
                    <p className="text-sm text-gray-500">
                      Try searching with another keyword
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                        {(user.fullName?.firstName?.[0] ||
                          user.username?.[0] ||
                          user.email?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>

                      <div className="leading-tight">
                        <div className="font-semibold text-gray-900">
                          {user.fullName?.firstName || user.username || "Unknown"}{" "}
                          {user.fullName?.lastName || ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username || "no-username"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email || "No email"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ring-1 ${roleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 text-xs font-semibold">
                      {user.provider || "email"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ring-1 ${statusBadge(
                        user.isVerified
                      )}`}
                    >
                      {user.isVerified ? (
                        <BadgeCheck className="w-4 h-4" />
                      ) : (
                        <BadgeX className="w-4 h-4" />
                      )}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRoleToggle(user._id, user.role)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition"
                        title={`Change to ${user.role === "admin" ? "user" : "admin"}`}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleVerificationToggle(user._id)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition"
                        title={user.isVerified ? "Mark Unverified" : "Mark Verified"}
                      >
                        {user.isVerified ? (
                          <BadgeX className="w-5 h-5" />
                        ) : (
                          <BadgeCheck className="w-5 h-5" />
                        )}
                      </button>

                      {confirmDelete === user._id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(user._id)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-gray-600">{showingText}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 font-semibold">
              Page {pagination.page} / {pagination.pages}
            </div>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;

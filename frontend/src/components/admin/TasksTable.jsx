import { useMemo, useState } from "react";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  ClipboardList,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { deleteTask, bulkDeleteTasks } from "../../store/adminSlice";
import { toast } from "react-toastify";

const TasksTable = ({ tasks = [], pagination, onPageChange, onSearch }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());

  const toggleSelectTask = (taskId) => {
    setSelectedTasks((prev) => {
      const copy = new Set(prev);
      if (copy.has(taskId)) copy.delete(taskId);
      else copy.add(taskId);
      return copy;
    });
  };

  const selectAllVisible = () => {
    if (!tasks || tasks.length === 0) return;
    const allIds = tasks.map((t) => t._id);
    const allSelected = allIds.every((id) => selectedTasks.has(id));
    if (allSelected) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(allIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;
    if (!window.confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;
    try {
      await dispatch(bulkDeleteTasks(Array.from(selectedTasks))).unwrap();
      toast.success("Selected tasks deleted");
      setSelectedTasks(new Set());
    } catch (err) {
      toast.error(err.message || "Failed to delete selected tasks");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success("Task deleted successfully");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
      case "in_progress":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      case "done":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "low":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "medium":
        return "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200";
      case "high":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";
      default:
        return "bg-gray-100 text-gray-800 ring-1 ring-gray-200";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    if (status === "in_progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPriority = (priority) => {
    if (!priority) return "Unknown";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    try {
      return new Date(date).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const showingText = useMemo(() => {
    if (!pagination) return "";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Showing ${start} to ${end} of ${pagination.total} tasks`;
  }, [pagination]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Task Management</h2>
              <p className="text-sm text-gray-500">
                Manage all tasks created across the platform
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[340px]">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search tasks..."
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
        <table className="w-full min-w-[950px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <input
                  type="checkbox"
                  onChange={selectAllVisible}
                  checked={tasks.length > 0 && tasks.every((t) => selectedTasks.has(t._id))}
                  aria-label="select all"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <ClipboardList className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700">No tasks found</p>
                    <p className="text-sm text-gray-500">
                      Try searching with a different keyword
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-50/70 transition">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTasks.has(task._id)}
                      onChange={() => toggleSelectTask(task._id)}
                      aria-label={`select-${task._id}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {task.title || "Untitled Task"}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {task.createdBy?.username?.[0]?.toUpperCase() ||
                          task.createdBy?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </div>
                      <div className="leading-tight">
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          {task.createdBy?.username || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.createdBy?.email || "No email"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {formatStatus(task.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {formatPriority(task.priority)}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(task.dueDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {confirmDelete === task._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(task._id)}
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
                        onClick={() => setConfirmDelete(task._id)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Bulk actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-gray-600">{showingText}</div>

          <div className="flex items-center gap-2">
            {selectedTasks.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold shadow-sm hover:opacity-95 active:scale-[0.98] transition"
              >
                Delete Selected ({selectedTasks.size})
              </button>
            )}

            {pagination && pagination.pages > 1 && (
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
            )}
          </div>
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

export default TasksTable;

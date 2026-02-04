import { useState, useEffect } from "react";
import gsap from "gsap";
import Select from "../ui/Select";
import Input from "../ui/Input";

const TaskFilters = ({ onFilterChange, stats }) => {
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "-createdAt",
    search: "",
  });

  useEffect(() => {
    gsap.fromTo(
      ".filter-card",
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: "",
      priority: "",
      sort: "-createdAt",
      search: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const sortOptions = [
    { value: "-createdAt", label: "Newest First" },
    { value: "createdAt", label: "Oldest First" },
    { value: "title", label: "Title A–Z" },
    { value: "-title", label: "Title Z–A" },
    { value: "dueDate", label: "Due Date (Earliest)" },
    { value: "-dueDate", label: "Due Date (Latest)" },
    { value: "priority", label: "Priority (Low → High)" },
    { value: "-priority", label: "Priority (High → Low)" },
  ];

  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="filter-card rounded-xl border border-blue-200 bg-gradient-to-br from-blue-100 to-white p-4 transition-all duration-300 hover:scale-105">
          <p className="font-general text-xs uppercase tracking-wide text-blue-600">
            Total Tasks
          </p>
          <p className="special-font mt-1 font-zentry text-3xl font-black text-gray-900">
            {stats?.total || 0}
          </p>
        </div>

        <div className="filter-card rounded-xl border border-gray-200 bg-gradient-to-br from-gray-100 to-white p-4 transition-all duration-300 hover:scale-105">
          <p className="font-general text-xs uppercase tracking-wide text-gray-600">
            To Do
          </p>
          <p className="special-font mt-1 font-zentry text-3xl font-black text-gray-900">
            {stats?.todo || 0}
          </p>
        </div>

        <div className="filter-card rounded-xl border border-yellow-200 bg-white p-4 transition-all duration-300 hover:scale-105">
          <p className="font-general text-xs uppercase tracking-wide text-yellow-600">
            In Progress
          </p>
          <p className="special-font mt-1 font-zentry text-3xl font-black text-gray-900">
            {stats?.in_progress || 0}
          </p>
        </div>

        <div className="filter-card rounded-xl border border-green-200 bg-gradient-to-br from-green-100 to-white p-4 transition-all duration-300 hover:scale-105">
          <p className="font-general text-xs uppercase tracking-wide text-green-600">
            Completed
          </p>
          <p className="special-font mt-1 font-zentry text-3xl font-black text-gray-900">
            {stats?.done || 0}
          </p>
        </div>
      </div>

      <div className="filter-card rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="special-font font-zentry text-xl font-black uppercase text-gray-900">
            Filters
          </h3>
          <button
            onClick={handleClear}
            className="font-general text-sm uppercase text-violet-600 transition-colors hover:text-violet-400"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search tasks..."
          />

          <Select
            name="status"
            value={filters.status}
            onChange={handleChange}
            options={statusOptions}
          />

          <Select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            options={priorityOptions}
          />

          <Select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            options={sortOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;

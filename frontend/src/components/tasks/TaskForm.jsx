import { useState } from "react";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Select from "../ui/Select";
import Button from "../ui/Button";

const TaskForm = ({ initialData = {}, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    status: initialData.status || "todo",
    priority: initialData.priority || "medium",
    dueDate: initialData.dueDate
      ? new Date(initialData.dueDate).toISOString().split("T")[0]
      : "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      if (!submitData.dueDate) {
        delete submitData.dueDate;
      }
      if (!submitData.image) {
        delete submitData.image;
      }
      onSubmit(submitData);
    }
  };

  const statusOptions = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "done", label: "Completed" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Task Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title..."
        error={errors.title}
        required
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Add task details..."
        rows={4}
        error={errors.description}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />

        <Select
          label="Priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          required
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
        error={errors.dueDate}
      />

      <div className="w-full">
        <label className="mb-2 block font-general text-sm uppercase tracking-wide text-white/90">
          Task Image
        </label>

        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-white/20">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 rounded-full bg-red-500/80 p-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-red-500"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <label className="group block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-black/20 p-8 text-center transition-all duration-300 hover:border-violet-300 hover:bg-black/30">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <svg
              className="mx-auto mb-3 size-12 text-white/40 transition-colors duration-300 group-hover:text-violet-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="font-general text-sm uppercase text-white/60 group-hover:text-violet-300">
              Click to upload image
            </p>
            <p className="mt-1 font-circular-web text-xs text-white/40">
              PNG, JPG up to 5MB
            </p>
          </label>
        )}
        {errors.image && (
          <p className="mt-1 font-circular-web text-xs text-red-400">
            {errors.image}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          title={loading ? "Saving..." : initialData._id ? "Update Task" : "Create Task"}
          containerClass="flex-1 bg-violet-300 text-black hover:bg-violet-300/80"
        />
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            title="Cancel"
            containerClass="flex-1 bg-white/10 text-white hover:bg-white/20"
          />
        )}
      </div>
    </form>
  );
};

export default TaskForm;

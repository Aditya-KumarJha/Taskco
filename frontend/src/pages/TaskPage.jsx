import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import gsap from "gsap";
import { toast } from "react-toastify";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import AnimatedTitle from "../components/animations/AnimatedTitle";
import TaskCard from "../components/tasks/TaskCard";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskForm from "../components/tasks/TaskForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import {
  fetchTasks,
  updateTask,
  deleteTask,
  setFilters,
} from "../store/taskSlice";

const TaskPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tasks, loading, stats, filters } = useSelector(
    (state) => state.tasks
  );

  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const filterParams = {};
    if (filters.status) filterParams.status = filters.status;
    if (filters.priority) filterParams.priority = filters.priority;
    if (filters.sort) filterParams.sort = filters.sort;
    if (filters.search) filterParams.search = filters.search;

    dispatch(fetchTasks(filterParams));
  }, [dispatch, filters]);

  useEffect(() => {
    gsap.fromTo(
      ".tasks-hero",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }
    );
  }, []);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleEditClick = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (task, e) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateTask = async (formData) => {
    try {
      await dispatch(
        updateTask({ taskId: selectedTask._id, taskData: formData })
      ).unwrap();
      toast.success("Task updated successfully!");
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteTask(taskToDelete._id)).unwrap();
      toast.success("Task deleted successfully!");
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-violet-100 py-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 size-96 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 size-96 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto mt-10 px-4 sm:px-6 lg:px-8">
        <div className="tasks-hero mb-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <AnimatedTitle
              title="Y<b>o</b>ur T<b>a</b>sks"
              containerClass="!text-left !px-0"
            />

            <Button
              onClick={() => navigate("/create-task")}
              title={
                <span className="mt-1 flex items-center gap-2">
                  <HiPlus size={18} />
                  Create New Task
                </span>
              }
              containerClass="bg-violet-300 text-black"
            />
          </div>

          <p className="max-w-3xl font-circular-web text-lg text-gray-700">
            Manage, organize, and track all your tasks in one place. Filter by
            status, priority, or search to find exactly what you need.
          </p>
        </div>

        <TaskFilters onFilterChange={handleFilterChange} stats={stats} />

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="three-body">
              <div className="three-body__dot" />
              <div className="three-body__dot" />
              <div className="three-body__dot" />
            </div>
          </div>
        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-violet-200 p-8">
              <svg
                className="size-20 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                />
              </svg>
            </div>
            <h3 className="special-font mb-2 font-zentry text-3xl font-black uppercase text-gray-900">
              No Tasks Found
            </h3>
            <p className="mb-6 font-circular-web text-gray-600">
              Start by creating your first task.
            </p>
            <Button
              onClick={() => navigate("/create-task")}
              title="Create Task"
              containerClass="bg-violet-300 text-black"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task, index) => (
              <div
                key={task._id || index}
                className="relative group"
              >
                <TaskCard task={task} index={index} />

                <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleEditClick(task, e)}
                    className="rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600"
                  >
                    <HiPencil size={16} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteClick(task, e)}
                    className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
        size="lg"
      >
        {selectedTask && (
          <TaskForm
            initialData={selectedTask}
            onSubmit={handleUpdateTask}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-6">
          <p className="font-circular-web text-white/80">
            Are you sure you want to delete{" "}
            <span className="font-bold text-white">
              "{taskToDelete?.title}"
            </span>
            ?
          </p>
          <div className="flex gap-4">
            <Button
              onClick={handleConfirmDelete}
              title="Delete Task"
              containerClass="flex-1 text-black"
            />
            <Button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
              }}
              title="Cancel"
              containerClass="flex-1 bg-gray-200 text-black"
            />
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default TaskPage;

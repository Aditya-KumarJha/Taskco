import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "react-toastify";
import AnimatedTitle from "../components/animations/AnimatedTitle";
import TaskForm from "../components/tasks/TaskForm";
import { createTask } from "../store/taskSlice";

gsap.registerPlugin(ScrollTrigger);

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Taskco — Create Task";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    gsap.fromTo(
      ".create-task-hero",
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.3, ease: "back.out(1.7)" }
    );

    gsap.to(".float-element", {
      y: -20,
      duration: 2,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.3,
    });
  }, []);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await dispatch(createTask(formData)).unwrap();
      toast.success("Task created successfully!");

      gsap.to(formRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => navigate("/tasks"),
      });
    } catch (error) {
      toast.error(error.message || "Failed to create task");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    gsap.to(formRef.current, {
      opacity: 0,
      scale: 0.9,
      x: 30,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => navigate("/tasks"),
    });
  };

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-blue-50 to-blue-75 py-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-element absolute left-10 top-20 size-32 rounded-full bg-gradient-to-br from-violet-300/10 to-transparent blur-3xl" />
        <div className="float-element absolute right-10 top-40 size-48 rounded-full bg-gradient-to-br from-yellow-300/10 to-transparent blur-3xl" />
        <div className="float-element absolute bottom-20 left-1/2 size-40 -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-300/10 to-transparent blur-3xl" />
      </div>

      <div className="container mt-10 relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="create-task-hero mb-12 text-center">
          <AnimatedTitle
            title="Cr<b>e</b>ate New T<b>a</b>sk"
            containerClass="mb-6"
          />
          <p className="mx-auto max-w-2xl font-circular-web text-lg lg:text-xl text-black/70">
            Add a new task to your workflow. Set priorities, deadlines, and track
            your progress with ease.
          </p>
        </div>

        <div ref={formRef} className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-black/40 to-black/20 p-8 backdrop-blur-md shadow-2xl md:p-12">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-300/5 via-transparent to-yellow-300/5" />
            
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: "🎯",
                title: "Set Clear Goals",
                tip: "Define specific, measurable objectives",
              },
              {
                icon: "⏰",
                title: "Add Deadlines",
                tip: "Stay on track with due dates",
              },
              {
                icon: "🚀",
                title: "Prioritize",
                tip: "Focus on what matters most",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group rounded-xl border border-black/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-violet-300/30 hover:from-violet-300/10"
              >
                <div className="mb-3 text-4xl">{item.icon}</div>
                <h3 className="mb-2 font-general text-sm uppercase tracking-wide text-black">
                  {item.title}
                </h3>
                <p className="font-circular-web text-xs text-black/60">
                  {item.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateTaskPage;

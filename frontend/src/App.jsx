import { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import CreateTaskPage from "./pages/CreateTaskPage";
import Dashboard from "./pages/Dashboard";
import TaskPage from "./pages/TaskPage";
import NotificationPage from "./pages/NotificationPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

import { verifySession } from "./store/authSlice";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const prevAuthRef = useRef(auth.isAuthenticated);

  useEffect(() => {
    dispatch(verifySession());
  }, [dispatch]);

  useEffect(() => {
    if (!auth.checked) return;

    const initiated = localStorage.getItem("auth_initiated");

    if (initiated) {
      const action = initiated.startsWith("social:")
        ? initiated.split(":")[1]
        : "login";

      if (auth.isAuthenticated && !prevAuthRef.current) {
        toast.success(
          action === "signup"
            ? "Signup successful! Welcome to Taskco"
            : "Login successful! Welcome back"
        );
      }

      if (!auth.isAuthenticated && !prevAuthRef.current) {
        toast.error(
          action === "signup"
            ? "Signup failed. Please try again."
            : "Login failed. Please try again."
        );
      }

      localStorage.removeItem("auth_initiated");
    }

    prevAuthRef.current = auth.isAuthenticated;

    const publicPaths = ["/login", "/signup"];
    const currentPath = location.pathname;

    const isPublic = publicPaths.some(
      (p) => currentPath === p || currentPath.startsWith(p + "/")
    );

    if (!isPublic && !auth.isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: currentPath },
      });
    }
  }, [location.pathname, auth.isAuthenticated, auth.checked, navigate]);

  const hideHeaderPaths = ["/login", "/signup"];
  const shouldShowNav = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNav && <NavBar />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/create-task" element={<CreateTaskPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </>
  );
}

export default App;

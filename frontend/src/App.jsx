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
import AdminDashboard from "./pages/AdminDashboard";

import { verifySession } from "./store/authSlice";

const checkCookie = () => {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith('token='));
  } catch (e) {
    return false;
  }
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const auth = useSelector((state) => state.auth);
  const prevAuthRef = useRef(auth.isAuthenticated);
  const hasVerifiedSession = useRef(false);

  useEffect(() => {
    if (!hasVerifiedSession.current) {
      hasVerifiedSession.current = true;
      dispatch(verifySession());
      
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'success') {
        setTimeout(() => {
          dispatch(verifySession()).then((result) => {
            const userData = result?.payload?.user || result?.payload;
            if (userData && userData.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/dashboard');
            }
          });
        }, 500);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

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

    const publicPaths = ["/", "/login", "/signup"];
    const currentPath = location.pathname;

    const isPublic = publicPaths.some(
      (p) => currentPath === p || currentPath.startsWith(p + "/")
    );

    // Redirect authenticated users away from auth pages
    if (auth.isAuthenticated && auth.user && ["/login", "/signup"].includes(currentPath)) {
      const targetPath = auth.user.role === "admin" ? "/admin/dashboard" : "/dashboard";
      if (currentPath !== targetPath) {
        navigate(targetPath, { replace: true });
      }
      return;
    }

    if (!isPublic && !auth.isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: currentPath },
      });
      return;
    }

    if (auth.isAuthenticated && auth.user) {
      const isAdminRoute = currentPath.startsWith("/admin");
      const isUserRoute = ["/dashboard", "/tasks", "/create-task", "/notifications"].some(
        (p) => currentPath === p || currentPath.startsWith(p + "/")
      );

      if (isAdminRoute && auth.user.role !== "admin") {
        toast.error("Unauthorized access - Admin privileges required");
        navigate("/dashboard", { replace: true });
        return;
      }

      if (isUserRoute && auth.user.role === "admin" && currentPath !== "/admin/dashboard") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    }
  }, [location.pathname, auth.isAuthenticated, auth.checked, auth.user?.role, navigate]);

  const hideHeaderPaths = ["/login", "/signup", "/admin/dashboard"];
  const shouldShowNav = !hideHeaderPaths.includes(location.pathname);

  const publicPaths = ["/", "/login", "/signup"];
  const currentPath = location.pathname;
  const isPublic = publicPaths.some(
    (p) => currentPath === p || currentPath.startsWith(p + "/")
  );

  if (!auth.checked && !isPublic && !checkCookie()) {
    navigate("/login", {
      replace: true,
      state: { from: currentPath },
    });
    return null;
  }

  return (
    <>
      {shouldShowNav && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/create-task" element={<CreateTaskPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;

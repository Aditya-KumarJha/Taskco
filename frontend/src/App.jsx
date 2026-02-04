import { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import CreateTaskPage from "./pages/CreateTaskPage";
import Dashboard from "./pages/Dashboard";
import TaskPage from "./pages/TaskPage";
import NotificationPage from "./pages/NotificationPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import { useSelector, useDispatch } from "react-redux";
import { verifySession } from "./store/authSlice";
import { toast } from "react-toastify";

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
      if (auth.isAuthenticated && !prevAuthRef.current) {
        let action = "login";
        if (initiated.startsWith?.("social:")) {
          const parts = initiated.split(":");
          action = parts[1] || "login";
        }
        toast.success(action === "signup" ? "Signup successful! Welcome to Taskco" : "Login successful! Welcome back");
        localStorage.removeItem("auth_initiated");
      } else if (!auth.isAuthenticated && !prevAuthRef.current) {
        let action = "login";
        if (initiated.startsWith?.("social:")) {
          const parts = initiated.split(":");
          action = parts[1] || "login";
        }
        toast.error(
          (action === "signup" ? "Signup failed" : "Login failed") +
            ". Please try again."
        );
        localStorage.removeItem("auth_initiated");
      }
    }

    prevAuthRef.current = auth.isAuthenticated;

    const publicPaths = ["/", "/features", "/about", "/contact", "/login", "/signup"];
    const current = location.pathname;
    const isPublic = publicPaths.some(
      (p) => current === p || current.startsWith(p + "/")
    );

    if (!isPublic && !auth.isAuthenticated) {
      navigate("/login", { replace: true, state: { from: current } });
    }
  }, [location, navigate, auth.isAuthenticated, auth.checked]);

  const hideHeaderPaths = ["/login", "/signup"];
  const shouldShowNav = !hideHeaderPaths.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  return (
    <>
      {shouldShowNav && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/tasks/create" element={<CreateTaskPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;

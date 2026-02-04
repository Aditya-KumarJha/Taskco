import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  ListTodo,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { TiLocationArrow } from "react-icons/ti";
import { useSelector, useDispatch } from "react-redux";

import Button from "./ui/Button";
import { fetchNotifications } from "../store/notificationSlice";

const navItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Create Task", path: "/create-task", icon: PlusCircle },
  { label: "View Tasks", path: "/tasks", icon: ListTodo },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
    showBadge: true,
  },
];

const NavBar = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { unreadCount } = useSelector((state) => state.notifications);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      const interval = setInterval(
        () => dispatch(fetchNotifications()),
        30000
      );
      return () => clearInterval(interval);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!audioElementRef.current) return;
    isAudioPlaying
      ? audioElementRef.current.play()
      : audioElementRef.current.pause();
  }, [isAudioPlaying]);

  useEffect(() => {
    if (!navContainerRef.current) return;

    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    if (!navContainerRef.current) return;
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          <div className="flex items-center gap-7">
            <Link to="/">
              <img
                src="/img/logo.png"
                alt="logo"
                className="w-20 cursor-pointer"
              />
            </Link>

            <Button
              id="dashboard-button"
              title="Dashboard"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 text-black hidden md:flex items-center gap-1"
              onClick={() => navigate("/dashboard")}
            />
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(({ label, path, icon: Icon, showBadge }) => (
                <Link
                  key={label}
                  to={path}
                  className="nav-hover-btn text-black flex items-center gap-2 relative"
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {showBadge && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <button
              onClick={toggleAudioIndicator}
              className="ml-6 hidden md:flex items-center space-x-1 scale-150"
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src="/audio/loop.mp3"
                loop
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={clsx("indicator-line", {
                    active: isIndicatorActive,
                  })}
                  style={{ animationDelay: `${bar * 0.1}s` }}
                />
              ))}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="ml-4 text-2xl text-black md:hidden"
            >
              {isMobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="absolute left-0 top-full mt-2 w-full rounded-lg bg-transparent p-6 backdrop-blur-md md:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map(({ label, path, icon: Icon, showBadge }) => (
                <Link
                  key={label}
                  to={path}
                  className="text-black text-lg flex items-center gap-3 relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  {showBadge && unreadCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;

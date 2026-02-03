import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { Link } from "react-router-dom";

import Button from "./ui/Button";

const navItems = ["Home", "Features", "Dashboard", "About", "Contact"];

const NavBar = () => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex size-full items-center justify-between p-4">
          <div className="flex items-center gap-7">
            <img src="/img/logo.png" alt="logo" className="w-20" />

            <Button
              id="dashboard-button"
              title="Dashboard"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 text-black md:flex hidden items-center justify-center gap-1"
            />
          </div>

          <div className="flex items-center">
            <div className="hidden md:block">
              {navItems.map((item, index) => {
                const path =
                  item.toLowerCase() === "home" ? "/" : `/${item.toLowerCase()}`;
                return (
                  <Link
                    key={index}
                    to={path}
                    className="nav-hover-btn text-black"
                  >
                    {item}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={toggleAudioIndicator}
              className="ml-6 hidden md:flex items-center space-x-0.5 scale-150"
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
              {navItems.map((item, index) => {
                const path =
                  item.toLowerCase() === "home"
                    ? "/"
                    : `/${item.toLowerCase()}`;
                return (
                  <Link
                    key={index}
                    to={path}
                    className="text-black text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default NavBar;

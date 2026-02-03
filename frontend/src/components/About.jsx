import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./animations/AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px] lg:text-[20px]">
          Welcome to Taskco
        </p>

        <AnimatedTitle
          title="Pl<b>a</b>n tasks, tr<b>a</b>ck progress <br /> and stay in contr<b>o</b>l"
          containerClass="mt-5 !text-black text-center"
        />

        <div className="about-subtext">
          <p className="hidden md:block">Stay focused on what matters most</p>
          <p className="text-gray-500">
            Taskco helps you organize tasks, track progress, and manage your daily
            workflow with clarity and control.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.avif"
            alt="Background"
            className="absolute left-0 top-0 size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;

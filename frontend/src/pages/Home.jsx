import { useEffect } from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Features from "../components/Features";
import Story from "../components/Story";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import api from "../utils/api";

const Home = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = "Taskco — Home";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        await api.get('/');
      } catch (error) {
        console.log('Server wake-up request sent');
      }
    };
    wakeUpServer();
  }, []);
  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <Hero />
      <About />
      <Features />
      <Story />
      <Contact />
      <Footer />
    </main>
  );
};

export default Home;

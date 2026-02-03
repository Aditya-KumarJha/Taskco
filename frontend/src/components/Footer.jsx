import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const socialLinks = [
  { href: "https://github.com", icon: <FaGithub /> },
  { href: "https://linkedin.com", icon: <FaLinkedin /> },
  { href: "https://x.com", icon: <FaXTwitter /> },
  { href: "https://facebook.com", icon: <FaFacebook /> },
  { href: "https://instagram.com", icon: <FaInstagram /> },
  { href: "https://whatsapp.com", icon: <FaWhatsapp /> },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-screen bg-[#e2e0f8] py-10 text-gray-700">
      <div className="container mx-auto flex flex-col gap-8 px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-sm text-center md:text-left">
          <h3 className="text-lg font-semibold text-gray-900">Taskco</h3>
          <p className="mt-2 text-sm text-gray-600">
            A modern task management platform designed to help you plan better,
            stay focused, and get more done with clarity and control.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:items-start">
          <p className="text-sm font-medium text-gray-800">Connect with us</p>
          <div className="flex gap-5">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl text-gray-600 transition-colors duration-300 hover:text-black"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 md:items-end">
          <p className="text-sm text-gray-600">
            © {currentYear} Taskco. All rights reserved.
          </p>
          <a
            href="#privacy-policy"
            className="text-sm text-gray-600 hover:underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client"
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = ({ phoneNumber = "919927775655" }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation on mount
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 200); // optional slight delay

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-20 right-5 z-50">
      <div
        className={`group relative flex items-center justify-center transition-all duration-700 ease-out 
          ${visible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"}`}
      >
        <a
          href={`https://wa.me/${phoneNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-13 h-13 bg-green-500 text-white rounded-full shadow-[#998888] hover:shadow-black  shadow-md group-hover:shadow-4xl transition-all duration-300 hover:scale-110"
        >
          <FaWhatsapp className="text-5xl" />
        </a>

        {/* Tooltip */}
        <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-xs px-2 py-1 rounded shadow">
          WhatsApp
        </div>
      </div>
    </div>
  );
};

export default WhatsAppButton;

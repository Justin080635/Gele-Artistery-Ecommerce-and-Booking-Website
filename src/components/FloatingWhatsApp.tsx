import React, { useState } from 'react';
import { Send, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  // Nigeria code +234, number: 816 206 7064
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '2348162067064';
  const customMessage = encodeURIComponent(
    "Hello Fabulous Gele Artistry! I am visiting your website and would love to ask about your custom gele styling packages and availability."
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${customMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Soft Welcome Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-brand-dark px-4 py-2.5 rounded-2xl shadow-xl border border-brand-sage/10 text-xs font-medium max-w-[210px] pointer-events-auto flex items-start gap-1.5"
          >
            <MessageSquareText size={16} className="text-brand-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Chat with Oluwapelumi</p>
              <p className="text-[10px] text-brand-slate mt-0.5">Need instant pricing or custom styling answers?</p>
              <button 
                onClick={() => setShowTooltip(false)}
                className="text-[9px] text-brand-slate hover:text-brand-primary mt-1 underline font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl relative group cursor-pointer"
        title="Chat with us on WhatsApp"
      >
        {/* Pulsing indicator ring */}
        <span className="absolute inset-0 rounded-full bg-emerald-600/30 animate-ping opacity-75 group-hover:animate-none" />

        {/* Official styled custom SVG WhatsApp logo */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-7 h-7 text-white fill-current"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 6.002L0 24l6.291-1.65a11.862 11.862 0 005.752 1.488h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.481-8.414" />
        </svg>
      </motion.a>
    </div>
  );
}

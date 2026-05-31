import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="rulesModal" className="fixed inset-0 bg-[#001a33]/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          {/* Animated Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-faa-lg border border-slate-100"
          >
            {/* Title */}
            <h3 className="font-display font-black text-xl text-faa-blue text-center mb-6 tracking-wide uppercase">
              📋 REGLAS DEL JUEGO
            </h3>

            {/* Rule 1 */}
            <div className="flex items-start gap-3 mb-4 p-3 bg-faa-light/60 rounded-xl border border-blue-50">
              <span className="w-7 h-7 bg-accent-orange text-white rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                1
              </span>
              <p className="text-xs text-text-primary leading-relaxed font-sans">
                This game is about <strong className="text-faa-blue font-bold">MEMORIZATION</strong>. You must internalize each technical verb until it becomes automatic.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="flex items-start gap-3 mb-4 p-3 bg-faa-light/60 rounded-xl border border-blue-50">
              <span className="w-7 h-7 bg-accent-orange text-white rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                2
              </span>
              <p className="text-xs text-text-primary leading-relaxed font-sans">
                Learn English technical vocabulary. Each word is used in <strong className="text-faa-blue font-bold">real aviation maintenance</strong> contexts.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="flex items-start gap-3 mb-6 p-3 bg-faa-light/60 rounded-xl border border-blue-50">
              <span className="w-7 h-7 bg-accent-orange text-white rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                3
              </span>
              <p className="text-xs text-text-primary leading-relaxed font-sans">
                <strong className="text-faa-blue font-bold">YOU CAN DO IT</strong>. JUST PRACTICE. Mistakes are part of learning. The system will help you master every word.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              id="modalClose"
              className="w-full py-3 bg-faa-blue hover:bg-[#002244] active:scale-98 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              CLOSE / CERRAR
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

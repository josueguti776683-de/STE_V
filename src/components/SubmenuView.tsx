import React from 'react';
import { motion } from 'motion/react';
import { Group, GameMode } from '../types';
import { ArrowLeft, Play, SpellCheck, CheckCircle2, FileText, Volume2 } from 'lucide-react';

interface SubmenuViewProps {
  group: Group;
  onBack: () => void;
  onStartGame: (mode: GameMode) => void;
}

export default function SubmenuView({ group, onBack, onStartGame }: SubmenuViewProps) {
  const options: { mode: GameMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      mode: 'vocab1',
      label: '1. Vocabulary 1',
      desc: 'Familiarización y Escritura Básica',
      icon: <SpellCheck size={20} className="text-accent-orange shrink-0" />
    },
    {
      mode: 'vocab2',
      label: '2. Vocabulary 2',
      desc: 'Selección Múltiple de Vocablo Técnico',
      icon: <CheckCircle2 size={20} className="text-accent-gold shrink-0" />
    },
    {
      mode: 'vocab3',
      label: '3. Vocabulary 3',
      desc: 'Traducción de Oraciones en Contexto',
      icon: <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
    },
    {
      mode: 'test_escritura',
      label: '4. Test Escritura',
      desc: 'Evaluación de Escritura en Inglés',
      icon: <FileText size={20} className="text-rose-400 shrink-0" />
    },
    {
      mode: 'test_auditivo',
      label: '5. Test Auditivo',
      desc: 'Evaluación de Comprensión Auditiva (Audio)',
      icon: <Volume2 size={20} className="text-pink-400 shrink-0" />
    }
  ];

  return (
    <div className="min-h-screen bg-faa-dark text-white font-sans pb-16 flex flex-col relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Header of selected module */}
      <header className="pt-8 pb-6 px-4 text-center border-b border-[#002344]/80 bg-gradient-to-b from-[#001428] to-faa-dark/40 relative z-10">
        <div className="max-w-[500px] mx-auto">
          {/* Module Label */}
          <span className="text-[0.68rem] text-accent-gold font-extrabold uppercase tracking-[3px] block mb-2">
            MODULE {group.id < 10 ? `0${group.id}` : group.id}
          </span>
          {/* Module Title */}
          <h2 
            className="font-display font-black text-2xl tracking-wide uppercase leading-tight px-2 drop-shadow-sm"
            style={{ color: group.color || '#e87722' }}
          >
            {group.title}
          </h2>
          {/* Module Desc */}
          <p className="text-white/60 text-xs font-medium tracking-wide mt-2 leading-relaxed px-4">
            {group.desc}
          </p>
        </div>
      </header>

      {/* Navigation Top Bar */}
      <div className="max-w-[500px] w-full mx-auto px-4 pt-5 pb-2 relative z-10">
        <button
          onClick={onBack}
          id="submenuBack"
          className="flex items-center gap-2 bg-white/10 border border-white/25 rounded-lg px-4 py-2 text-xs font-bold text-white uppercase tracking-wider backdrop-blur-md hover:bg-white/15 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <ArrowLeft size={14} />
          ← BACK
        </button>
      </div>

      {/* Main Options */}
      <main className="max-w-[500px] w-full mx-auto px-4 pt-4 flex-1 relative z-10">
        
        {/* Helper title */}
        <p className="text-[0.62rem] text-accent-gold/80 font-black tracking-[2px] uppercase mb-4 text-center">
          SELECCIONA MODO DE ESTUDIO
        </p>

        {/* Option list container */}
        <div id="submenuOptions" className="space-y-4">
          {options.map((opt, i) => (
            <motion.button
              key={opt.mode}
              onClick={() => onStartGame(opt.mode)}
              role="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 8px 18px rgba(0, 0, 0, 0.3)' }}
              whileTap={{ scale: 0.985 }}
              className="submenu-option w-full overflow-hidden text-left bg-gradient-to-br from-faa-blue to-[#004080] border border-blue-900/30 text-white rounded-xl py-4.5 px-4 flex items-center gap-4 cursor-pointer transition-all shadow-md group active:translate-y-0"
            >
              {/* Numeric indicator or icon wrapper */}
              <div className="w-10 h-10 bg-[#001c3a] border border-blue-800/40 rounded-lg flex items-center justify-center shrink-0">
                {opt.icon}
              </div>

              {/* Text items */}
              <div className="flex-1">
                <span className="font-display font-black text-[0.92rem] tracking-wide block uppercase text-white group-hover:text-accent-gold transition-colors">
                  {opt.label}
                </span>
                <span className="text-[0.7rem] text-slate-300 font-medium block mt-0.5 font-sans">
                  {opt.desc}
                </span>
              </div>

              {/* Tiny execution decoration */}
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-accent-orange/20 transition-all shrink-0">
                <Play size={10} fill="currentColor" className="ml-0.5" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Warning card for technical training */}
        <div className="mt-8 bg-[#001326] border border-blue-950 rounded-xl p-3 text-center">
          <p className="text-[0.65rem] text-slate-400 uppercase font-bold tracking-wider leading-relaxed">
            ATENCIÓN: CUALQUIER FALLO ACTIVARÁ EL SISTEMA DE CORRECCIÓN DINÁMICA DE 3 REPETICIONES CONTINUAS SIN ERROR.
          </p>
        </div>
      </main>
    </div>
  );
}

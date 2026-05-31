import React from 'react';
import { motion } from 'motion/react';
import { GameMode, GameStats } from '../types';
import { RefreshCw, Home, Award } from 'lucide-react';

interface CompleteViewProps {
  mode: GameMode;
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export default function CompleteView({ mode, stats, onRestart, onHome }: CompleteViewProps) {
  const totalErrors = stats.wrong + stats.penalties;
  const isPerfect = totalErrors === 0;

  const modeNames: { [key in GameMode]: string } = {
    vocab1: 'VOCABULARY 1 • FAMILIARIZACIÓN',
    vocab2: 'VOCABULARY 2 • MCQ VOCABLO',
    vocab3: 'VOCABULARY 3 • CONTEXTO COMPLEMENTO',
    test: 'TEST • EVALUACIÓN TERMINADA',
    test_escritura: 'TEST ESCRITURA • EVALUACIÓN TERMINADA',
    test_auditivo: 'TEST AUDITIVO • EVALUACIÓN TERMINADA'
  };

  return (
    <div id="screenComplete" className="min-h-screen bg-slate-50 text-text-primary px-4 pt-10 pb-16 font-sans">
      <div className="max-w-[500px] mx-auto text-center">
        
        {/* Animated Trophy Header Logo */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-8xl select-none mb-6 text-center focus:outline-hidden"
        >
          {isPerfect ? '🏆' : '🥇'}
        </motion.div>

        {/* Dynamic Title */}
        <h2 className="completion-title font-display font-black text-2xl mb-3 tracking-wide uppercase text-faa-blue leading-snug">
          {isPerfect ? '🏆 ¡VICTORIA ABSOLUTA! 🏆' : '🥇 ENTRENAMIENTO TERMINADO 🥇'}
        </h2>

        {/* Dynamic customized quote message from specifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-faa-light p-6 mb-6">
          <p className="completion-sub text-text-primary text-[0.88rem] leading-relaxed font-semibold italic text-center text-slate-800">
            {isPerfect 
              ? "“BIENVENIDO A LA VICTORIA. UN AVIADOR JAMÁS SE RETIRA, JAMÁS SE RINDE, JAMÁS RETROCEDE. POR ESO SOMOS TÉCNICOS. ¡AHORA FELICIDADES, ERES EL MEJOR!”"
              : "“NO LLORES COMO UNA NENITA Y SIGUE PRACTICANDO HASTA LLEGAR A SER MEJOR. ¡TÚ PUEDES, NO TE RINDAS!”"
            }
          </p>
        </div>

        {/* Statistics list card panel */}
        <div className="completion-stats bg-faa-light/40 border border-blue-100 rounded-2xl p-5 mb-8 select-text">
          <h4 className="text-[0.65rem] font-black text-faa-blue uppercase tracking-widest text-center mb-4 pb-2 border-b border-blue-100">
            DIAGNÓSTICO TÉCNICO DE RESULTADO
          </h4>

          <div className="space-y-3.5 font-sans">
            <div className="completion-stat flex justify-between items-center py-2.5 border-b border-blue-100/60">
              <span className="text-[0.7rem] text-text-secondary font-bold tracking-wide uppercase">MODALIDAD</span>
              <span className="text-[0.76rem] font-black text-faa-blue uppercase tracking-wider">{modeNames[mode]}</span>
            </div>

            <div className="completion-stat flex justify-between items-center py-2.5 border-b border-blue-100/60">
              <span className="text-[0.7rem] text-text-secondary font-bold tracking-wide uppercase">FALLOS REGISTRADOS</span>
              <span className={`text-[0.78rem] font-bold px-2 py-0.5 rounded-sm ${totalErrors === 0 ? 'text-success-green bg-emerald-50' : 'text-alert-red bg-rose-50'}`}>
                {totalErrors} {totalErrors === 1 ? 'error' : 'errores'}
              </span>
            </div>

            <div className="completion-stat flex justify-between items-center py-2.5 border-b border-blue-100/60">
              <span className="text-[0.7rem] text-text-secondary font-bold tracking-wide uppercase">PENALIZACIONES PURGADAS</span>
              <span className="text-[0.78rem] font-bold text-text-primary">{stats.penalties}</span>
            </div>

            <div className="completion-stat flex justify-between items-center py-2.5">
              <span className="text-[0.7rem] text-text-secondary font-bold tracking-wide uppercase">CALIFICACIÓN FINAL</span>
              <span className={`text-[0.85rem] font-black tracking-wider ${isPerfect ? 'text-success-green' : 'text-amber-600'}`}>
                {isPerfect ? '100% PERFECTO' : '80% (APROBADO CON REVISIÓN)'}
              </span>
            </div>
          </div>
        </div>

        {/* Operational buttons */}
        <div className="space-y-4">
          <button
            onClick={onRestart}
            id="completionAgain"
            className="completion-btn w-full py-4.5 bg-accent-orange hover:bg-[#d4691e] border-b-4 border-[#b55210] active:scale-98 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className="animate-spin-hover" />
            AGAIN / REINTENTAR ENTRENAMIENTO
          </button>

          <button
            onClick={onHome}
            id="completionHome"
            className="completion-btn-secondary w-full py-4.5 bg-faa-blue hover:bg-[#002244] border-b-4 border-blue-900 active:scale-98 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Home size={14} />
            HOME / VOLVER AL INICIO
          </button>
        </div>

      </div>
    </div>
  );
}

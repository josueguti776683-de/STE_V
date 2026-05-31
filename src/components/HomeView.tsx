import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Group } from '../types';
import { Plane, ChevronRight, Award, Trash2 } from 'lucide-react';

interface HomeViewProps {
  groups: Group[];
  activeTma: 'tma1' | 'tma2' | 'tma3' | 'tma4';
  onChangeTma: (tma: 'tma1' | 'tma2' | 'tma3' | 'tma4') => void;
  onSelectGroup: (group: Group) => void;
  onShowRules: () => void;
}

export default function HomeView({ groups, activeTma, onChangeTma, onSelectGroup, onShowRules }: HomeViewProps) {
  const [progress, setProgress] = useState<{ [key: number]: number }>({});
  const [confirmGroupId, setConfirmGroupId] = useState<number | null>(null);

  useEffect(() => {
    // Load progress for all groups
    const newProgress: { [key: number]: number } = {};
    groups.forEach(g => {
      try {
        const key = `tma_progress_${g.id}`;
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        newProgress[g.id] = Object.keys(data).length;
      } catch {
        newProgress[g.id] = 0;
      }
    });
    setProgress(newProgress);
  }, [groups]);

  const handleClearProgress = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirmGroupId === id) {
      localStorage.removeItem(`tma_progress_${id}`);
      setProgress(prev => ({ ...prev, [id]: 0 }));
      setConfirmGroupId(null);
    } else {
      setConfirmGroupId(id);
    }
  };

  const tmaDescriptions = {
    tma1: 'Domina los verbos técnicos esenciales del manual de mantenimiento aeronáutico (AMM). Memorización forzada para asimilación absoluta.',
    tma2: 'Aprende adjetivos, estados del sistema, condiciones de falla, factores ambientales y orientaciones espaciales cruciales.',
    tma3: 'Domina etiquetas de advertencia, equipos de protección, procedimientos de emergencia, riesgos, y comandos preventivos.',
    tma4: 'Domina la nomenclatura completa de todos los sistemas mayores de la aeronave: estructuras, controles, trenes, propulsión, sistemas eléctricos, de fluidos y aviónica avanzada.'
  };

  const totalWords = groups.reduce((acc, g) => acc + g.words.length, 0);

  return (
    <div className="min-h-screen bg-faa-dark text-white pb-16 font-sans">
      {/* HEADER FIJO ORIGINAL ESTILO AVIACIÓN */}
      <header className="bg-faa-dark relative overflow-hidden text-white pt-6 pb-5 shadow-faa-light text-center z-10 border-b border-[#002b54]">
        {/* Subtle pattern or grid lines overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40"></div>
        
        <div className="max-w-[600px] mx-auto px-4 flex flex-col items-center">
          {/* Logo container */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-11 h-11 bg-accent-orange text-white rounded-lg flex items-center justify-center text-lg font-black shrink-0 shadow-lg border border-[#f08533]">
              ✈️
            </div>
            <h1 className="font-display font-black text-3xl tracking-[4px] text-white select-none drop-shadow-md">
              TMA
            </h1>
          </div>

          <p className="font-sans font-black text-[0.8rem] text-accent-gold tracking-[3px] uppercase mt-2">
            AIRCRAFT MAINTENANCE TECHNICIAN
          </p>

          <div className="mt-4 w-full max-w-[420px] h-[3px] rounded-full bg-gradient-to-r from-accent-gold via-accent-orange to-accent-gold animate-pulse"></div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[600px] mx-auto px-4 pt-6">
        
        {/* Motivating Welcome Banner */}
        <div className="mb-6 bg-gradient-to-br from-faa-blue to-[#002f5e] rounded-xl text-white p-4 shadow-md border-l-4 border-accent-orange relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[0.65rem] bg-accent-gold text-faa-dark px-2 py-0.5 rounded font-black uppercase tracking-wider">
                PROGRAMA BASE A1
              </span>
              <button 
                onClick={onShowRules}
                className="text-[0.65rem] text-accent-gold hover:text-white underline font-bold uppercase tracking-wider cursor-pointer"
              >
                📋 REGLAS
              </button>
            </div>
            
            <h2 className="text-sm font-black mt-2 font-display uppercase tracking-wide">
              ENTRENAMIENTO TÉCNICO DE AVIACIÓN
            </h2>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              {tmaDescriptions[activeTma]}
            </p>

            {/* TMA Interactive Selector Toggles */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {(['tma1', 'tma2', 'tma3', 'tma4'] as const).map((tma) => {
                const isActive = activeTma === tma;
                const label = tma.toUpperCase().replace('1', ' 1').replace('2', ' 2').replace('3', ' 3').replace('4', ' 4');
                return (
                  <button
                    key={tma}
                    onClick={() => onChangeTma(tma)}
                    className={`px-3.5 py-1.5 rounded-lg text-[0.68rem] font-black tracking-widest uppercase transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-accent-orange text-white shadow-md border border-[#f08533]'
                        : 'bg-faa-dark/30 hover:bg-faa-dark/60 text-blue-200 hover:text-white border border-blue-900/35'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-3 font-black text-white/5 opacity-10 text-7xl select-none">
            FAA
          </div>
        </div>

        {/* Modules Title */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-display font-bold text-[0.72rem] tracking-wider text-accent-gold uppercase">
            MÓDULOS DE ESTUDIO ({groups.length})
          </h3>
          <span className="text-[0.65rem] text-slate-350 font-bold uppercase tracking-wider">
            {totalWords > 0 ? `${totalWords} PALABRAS EN TOTAL` : 'Módulos en desarrollo'}
          </span>
        </div>

        {/* Modules List or Empty/Placeholder state */}
        {groups.length === 0 ? (
          <div className="bg-[#001c3a] border border-blue-900/30 p-8 rounded-xl text-center flex flex-col items-center">
            <span className="text-2xl mb-3">🔒</span>
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-accent-gold">
              TMA 3 - MÓDULO EN DESARROLLO
            </h4>
            <p className="text-[0.7rem] text-blue-100/70 mt-2 max-w-[325px] leading-relaxed">
              Próximamente agregaremos más vocabulario técnico aeronáutico avanzado para este programa. ¡Continúa entrenando en TMA 1 y TMA 2!
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {groups.map((group, index) => {
              const completed = progress[group.id] || 0;
              const totalGroupWords = group.words.length || 1;
              const pct = Math.round((completed / totalGroupWords) * 100);

              return (
                <motion.div
                  key={group.id}
                  id={`group-${group.id}`}
                  onClick={() => onSelectGroup(group)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  whileTap={{ scale: 0.992 }}
                  className="group-card bg-[#001c3a] hover:bg-[#002246] rounded-xl border border-blue-900/40 shadow-md hover:shadow-lg cursor-pointer transition-all overflow-hidden flex flex-col active:scale-[0.995]"
                >
                  {/* Header elements flex */}
                  <div 
                    className="group-header flex items-stretch min-h-[72px]"
                    style={{ borderLeft: `5px solid ${group.color || '#e87722'}` }}
                  >
                    {/* Left Info area */}
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span 
                          className="text-[0.55rem] font-black tracking-widest uppercase px-2 py-0.5 rounded text-white shadow-xs"
                          style={{ backgroundColor: group.color }}
                        >
                          MOD {index + 1}
                        </span>
                        <span className="text-blue-900/80 text-xs font-bold">|</span>
                        <span className="text-[0.65rem] text-slate-300 font-semibold uppercase tracking-wider">
                          {totalGroupWords} terms
                        </span>
                      </div>

                      <h4 className="group-title font-display font-black text-sm tracking-wide uppercase leading-tight text-white">
                        {group.title}
                      </h4>

                      <p className="group-desc text-[0.72rem] text-blue-100/70 mt-1 font-medium leading-normal">
                        {group.desc}
                      </p>
                    </div>

                    {/* Right Status Panel */}
                    <div className="px-3 shrink-0 flex flex-col items-center justify-center border-l border-blue-950 bg-slate-900/10 min-w-[90px]">
                      {pct === 100 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-lg">🏆</span>
                          <span className="text-[0.6rem] text-emerald-400 font-black tracking-wider uppercase mt-1">
                            COMPLETO
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-white">
                            {completed}/{totalGroupWords}
                          </span>
                          {/* Compact progress pill */}
                          <div className="w-12 h-1.5 bg-[#001428] rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${pct}%`,
                                backgroundColor: group.color 
                              }}
                            ></div>
                          </div>
                          <span className="text-[0.55rem] text-slate-400 font-bold mt-1">
                            {pct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Navigation arrow click */}
                    <div className="w-10 bg-slate-900/15 flex items-center justify-center border-l border-blue-950 text-slate-400 group-hover:text-accent-gold shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  {/* Reset progress action for all modules */}
                  <div className="border-t border-blue-950/30 px-4 py-1.5 flex justify-end bg-[#001428]/40">
                    <button
                      onClick={(e) => handleClearProgress(e, group.id)}
                      onMouseLeave={() => {
                        if (confirmGroupId === group.id) {
                          setConfirmGroupId(null);
                        }
                      }}
                      title="Reiniciar progreso del módulo"
                      className={`text-[0.62rem] flex items-center gap-1 font-bold uppercase tracking-wider cursor-pointer transition-all px-2 py-1 rounded select-none ${
                        confirmGroupId === group.id
                          ? 'text-white bg-red-600 hover:bg-red-700 font-extrabold animate-pulse border border-red-500'
                          : 'text-slate-400 hover:text-rose-400 transition-colors'
                      }`}
                    >
                      <Trash2 size={11} />
                      {confirmGroupId === group.id ? '¿CONFIRMAR RESETEAR?' : 'RESETEAR PROGRESO'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footnote original alignment */}
        <p className="text-[0.68rem] text-slate-400 text-center font-bold uppercase tracking-widest mt-12 mb-4 leading-relaxed">
          SISTEMA OFFLINE PERSISTENTE • {totalWords} TÉRMINOS EN TOTAL
        </p>

      </main>
    </div>
  );
}

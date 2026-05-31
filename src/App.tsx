/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GROUPS, GROUPS_TMA2, GROUPS_TMA3, GROUPS_TMA4 } from './data';
import { Group, GameMode, GameStats } from './types';

// Importing beautiful modular components
import HomeView from './components/HomeView';
import SubmenuView from './components/SubmenuView';
import GameView from './components/GameView';
import CompleteView from './components/CompleteView';
import RulesModal from './components/RulesModal';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'submenu' | 'game' | 'complete'>('home');
  const [activeTma, setActiveTma] = useState<'tma1' | 'tma2' | 'tma3' | 'tma4'>('tma1');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode | null>(null);
  const [currentStats, setCurrentStats] = useState<GameStats | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  // Navigation handlers
  const handleSelectGroup = (group: Group) => {
    setCurrentGroup(group);
    setScreen('submenu');
  };

  const handleBackToHome = () => {
    setCurrentGroup(null);
    setCurrentMode(null);
    setScreen('home');
  };

  const handleStartGame = (mode: GameMode) => {
    setCurrentMode(mode);
    setScreen('game');
  };

  const handleBackToSubmenu = () => {
    setCurrentMode(null);
    setScreen('submenu');
  };

  const handleGameComplete = (stats: GameStats) => {
    setCurrentStats(stats);
    setScreen('complete');
  };

  const getGroupsForActiveTma = () => {
    if (activeTma === 'tma2') return GROUPS_TMA2;
    if (activeTma === 'tma3') return GROUPS_TMA3;
    if (activeTma === 'tma4') return GROUPS_TMA4;
    return GROUPS;
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-accent-orange/30 selection:text-faa-blue select-none">
      {/* 1. Main Home Screen Dashboard */}
      {screen === 'home' && (
        <HomeView
          groups={getGroupsForActiveTma()}
          activeTma={activeTma}
          onChangeTma={setActiveTma}
          onSelectGroup={handleSelectGroup}
          onShowRules={() => setIsRulesOpen(true)}
        />
      )}

      {/* 2. Submenu Selection Options screen for current group */}
      {screen === 'submenu' && currentGroup && (
        <SubmenuView
          group={currentGroup}
          onBack={handleBackToHome}
          onStartGame={handleStartGame}
        />
      )}

      {/* 3. Real Active Gameplay screen */}
      {screen === 'game' && currentGroup && currentMode && (
        <GameView
          group={currentGroup}
          mode={currentMode}
          onBack={handleBackToSubmenu}
          onGameComplete={handleGameComplete}
          onShowRules={() => setIsRulesOpen(true)}
        />
      )}

      {/* 4. Complete final scores summary */}
      {screen === 'complete' && currentMode && currentStats && (
        <CompleteView
          mode={currentMode}
          stats={currentStats}
          onRestart={() => setScreen('game')}
          onHome={handleBackToHome}
        />
      )}

      {/* 5. Aviation Technical Guidelines display overlay */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}

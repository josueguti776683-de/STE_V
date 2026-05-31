import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Group, Word, GameMode, GameStats, PenaltyState } from '../types';
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, XCircle, Play, HelpCircle, Volume2 } from 'lucide-react';

const getMaskedWord = (en: string) => {
  const word = en.trim();
  if (word.length <= 2) return word.toUpperCase();
  const first = word[0].toUpperCase();
  const last = word[word.length - 1].toUpperCase();
  const middle = Array(word.length - 2).fill('_').join(' ');
  return `${first} ${middle} ${last}`;
};

interface GameViewProps {
  group: Group;
  mode: GameMode;
  onBack: () => void;
  onGameComplete: (stats: GameStats) => void;
  onShowRules: () => void;
}

export default function GameView({ group, mode, onBack, onGameComplete, onShowRules }: GameViewProps) {
  // Original Game state
  const [rawGameQueue, rawSetGameQueue] = useState<Word[]>([]);
  const [rawCurrentIndex, rawSetCurrentIndex] = useState<number>(0);
  const [rawPenaltyState, rawSetPenaltyState] = useState<PenaltyState | null>(null);
  const [rawStats, rawSetStats] = useState<GameStats>({
    correct: 0,
    wrong: 0,
    penalties: 0,
    totalAttempts: 0
  });

  // Presentation vs Rewrite states for Vocab 1
  const [rawIsIntroStep, rawSetIsIntroStep] = useState<boolean>(true);

  // Input states (Write and Test)
  const [rawInputValue, rawSetInputValue] = useState<string>('');
  const [rawFeedback, rawSetFeedback] = useState<{ text: string; type: 'success' | 'error' | 'none' }>({
    text: '',
    type: 'none'
  });
  const [rawIsVerifying, rawSetIsVerifying] = useState<boolean>(false);

  // Selector states (Vocab 2 & Vocab 3)
  const [optionsList, setOptionsList] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isMultipleChoiceChecked, setIsMultipleChoiceChecked] = useState<boolean>(false);

  // Penalty Input state
  const [penaltyInput, setPenaltyInput] = useState<string>('');
  const [penaltyMessage, setPenaltyMessage] = useState<{ text: string; isError: boolean }>({
    text: '',
    isError: false
  });
  const [shakePenalty, setShakePenalty] = useState<boolean>(false);

  // Sub-mode and customized penalty for listening test (Vocab/Evaluation)
  const [testSubMode, setTestSubMode] = useState<'escritura' | 'auditivo'>('escritura');
  const [rawListeningErrorState, rawSetListeningErrorState] = useState<{ motivation: string } | null>(null);

  // Escritura independent test states
  const [escrituraQueue, setEscrituraQueue] = useState<Word[]>([]);
  const [escrituraIndex, setEscrituraIndex] = useState<number>(0);
  const [escrituraStats, setEscrituraStats] = useState<GameStats>({
    correct: 0, wrong: 0, penalties: 0, totalAttempts: 0
  });
  const [escrituraPenaltyState, setEscrituraPenaltyState] = useState<PenaltyState | null>(null);
  const [escrituraInputValue, setEscrituraInputValue] = useState<string>('');
  const [escrituraFeedback, setEscrituraFeedback] = useState<{ text: string; type: 'success' | 'error' | 'none' }>({ text: '', type: 'none' });
  const [escrituraIsVerifying, setEscrituraIsVerifying] = useState<boolean>(false);
  const [escrituraIsIntroStep, setEscrituraIsIntroStep] = useState<boolean>(true);

  // Auditivo independent test states
  const [auditivoQueue, setAuditivoQueue] = useState<Word[]>([]);
  const [auditivoIndex, setAuditivoIndex] = useState<number>(0);
  const [auditivoStats, setAuditivoStats] = useState<GameStats>({
    correct: 0, wrong: 0, penalties: 0, totalAttempts: 0
  });
  const [auditivoListeningErrorState, setAuditivoListeningErrorState] = useState<{ motivation: string } | null>(null);
  const [auditivoInputValue, setAuditivoInputValue] = useState<string>('');
  const [auditivoFeedback, setAuditivoFeedback] = useState<{ text: string; type: 'success' | 'error' | 'none' }>({ text: '', type: 'none' });
  const [auditivoIsVerifying, setAuditivoIsVerifying] = useState<boolean>(false);

  // Resolve active state wrappers depending on whether we are in 'test' mode or other modes
  const isTest = mode === 'test' || mode === 'test_escritura' || mode === 'test_auditivo';

  const gameQueue = isTest 
    ? (testSubMode === 'escritura' ? escrituraQueue : auditivoQueue)
    : rawGameQueue;

  const currentIndex = isTest
    ? (testSubMode === 'escritura' ? escrituraIndex : auditivoIndex)
    : rawCurrentIndex;

  const stats = isTest
    ? (testSubMode === 'escritura' ? escrituraStats : auditivoStats)
    : rawStats;

  const penaltyState = isTest
    ? (testSubMode === 'escritura' ? escrituraPenaltyState : null)
    : rawPenaltyState;

  const listeningErrorState = isTest
    ? (testSubMode === 'auditivo' ? auditivoListeningErrorState : null)
    : rawListeningErrorState;

  const inputValue = isTest
    ? (testSubMode === 'escritura' ? escrituraInputValue : auditivoInputValue)
    : rawInputValue;

  const feedback = isTest
    ? (testSubMode === 'escritura' ? escrituraFeedback : auditivoFeedback)
    : rawFeedback;

  const isVerifying = isTest
    ? (testSubMode === 'escritura' ? escrituraIsVerifying : auditivoIsVerifying)
    : rawIsVerifying;

  const isIntroStep = isTest
    ? (testSubMode === 'escritura' ? escrituraIsIntroStep : false)
    : rawIsIntroStep;

  // Setter wrappers
  const setGameQueue = (updater: Word[] | ((prev: Word[]) => Word[])) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraQueue(updater);
      } else {
        setAuditivoQueue(updater);
      }
    } else {
      rawSetGameQueue(updater);
    }
  };

  const setCurrentIndex = (val: number | ((prev: number) => number)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraIndex(val);
      } else {
        setAuditivoIndex(val);
      }
    } else {
      rawSetCurrentIndex(val);
    }
  };

  const setStats = (updater: GameStats | ((prev: GameStats) => GameStats)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraStats(updater);
      } else {
        setAuditivoStats(updater);
      }
    } else {
      rawSetStats(updater);
    }
  };

  const setPenaltyState = (val: PenaltyState | null | ((prev: PenaltyState | null) => PenaltyState | null)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraPenaltyState(val);
      }
    } else {
      rawSetPenaltyState(val);
    }
  };

  const setListeningErrorState = (val: { motivation: string } | null | ((prev: { motivation: string } | null) => { motivation: string } | null)) => {
    if (isTest) {
      if (testSubMode === 'auditivo') {
        setAuditivoListeningErrorState(val);
      }
    } else {
      rawSetListeningErrorState(val);
    }
  };

  const setInputValue = (val: string | ((prev: string) => string)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraInputValue(val);
      } else {
        setAuditivoInputValue(val);
      }
    } else {
      rawSetInputValue(val);
    }
  };

  const setFeedback = (val: { text: string; type: 'success' | 'error' | 'none' } | ((prev: { text: string; type: 'success' | 'error' | 'none' }) => { text: string; type: 'success' | 'error' | 'none' })) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraFeedback(val);
      } else {
        setAuditivoFeedback(val);
      }
    } else {
      rawSetFeedback(val);
    }
  };

  const setIsVerifying = (val: boolean | ((prev: boolean) => boolean)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraIsVerifying(val);
      } else {
        setAuditivoIsVerifying(val);
      }
    } else {
      rawSetIsVerifying(val);
    }
  };

  const setIsIntroStep = (val: boolean | ((prev: boolean) => boolean)) => {
    if (isTest) {
      if (testSubMode === 'escritura') {
        setEscrituraIsIntroStep(val);
      }
    } else {
      rawSetIsIntroStep(val);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const penaltyInputRef = useRef<HTMLInputElement>(null);

  // 1. Initialize Game Queue (shuffle terms)
  useEffect(() => {
    const queue = [...group.words];
    // Fisher-Yates shuffle
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    rawSetGameQueue(queue);
    rawSetCurrentIndex(0);
    rawSetPenaltyState(null);
    rawSetIsIntroStep(true);
    rawSetInputValue('');
    setSelectedOption(null);
    setIsMultipleChoiceChecked(false);
    setTestSubMode(mode === 'test_auditivo' ? 'auditivo' : 'escritura');
    rawSetListeningErrorState(null);
    rawSetStats({
      correct: 0,
      wrong: 0,
      penalties: 0,
      totalAttempts: 0
    });

    // Independent Escritura sub-test reset
    const qEsc = [...group.words];
    for (let i = qEsc.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qEsc[i], qEsc[j]] = [qEsc[j], qEsc[i]];
    }
    setEscrituraQueue(qEsc);
    setEscrituraIndex(0);
    setEscrituraStats({
      correct: 0,
      wrong: 0,
      penalties: 0,
      totalAttempts: 0
    });
    setEscrituraPenaltyState(null);
    setEscrituraInputValue('');
    setEscrituraFeedback({ text: '', type: 'none' });
    setEscrituraIsVerifying(false);
    setEscrituraIsIntroStep(true);

    // Independent Auditivo sub-test reset
    const qAud = [...group.words];
    for (let i = qAud.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qAud[i], qAud[j]] = [qAud[j], qAud[i]];
    }
    setAuditivoQueue(qAud);
    setAuditivoIndex(0);
    setAuditivoStats({
      correct: 0,
      wrong: 0,
      penalties: 0,
      totalAttempts: 0
    });
    setAuditivoListeningErrorState(null);
    setAuditivoInputValue('');
    setAuditivoFeedback({ text: '', type: 'none' });
    setAuditivoIsVerifying(false);
  }, [group, mode]);

  const currentWord = gameQueue[currentIndex];

  // 2. Generate multiple choice options stable on word change
  useEffect(() => {
    if (!currentWord || penaltyState) return;

    if (mode === 'vocab2') {
      // Filter words from the same group
      const secondaryWords = group.words.filter(w => w.en !== currentWord.en);
      // Shuffle secondary
      const shuffledSec = [...secondaryWords].sort(() => 0.5 - Math.random());
      // Take first 2 and compose list
      const wrong1 = shuffledSec[0]?.es || 'Ajustar';
      const wrong2 = shuffledSec[1]?.es || 'Conectar';
      
      const mixed = [wrong1, wrong2, currentWord.es];
      setOptionsList(mixed.sort(() => 0.5 - Math.random()));
      setSelectedOption(null);
      setIsMultipleChoiceChecked(false);
    } else if (mode === 'vocab3') {
      const secondaryWords = group.words.filter(w => w.en !== currentWord.en);
      const shuffledSec = [...secondaryWords].sort(() => 0.5 - Math.random());
      const wrong1 = shuffledSec[0]?.ctxEs || 'Acción alternativa en el sistema';
      const wrong2 = shuffledSec[1]?.ctxEs || 'Verifique el indicador de presión del reactor';
      
      const mixed = [wrong1, wrong2, currentWord.ctxEs];
      setOptionsList(mixed.sort(() => 0.5 - Math.random()));
      setSelectedOption(null);
      setIsMultipleChoiceChecked(false);
    }
  }, [currentIndex, currentWord, mode, group, penaltyState]);

  // Autofocus input elements when steps change
  useEffect(() => {
    const isModeWithTyping = mode === 'vocab1' || mode === 'test' || mode === 'test_escritura' || mode === 'test_auditivo';
    if (!penaltyState && !isIntroStep && isModeWithTyping && !listeningErrorState) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [penaltyState, isIntroStep, mode, currentIndex, testSubMode, listeningErrorState]);

  // Auto-pronounce active word when entering or when index advances in auditivo test
  useEffect(() => {
    if (isTest && testSubMode === 'auditivo' && currentWord) {
      const timer = setTimeout(() => {
        speakText(currentWord.en);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, testSubMode, isTest, group]);

  useEffect(() => {
    if (penaltyState) {
      setTimeout(() => penaltyInputRef.current?.focus(), 150);
    }
  }, [penaltyState]);

  // Voice Pronunciation system (SpeechSynthesis API en-US female voice)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voice list
      window.speechSynthesis.getVoices();
      const warmingListener = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', warmingListener);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', warmingListener);
      };
    }
  }, []);

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-faa-dark text-white p-6">
        <div className="text-center font-bold">Cargando entrenamiento...</div>
      </div>
    );
  }

  // 3. Save progress to LocalStorage helper
  const saveProgress = (wordEn: string) => {
    try {
      const key = `tma_progress_${group.id}`;
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      data[wordEn] = true;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage write blocked or failed: ", e);
    }
  };

  // 4. Inserción aleatoria ante fallas (insertWordRandomly)
  const insertWordRandomly = (word: Word) => {
    const remaining = gameQueue.length - currentIndex - 1;
    if (remaining <= 0) {
      setGameQueue(prev => [...prev, word]);
      return;
    }
    const minSkip = 2;
    const maxSkip = Math.min(5, remaining);
    const skip = minSkip + Math.floor(Math.random() * (maxSkip - minSkip + 1));
    const insertPos = currentIndex + skip;

    setGameQueue(prev => {
      const copy = [...prev];
      copy.splice(insertPos, 0, word);
      return copy;
    });
  };

  // 5. PENALTY TRIGGER
  const startPenalty = (word: Word, isSentence: boolean = false) => {
    setStats(prev => ({ ...prev, penalties: prev.penalties + 1 }));
    setPenaltyState({
      word,
      count: 0,
      target: 3,
      isSentence,
      originalIndex: currentIndex
    });
    setPenaltyInput('');
    setPenaltyMessage({ text: 'PRÁCTICA RIGOROSA: Escribe la frase exacta para completar.', isError: false });
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Immediately stop ongoing pronunciation patterns
    window.speechSynthesis.cancel();

    const cleanedText = text
      .replace(/[““”"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const usVoices = voices.filter(v => 
      v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase().startsWith('en-')
    );

    // Filter to prioritize standard clean, female sounding voices
    const feminineVocabNames = [
      'samantha',           // Apple macOS/iOS standard female
      'google us english',  // Chrome default clean female
      'zira',               // Windows Desktop female
      'amy',                // Windows female alternative
      'susan',              // Windows Susan
      'hazel',              // Microsoft UK English
      'victoria',           // Apple Victoria
      'sofia',              // Apple Sofia
      'joanna',             // AWS Joanna
      'female'              // Explicit generic female
    ];

    let selectedVoice = null;
    for (const nameToken of feminineVocabNames) {
      const match = usVoices.find(v => v.name.toLowerCase().includes(nameToken));
      if (match) {
        selectedVoice = match;
        break;
      }
    }

    if (!selectedVoice) {
      selectedVoice = usVoices.find(v => v.lang.toLowerCase() === 'en-us');
    }
    if (!selectedVoice) {
      selectedVoice = usVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Calibrated speed & pleasant feminine tone properties
    utterance.rate = 0.92;      // Educational standard speed for maximized intelligibility
    utterance.pitch = 1.05;     // Clean, modern feminine pitch signature
    utterance.volume = 0.95;     // Dynamic normal volume value

    window.speechSynthesis.speak(utterance);
  };

  // Helper functions to ignore trailing dot in penalty sentences
  const getCleanPenaltyDisplayText = (state: { isSentence: boolean, word: Word }) => {
    let t = state.isSentence ? state.word.ctx : state.word.en;
    if (state.isSentence && t.endsWith('.')) {
      t = t.slice(0, -1);
    }
    return t;
  };

  const getCleanPenaltyTarget = (state: { isSentence: boolean, word: Word }) => {
    let t = state.isSentence ? state.word.ctx : state.word.en;
    t = t.toUpperCase();
    if (state.isSentence && t.endsWith('.')) {
      t = t.slice(0, -1);
    }
    return t.trim();
  };

  // 6. Handle Penalty auto-checking inside Input handler
  const triggerPenaltySuccess = () => {
    if (!penaltyState) return;
    const nextCount = penaltyState.count + 1;
    
    if (nextCount >= 3) {
      // Penalty fully completed!
      setPenaltyState(prev => prev ? { ...prev, count: nextCount } : null);
      setPenaltyMessage({ text: '✓ ¡Penalización completada! Ahora prueba que aprendiste.', isError: false });
      
      setTimeout(() => {
        // Re-insert into queue randomly for retention validation later
        insertWordRandomly(penaltyState.word);
        // Clean states and return to Screen 2 of gameplay progress for the same word
        setPenaltyState(null);
        setPenaltyInput('');
        setIsIntroStep(false); // Directly back to Rewrite screen (Paso 2 de 2)
        setInputValue('');
        setSelectedOption(null);
        setIsMultipleChoiceChecked(false);
        setFeedback({ text: '', type: 'none' });
      }, 1200);
    } else {
      // Clean value, increment count, notify success, request typing again
      setPenaltyState(prev => prev ? { ...prev, count: nextCount } : null);
      setPenaltyInput('');
      setPenaltyMessage({ text: `✓ ¡Correcto! Siguiente repetición (${nextCount}/3)`, isError: false });
      
      // Return focus to the input immediately
      setTimeout(() => {
        penaltyInputRef.current?.focus();
      }, 100);
    }
  };

  const triggerPenaltyFailure = () => {
    if (!penaltyState) return;
    // Wrong typing! Reset consecutive count to 0, shake card
    setShakePenalty(true);
    setTimeout(() => setShakePenalty(false), 400);

    setPenaltyState(prev => prev ? { ...prev, count: 0 } : null);
    setPenaltyMessage({ text: '✗ ¡Error en digitación! Revisa el texto y reinicias de 0/3.', isError: true });
    
    // Auto-select text so user can see they can backspace/fix it or retype easily
    setTimeout(() => {
      penaltyInputRef.current?.focus();
      penaltyInputRef.current?.select();
    }, 100);
  };

  const handlePenaltyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!penaltyState) return;
    const rawValue = e.target.value;
    setPenaltyInput(rawValue);

    const val = rawValue.toUpperCase();
    const target = getCleanPenaltyTarget(penaltyState);

    // Check if what they've typed so far is a valid prefix of the target text
    const targetSub = target.substring(0, val.length);
    const isMismatch = val !== targetSub;

    if (val.trim() === target) {
      // SUCCESS: Exactly matched on trailing trim or direct compare!
      triggerPenaltySuccess();
      return;
    }

    if (isMismatch) {
      // Let the user backspace without resetting the counter to 0/3 immediately
      setPenaltyMessage({ 
        text: '⚠️ ¡Tecla equivocada! Corrige usando borrar (backspace).', 
        isError: true 
      });

      // ONLY penalize and reset consecutive count to 0 if they type as many characters as the target or more
      if (val.length >= target.length) {
        triggerPenaltyFailure();
      }
    } else {
      // Perfectly on-track typing
      setPenaltyMessage({ 
        text: val.length > 0 
          ? `Digitando... (${val.length}/${target.length} caract.)` 
          : 'PRÁCTICA RIGOROSA: Escribe la frase exacta para completar.', 
        isError: false 
      });
    }
  };

  const handleVerifyPenalty = () => {
    if (!penaltyState) return;

    const val = penaltyInput.toUpperCase();
    const target = getCleanPenaltyTarget(penaltyState);

    if (val.trim() === target) {
      triggerPenaltySuccess();
    } else {
      triggerPenaltyFailure();
    }
  };

  // 7. VERIFICATION MECHANISM (Vocabulary 1 & Test spelling modes)
  const handleVerifySpellingAndAdvance = () => {
    if (isVerifying) return;
    const trimmedInput = inputValue.trim().toUpperCase();
    if (!trimmedInput) return;

    setIsVerifying(true);
    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    const isCorrect = trimmedInput === currentWord.en.toUpperCase();

    if (isCorrect) {
      setFeedback({ text: '✓ CORRECTO', type: 'success' });
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      saveProgress(currentWord.en);

      setTimeout(() => {
        setIsVerifying(false);
        setInputValue('');
        setFeedback({ text: '', type: 'none' });
        setIsIntroStep(true);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= gameQueue.length) {
          onGameComplete({
            ...stats,
            correct: stats.correct + 1,
            totalAttempts: stats.totalAttempts + 1
          });
        } else {
          setCurrentIndex(nextIndex);
          if (isTest && testSubMode === 'auditivo') {
            const nextWord = gameQueue[nextIndex];
            if (nextWord) {
              setTimeout(() => speakText(nextWord.en), 100);
            }
          }
        }
      }, 800);
    } else {
      if (isTest && testSubMode === 'auditivo') {
        // Listening evaluation test error penalty flow
        setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        
        // This word will appear again later in the exam: insert randomly
        insertWordRandomly(currentWord);

        setTimeout(() => {
          setIsVerifying(false);
          setInputValue('');
          setFeedback({ text: '', type: 'none' });

          const motivations = [
            "¡Tú puedes, no te rindas!",
            "¡La persistencia es la clave del aprendizaje!",
            "¡Estás cada vez más cerca, sigue intentando!",
            "¡Un error es solo una oportunidad para aprender!",
            "¡No te rindas, tienes el poder de lograrlo!"
          ];
          const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
          setListeningErrorState({ motivation: randomMotivation });
        }, 300);
      } else {
        setFeedback({ text: '✗ RECHAZADO • INICIANDO MEDIDAS CORRECTIVAS', type: 'error' });
        setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));

        setTimeout(() => {
          setIsVerifying(false);
          setIsIntroStep(true);
          setInputValue('');
          setFeedback({ text: '', type: 'none' });

          // Trigger sentence penalty or standard word spelling correction
          startPenalty(currentWord, false);
        }, 1100);
      }
    }
  };

  // 8. VERIFICATION MECHANISM (Vocabulary 2 & 3 Multiple Choice selection modes)
  const handleVerifyMultipleChoiceAndAdvance = () => {
    if (!selectedOption || isMultipleChoiceChecked) return;

    setIsMultipleChoiceChecked(true);
    setStats(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

    const isVocab2 = mode === 'vocab2';
    const referenceAnswer = isVocab2 ? currentWord.es : currentWord.ctxEs;
    const isCorrect = selectedOption === referenceAnswer;

    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      saveProgress(currentWord.en);
      
      // visual feedback delay
      setTimeout(() => {
        setSelectedOption(null);
        setIsMultipleChoiceChecked(false);

        const nextIndex = currentIndex + 1;
        if (nextIndex >= gameQueue.length) {
          onGameComplete({
            ...stats,
            correct: stats.correct + 1,
            totalAttempts: stats.totalAttempts + 1
          });
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 800);
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      
      setTimeout(() => {
        setSelectedOption(null);
        setIsMultipleChoiceChecked(false);

        // Turn on spell-correction penalty mode
        // For sentences (vocab3): typed sentences. For words (vocab2): typed words.
        startPenalty(currentWord, !isVocab2);
      }, 900);
    }
  };

  const pct = Math.round((currentIndex / gameQueue.length) * 100);
  const totalItems = gameQueue.length;

  return (
    <div id="screenGame" className="min-h-screen bg-gradient-to-b from-faa-dark to-[#002f5e] text-white font-sans flex flex-col pb-10 select-none">
      
      {/* Dynamic Top bar header */}
      <div className="game-top-bar flex items-center justify-between p-4 max-w-[500px] w-full mx-auto relative z-10 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:text-red-300"
        >
          <ArrowLeft size={13} />
          ← BACK
        </button>

        <button
          onClick={onShowRules}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer hover:text-accent-gold"
        >
          📋 REGLAS
        </button>
      </div>

      {/* Test Tabs rendered at the top level for 100% VISUAL INDEPENDENCE */}
      {mode === 'test' && !penaltyState && (
        <div className="flex max-w-[420px] w-full mx-auto px-4 mb-4 select-none gap-2 shrink-0">
          <button
            onClick={() => {
              setTestSubMode('escritura');
              setInputValue('');
              setFeedback({ text: '', type: 'none' });
              setListeningErrorState(null);
            }}
            className={`flex-1 text-center py-2.5 text-[0.68rem] tracking-widest uppercase transition-all rounded-xl border font-extrabold cursor-pointer ${
              testSubMode === 'escritura'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                : 'bg-[#001c3a] border-blue-900/40 text-blue-200 hover:text-white'
            }`}
          >
            📝 TEST ESCRITURA
          </button>
          <button
            onClick={() => {
              setTestSubMode('auditivo');
              setInputValue('');
              setFeedback({ text: '', type: 'none' });
              setListeningErrorState(null);
              const wordToSpeak = auditivoQueue[auditivoIndex];
              if (wordToSpeak) {
                setTimeout(() => speakText(wordToSpeak.en), 150);
              }
            }}
            className={`flex-1 text-center py-2.5 text-[0.68rem] tracking-widest uppercase transition-all rounded-xl border font-extrabold cursor-pointer ${
              testSubMode === 'auditivo'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                : 'bg-[#001c3a] border-blue-900/40 text-blue-200 hover:text-white'
            }`}
          >
            🔊 TEST AUDITIVO
          </button>
        </div>
      )}

      {/* Mode identification display */}
      <div className="text-center mt-1 mb-3 shrink-0">
        <h4 className="text-xs uppercase font-black text-slate-300 tracking-[3px] font-display">
          {mode === 'vocab1' && 'VOCABULARY 1 • ESCRITURA Y FAMILIARIZACIÓN'}
          {mode === 'vocab2' && 'VOCABULARY 2 • SELECCIÓN MÚLTIPLE'}
          {mode === 'vocab3' && 'VOCABULARY 3 • CONTEXTO COMPLEMENTARIO'}
          {isTest && (testSubMode === 'escritura' ? 'TEST ESCRITURA • EVALUACIÓN DE ESCRITURA' : 'TEST AUDITIVO • COMPRENSIÓN AUDITIVA')}
        </h4>
        <div className="text-2xl font-black font-display text-accent-orange mt-1 tracking-wider drop-shadow-sm">
          {currentIndex + 1} / {totalItems}
        </div>
      </div>

      {/* Modern fluid progress indicators */}
      <div className="progress-wrapper w-full max-w-[420px] mx-auto px-4 mb-6 shrink-0">
        <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-accent-orange via-accent-gold to-accent-orange rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[0.62rem] text-slate-400 font-bold tracking-wider mt-1 uppercase">
          <span>{pct}% Completado</span>
          <span className="text-slate-200">Fichas Restantes: {totalItems - currentIndex} / {totalItems}</span>
        </div>
      </div>

      {/* Content wrapper with flexible height for focus preservation */}
      <main id="gameContent" className="game-content-area px-4 max-w-[450px] w-full mx-auto flex-1 flex flex-col justify-start">
        
        <AnimatePresence mode="wait">
          {penaltyState ? (
            /* ====================================================================
               PENALTY CONTAINER CARD (ACTIVE SYSTEM CORRECTION)
               ==================================================================== */
            <motion.div
              key="penalty-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`penalty-card bg-white text-text-primary rounded-2xl p-6 border-3 border-alert-red shadow-faa-lg overflow-hidden flex flex-col justify-between select-text ${shakePenalty ? 'animate-shake' : ''}`}
            >
              {/* Header details */}
              <div className="shrink-0 mb-4">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-alert-red animate-pulse" />
                  <h3 className="penalty-title font-display font-black text-md text-alert-red tracking-wider uppercase text-center">
                    PENALIZACIÓN ACTIVA
                  </h3>
                </div>

                <p className="penalty-sub text-[0.72rem] text-text-secondary text-center font-bold tracking-tight uppercase">
                  Debes escribirlo exactamente 3 veces continuas sin fallos
                </p>
              </div>

              {/* 1 - Reference technical source text to copy and learn */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 shrink-0">
                <span className="text-[0.62rem] text-text-secondary font-black uppercase tracking-wider block mb-1">
                  {penaltyState.isSentence ? 'FRASE CORRECTA EN INGLÉS:' : 'TÉRMINO EN INGLÉS:'}
                </span>
                <div className="flex items-start gap-2.5 mt-1">
                  <button
                    onClick={() => speakText(getCleanPenaltyDisplayText(penaltyState))}
                    className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100/90 active:scale-95 text-accent-orange border border-orange-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0 self-start"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 size={16} />
                  </button>
                  <p className="penalty-word font-mono font-black text-md text-faa-blue uppercase leading-snug break-words tracking-wide flex-1 self-center">
                    {getCleanPenaltyDisplayText(penaltyState)}
                  </p>
                </div>
                <p className="text-xs text-text-secondary mt-2 font-sans italic border-t border-slate-200/40 pt-2 pl-9">
                  {penaltyState.isSentence ? penaltyState.word.ctxEs : penaltyState.word.es}
                </p>
              </div>

              {/* 2 - Action typing layout */}
              <div className="mb-4 shrink-0">
                <label className="text-[0.68rem] text-text-secondary font-extrabold tracking-widest uppercase mb-1 block">
                  DIGITA EN INGLÉS:
                </label>
                <input
                  ref={penaltyInputRef}
                  type="text"
                  value={penaltyInput}
                  onChange={handlePenaltyInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPenalty();
                  }}
                  placeholder="ESCRIBE EXTREMADAMENTE CUIDADOSO..."
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className={`penalty-input w-full p-4 font-mono font-black text-md md:text-lg text-center border-3 bg-white rounded-xl focus:outline-hidden uppercase tracking-wider shadow-sm transition-colors ${
                    !penaltyInput 
                      ? 'border-slate-300 focus:border-accent-orange text-text-primary'
                      : (() => {
                          const val = penaltyInput.toUpperCase();
                          const target = getCleanPenaltyTarget(penaltyState);
                          const targetSub = target.substring(0, val.length);
                          return val !== targetSub 
                            ? 'border-alert-red text-alert-red bg-red-50/10 focus:border-alert-red' 
                            : 'border-emerald-500 text-emerald-700 bg-emerald-50/5 focus:border-emerald-500';
                        })()
                  }`}
                />

                <p className={`penalty-msg text-xs font-black tracking-tight text-center mt-2.5 leading-snug ${penaltyMessage.isError ? 'text-alert-red animate-pulse' : 'text-success-green'}`}>
                  {penaltyMessage.text}
                </p>
              </div>

              {/* 3 - Counter status 3x */}
              <div className="bg-amber-50 rounded-xl py-3 border border-amber-100 flex flex-col items-center justify-center shrink-0">
                <div className="penalty-counter text-4xl font-display font-black text-accent-orange">
                  {penaltyState.count}/3
                </div>
                <span className="text-[0.6rem] text-text-secondary font-extrabold tracking-widest uppercase mt-0.5">
                  REPETICIONES CONSECUTIVAS
                </span>

                {/* Explanatory description of +1 requested by user */}
                <div className="text-center mt-2 px-3 border-t border-amber-250/20 pt-2 w-full">
                  <p className="text-[0.65rem] text-amber-900 font-extrabold uppercase tracking-wide">
                    ⚠️ {penaltyState.isSentence ? '+1 repetir esta oración' : '+1 repetir esta palabra'}
                  </p>
                  <p className="text-[0.55rem] text-slate-500 font-bold leading-normal uppercase mt-0.5 px-1">
                    EL CONTADOR GENERAL SE SUMA UNO (EJ. 2/18 → 3/19) SI COMETES UN ERROR
                  </p>
                </div>
              </div>

            </motion.div>
          ) : (
            /* ====================================================================
               NORMAL DIRECT MODES
               ==================================================================== */
            <motion.div
              key={`${mode}-${currentIndex}-${isIntroStep}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col justify-start"
            >
              {/* ==================== VOCABULARY 1 ==================== */}
              {mode === 'vocab1' && (
                isIntroStep ? (
                  // Step A: Term Familiarity Intro Card
                  <div className="vocab-card bg-white text-text-primary rounded-2xl p-6 shadow-faa-lg border-l-6 border-accent-orange relative overflow-hidden flex flex-col justify-between flex-1 min-h-[360px] select-text">
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                        <span className="text-[0.62rem] text-accent-orange font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                          FAMILIARIZACIÓN • PASO 1 DE 2
                        </span>
                        <HelpCircle size={15} className="text-slate-300" />
                      </div>

                      <div className="flex items-center gap-2.5 mb-2">
                        <button
                          onClick={() => speakText(currentWord.en)}
                          className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-accent-orange border border-orange-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0 self-center"
                          title="Escuchar vocablo"
                        >
                          <Volume2 size={18} />
                        </button>
                        <h2 className="vocab-word font-display font-black text-4xl text-faa-blue uppercase tracking-wide leading-tight select-all">
                          {currentWord.en}
                        </h2>
                      </div>
                      <p className="vocab-trans font-sans font-bold text-md text-text-secondary leading-snug border-b border-dashed border-slate-200 pb-3 mb-4 pl-[38px] select-all">
                        {currentWord.es}
                      </p>

                      <div className="mt-4 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                        <span className="text-[0.62rem] text-text-secondary font-extrabold uppercase tracking-widest block mb-1">
                          CONCEBIDO EN MANUALES DE TALLER:
                        </span>
                        <div className="flex items-start gap-2.5 mt-1">
                          <button
                            onClick={() => speakText(currentWord.ctx)}
                            className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-accent-orange border border-orange-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0 self-start mt-0.5"
                            title="Escuchar oración"
                          >
                            <Volume2 size={14} />
                          </button>
                          <p className="vocab-ctx-en font-mono font-bold text-[0.88rem] leading-relaxed text-faa-blue italic select-all flex-1">
                            &ldquo;{currentWord.ctx}&rdquo;
                          </p>
                        </div>
                        <p className="vocab-ctx-es font-sans font-medium text-[0.76rem] leading-relaxed text-text-secondary mt-2 border-t border-slate-200/50 pt-2 pl-9 select-all">
                          {currentWord.ctxEs}
                        </p>
                      </div>
                    </div>

                    {/* Bottom active trigger to writing step */}
                    <button
                      onClick={() => setIsIntroStep(false)}
                      className="learn-btn w-full mt-6 py-4.5 bg-accent-orange hover:bg-[#d4691e] border-b-4 border-[#b55210] active:scale-98 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      LEARN / ESCRIBIR
                    </button>
                  </div>
                ) : (
                  // Step B: Spell Writing Verification Panel
                  <div className="write-card bg-white text-text-primary rounded-2xl p-6 shadow-faa-lg border-l-6 border-faa-blue flex flex-col justify-between flex-1 min-h-[350px]">
                    <div>
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-indigo-50">
                        <span className="write-label text-[0.62rem] text-faa-blue font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          REESCRITURA • PASO 2 DE 2
                        </span>
                        <span className="text-[0.6rem] text-text-secondary font-bold select-none">
                          Término traducido: <strong>{currentWord.es}</strong>
                        </span>
                      </div>

                      <div className="text-center my-6">
                        <p className="text-xs text-text-secondary font-bold tracking-wide uppercase">
                          Escribe en inglés la traducción de:
                        </p>
                        <p className="text-xl font-display font-black text-faa-blue uppercase mt-1">
                          {currentWord.es}
                        </p>
                      </div>

                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleVerifySpellingAndAdvance();
                        }}
                        disabled={isVerifying}
                        placeholder="INGRESA TÉRMINO EN INGLÉS..."
                        autoComplete="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        className="write-input w-full p-4 font-mono font-black text-lg text-center border-3 border-slate-300 focus:border-faa-blue bg-white rounded-xl focus:outline-hidden text-text-primary uppercase tracking-widest shadow-inner"
                      />
                    </div>

                    <div>
                      <button
                        onClick={handleVerifySpellingAndAdvance}
                        disabled={isVerifying || !inputValue.trim()}
                        className={`verify-btn w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                          inputValue.trim()
                            ? 'bg-faa-blue hover:bg-[#002852] active:scale-98 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                        }`}
                      >
                        {isVerifying ? 'PROCESANDO...' : 'VERIFY / VERIFICAR'}
                      </button>

                      {feedback.type !== 'none' && (
                        <p className={`text-center font-bold text-xs mt-3 select-none uppercase tracking-wider animate-pulse ${
                          feedback.type === 'success' ? 'text-success-green' : 'text-alert-red'
                        }`}>
                          {feedback.text}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* ==================== VOCABULARY 2 (MCQ Verb Only) ==================== */}
              {mode === 'vocab2' && (
                <div className="vocab-card bg-white text-text-primary rounded-2xl p-5 shadow-faa-lg border-l-6 border-accent-gold flex flex-col justify-between flex-1 min-h-[380px]">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-50">
                      <span className="text-[0.62rem] text-accent-gold font-black uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded">
                        SELECCIÓN MÚLTIPLE DE VOCABLO
                      </span>
                    </div>

                    <div className="text-center my-4 shrink-0">
                      <p className="text-xs text-text-secondary font-bold tracking-wide uppercase mb-2">
                        ¿Cuál es la traducción correcta del verbo?
                      </p>
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          onClick={() => speakText(currentWord.en)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 active:scale-95 text-accent-gold border border-amber-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0"
                          title="Escuchar verbo"
                        >
                          <Volume2 size={16} />
                        </button>
                        <h2 className="font-display font-black text-3xl text-faa-blue tracking-wide uppercase select-all">
                          {currentWord.en}
                        </h2>
                      </div>
                    </div>

                    <p className="text-[0.68rem] text-text-secondary font-extrabold tracking-widest uppercase mb-2 text-center select-none">
                      SELECCIONA TÉRMINO:
                    </p>

                    {/* Lists of MCQ words */}
                    <div className="options-list space-y-2.5">
                      {optionsList.map((opt) => {
                        const isSelected = selectedOption === opt;
                        const isChecked = isMultipleChoiceChecked;
                        const isCorrect = opt === currentWord.es;

                        let styleClasses = "border-2 border-slate-200 hover:border-accent-orange/50 hover:bg-slate-50";
                        if (isSelected) {
                          if (isChecked) {
                            styleClasses = isCorrect
                              ? "border-success-green bg-emerald-50/60 font-bold"
                              : "border-alert-red bg-rose-50/60 font-bold";
                          } else {
                            styleClasses = "border-accent-orange bg-amber-50/40 font-bold";
                          }
                        } else if (isChecked && isCorrect) {
                          styleClasses = "border-success-green bg-emerald-50/30"; // highlights the correct if missed
                        }

                        return (
                          <button
                            key={`opt2-${opt}`}
                            onClick={() => !isChecked && setSelectedOption(opt)}
                            disabled={isChecked}
                            className={`option-item w-full px-4 py-3.5 rounded-xl cursor-pointer text-left text-xs font-bold transition-all flex items-center justify-between ${styleClasses}`}
                          >
                            <span>{opt}</span>
                            {isSelected && (
                              <span className="text-xs shrink-0 select-none ml-2">
                                {isChecked && isCorrect ? '✓ CORRECTO' : isChecked ? '× ERROR' : '✓ (Elegido)'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleVerifyMultipleChoiceAndAdvance}
                      disabled={!selectedOption || isMultipleChoiceChecked}
                      className={`learn-btn w-full mt-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        selectedOption
                          ? 'bg-faa-blue text-white hover:bg-[#002f5e] active:scale-98'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                      }`}
                    >
                      VERIFY / CONTINUAR
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== VOCABULARY 3 (MCQ Context Sentence) ==================== */}
              {mode === 'vocab3' && (
                <div className="vocab-card bg-white text-text-primary rounded-2xl p-5 shadow-faa-lg border-l-6 border-emerald-500 flex flex-col justify-between flex-1 min-h-[400px]">
                  <div>
                    <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-slate-100 select-none">
                      <span className="text-[0.62rem] text-emerald-600 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                        COMPLEMENTO DE ORACIÓN EN CONTEXTO
                      </span>
                    </div>

                    <div className="my-3 text-center shrink-0">
                      <p className="text-xs text-text-secondary font-bold tracking-wide uppercase select-none mb-2">
                        ¿Cuál es la traducción correcta de la oración?
                      </p>
                      {/* Manual Context display */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-start gap-2.5 text-left select-text mt-2">
                        <button
                          onClick={() => speakText(currentWord.ctx)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-600 border border-emerald-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0 mt-0.5"
                          title="Escuchar oración"
                        >
                          <Volume2 size={14} />
                        </button>
                        <p className="font-mono font-bold text-xs xmd:text-sm text-faa-blue leading-relaxed flex-1">
                          &ldquo;{currentWord.ctx}&rdquo;
                        </p>
                      </div>
                    </div>

                    <p className="text-[0.68rem] text-text-secondary font-extrabold tracking-widest uppercase mb-1.5 text-center select-none">
                      SELECCIONA TRADUCCIÓN:
                    </p>

                    {/* Lists of MCQ Sentences */}
                    <div className="options-list space-y-2">
                      {optionsList.map((opt) => {
                        const isSelected = selectedOption === opt;
                        const isChecked = isMultipleChoiceChecked;
                        const isCorrect = opt === currentWord.ctxEs;

                        let styleClasses = "border-2 border-slate-200 hover:border-emerald-400/50 hover:bg-slate-50";
                        if (isSelected) {
                          if (isChecked) {
                            styleClasses = isCorrect
                              ? "border-success-green bg-emerald-50/60 font-bold"
                              : "border-alert-red bg-rose-50/60 font-bold";
                          } else {
                            styleClasses = "border-emerald-500 bg-emerald-50/20 font-bold";
                          }
                        } else if (isChecked && isCorrect) {
                          styleClasses = "border-success-green bg-emerald-50/30";
                        }

                        return (
                          <button
                            key={`opt3-${opt}`}
                            onClick={() => !isChecked && setSelectedOption(opt)}
                            disabled={isChecked}
                            className={`option-item w-full px-3 py-3 rounded-xl cursor-pointer text-left text-[0.68rem] font-bold leading-normal transition-all flex items-start gap-2 ${styleClasses}`}
                          >
                            <span className="flex-1 shrink break-words">{opt}</span>
                            {isSelected && (
                              <span className="text-[0.62rem] shrink-0 font-extrabold uppercase select-none whitespace-nowrap ml-1 mt-0.5">
                                {isChecked && isCorrect ? '✓ SI' : isChecked ? '× NO' : '✓ (Elegido)'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleVerifyMultipleChoiceAndAdvance}
                      disabled={!selectedOption || isMultipleChoiceChecked}
                      className={`learn-btn w-full mt-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        selectedOption
                          ? 'bg-faa-blue text-white hover:bg-[#002f5e] active:scale-98'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                      }`}
                    >
                      VERIFY / CONTINUAR
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== TEST spelling evaluation ==================== */}
              {isTest && (
                <div className="write-card bg-white text-text-primary rounded-2xl p-6 shadow-faa-lg border-l-6 border-rose-500 flex flex-col justify-between flex-1 min-h-[300px]">
                  {testSubMode === 'auditivo' ? (
                    listeningErrorState ? (
                      /* HIGH-INTENSITY DOUBLE-PULSING AVIONICS ALARM PANEL */
                      <div className="border-4 border-alert-red bg-red-50/20 rounded-2xl p-5 flex flex-col justify-between items-center text-center animate-pulse-border select-text h-full flex-1">
                        <div className="flex flex-col items-center gap-1.5 mb-2">
                          <AlertTriangle size={32} className="text-alert-red animate-bounce" />
                          <h3 className="font-display font-black text-[1.1rem] text-alert-red tracking-widest uppercase">
                            DISCREPANCIA TÉCNICA
                          </h3>
                        </div>
                        
                        <div className="bg-red-500/10 border border-red-200/20 text-alert-red font-mono font-extrabold text-[0.8rem] rounded-xl px-4 py-3 leading-relaxed mb-4 w-full">
                          <p className="text-sm font-black uppercase tracking-wider mb-1">
                            ⚠️ +1 REPETIR ESTA PALABRA
                          </p>
                          <p className="text-[0.68rem] uppercase opacity-95 font-bold leading-normal">
                            Esta palabra volverá a aparecer más adelante para consolidar tu aprendizaje.
                          </p>
                        </div>

                        <p className="text-xs font-black italic text-text-secondary uppercase tracking-tight bg-slate-50 border border-slate-200/60 rounded-lg px-4 py-3 mb-5 w-full leading-relaxed">
                          &ldquo;{listeningErrorState.motivation}&rdquo;
                        </p>

                        <button
                          onClick={() => {
                            setListeningErrorState(null);
                            setTimeout(() => inputRef.current?.focus(), 150);
                          }}
                          className="w-full py-4 bg-alert-red hover:bg-[#a61c1c] text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md active:scale-98 cursor-pointer border-b-4 border-red-800"
                        >
                          OKIE DOKIE
                        </button>
                      </div>
                    ) : (
                      /* AUDITIVO NORMAL TRAINING SCREEN */
                      <div className="flex flex-col justify-between h-full flex-1">
                        <div>
                          <div className="text-center my-4">
                            <div className="flex flex-col items-center justify-center gap-3 bg-slate-50 border border-dashed border-slate-200 p-4 rounded-xl mb-4 select-all">
                              <button
                                onClick={() => speakText(currentWord.en)}
                                className="p-3 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-500 border border-rose-200 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0"
                                title="Escuchar pronunciación"
                              >
                                <Volume2 size={24} className="animate-pulse" />
                              </button>
                              
                              <h2 className="font-mono font-black text-2xl tracking-[0.25em] text-faa-blue uppercase select-all ml-[0.25em]">
                                {getMaskedWord(currentWord.en)}
                              </h2>
                            </div>

                            <p className="test-hint text-[0.62rem] text-text-secondary font-black tracking-widest uppercase select-none mb-1">
                              WRITE IN ENGLISH:
                            </p>
                            <p className="text-[0.62rem] text-slate-400 font-extrabold max-w-[280px] mx-auto leading-normal uppercase select-none">
                              PRÁCTICA AUDITIVA: escucha la palabra en inglés para escribirla
                            </p>
                          </div>

                          <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleVerifySpellingAndAdvance();
                            }}
                            disabled={isVerifying}
                            placeholder="WRITE IN ENGLISH..."
                            autoComplete="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            className="write-input w-full p-4 font-mono font-black text-lg text-center border-3 border-slate-300 focus:border-rose-500 bg-white rounded-xl focus:outline-hidden text-text-primary uppercase tracking-widest shadow-inner shadow-slate-100"
                          />
                        </div>

                        <div className="mt-6">
                          <button
                            onClick={handleVerifySpellingAndAdvance}
                            disabled={isVerifying || !inputValue.trim()}
                            className={`verify-btn w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                              inputValue.trim()
                                ? 'bg-rose-500 hover:bg-rose-600 active:scale-98 text-white border-b-4 border-rose-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                            }`}
                          >
                            {isVerifying ? 'EVALUANDO...' : 'VERIFY / COMPLETAR'}
                          </button>

                          {feedback.type !== 'none' && (
                            <p className={`text-center font-bold text-xs mt-3 select-none uppercase tracking-wider animate-pulse ${
                              feedback.type === 'success' ? 'text-success-green' : 'text-alert-red'
                            }`}>
                              {feedback.text}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    /* ORIGINAL ESCRITURA TREATMENT SCREEN */
                    <div className="flex flex-col justify-between h-full flex-1">
                      <div>
                        <div className="text-center my-6">
                          <p className="test-hint text-xs text-text-secondary font-bold tracking-wide uppercase select-none">
                            Escribe el verbo en inglés correspondiente a:
                          </p>
                          <p className="text-2xl font-display font-black text-faa-blue uppercase mt-1 select-text">
                            {currentWord.es}
                          </p>
                        </div>

                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleVerifySpellingAndAdvance();
                          }}
                          disabled={isVerifying}
                          placeholder="TYPE IN ENGLISH..."
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          className="write-input w-full p-4 font-mono font-black text-lg text-center border-3 border-slate-300 focus:border-rose-500 bg-white rounded-xl focus:outline-hidden text-text-primary uppercase tracking-widest shadow-inner shadow-slate-100"
                        />
                      </div>

                      <div className="mt-6">
                        <button
                          onClick={handleVerifySpellingAndAdvance}
                          disabled={isVerifying || !inputValue.trim()}
                          className={`verify-btn w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                            inputValue.trim()
                              ? 'bg-rose-500 hover:bg-rose-600 active:scale-98 text-white border-b-4 border-rose-700'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                          }`}
                        >
                          {isVerifying ? 'EVALUANDO...' : 'VERIFY / COMPLETAR'}
                        </button>

                        {feedback.type !== 'none' && (
                          <p className={`text-center font-bold text-xs mt-3 select-none uppercase tracking-wider animate-pulse ${
                            feedback.type === 'success' ? 'text-success-green' : 'text-alert-red'
                          }`}>
                            {feedback.text}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

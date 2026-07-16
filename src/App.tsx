/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { StudentInfo, Question, StudentResponse, DiagnosticReport, Grade, CurriculumType, MasteryLevel } from './types';
import { createRandomizedAssessmentPaper } from './data/questionGenerator';
import QuestionRenderer from './components/QuestionRenderer';
import ParentDashboard from './components/ParentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import { Award, Compass, Play, ArrowLeft, ArrowRight, Save, Clipboard, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mymasterylab_baseline_state';
const WEBHOOK_URL_KEY = 'mymasterylab_sheets_webhook';

export default function App() {
  // --- STATE SYSTEM ---
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [paper, setPaper] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, 'Low' | 'Medium' | 'High'>>({});
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [scriptUrl, setScriptUrl] = useState<string>('https://script.google.com/macros/s/AKfycbzIA9I8YNitTs0XeZrTHLTzWSuifHTTfYqK6g4nGatcnQ2bc6pA9a8xMKaLSBr4lGy50w/exec');
  
  // Modal states for iframe safety
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState<'parent' | 'teacher'>('parent');
  
  // Onboarding form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGrade, setFormGrade] = useState<Grade | ''>('');
  const [formCurriculum, setFormCurriculum] = useState<CurriculumType | ''>('');
  const [formError, setFormError] = useState('');

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'failed' | 'offline'>('offline');
  const [syncMessage, setSyncMessage] = useState('Default webhook configured. Submissions will automatically synchronize on completion.');

  // Ref to track elapsed time on the active question
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOCAL PERSISTENCE LOADER ---
  useEffect(() => {
    // Load configured webhook
    const savedWebhook = localStorage.getItem(WEBHOOK_URL_KEY);
    if (savedWebhook) {
      setScriptUrl(savedWebhook);
      setSyncStatus('offline');
      setSyncMessage('Webhook configured. Ready to synchronize on next submission.');
    } else {
      setScriptUrl('https://script.google.com/macros/s/AKfycbzIA9I8YNitTs0XeZrTHLTzWSuifHTTfYqK6g4nGatcnQ2bc6pA9a8xMKaLSBr4lGy50w/exec');
      setSyncStatus('offline');
      setSyncMessage('Default Data sync webhook active. Ready to synchronize on next submission.');
    }

    // Load active assessment if interrupted
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.student && parsed.paper && parsed.paper.length > 0) {
          setStudent(parsed.student);
          setPaper(parsed.paper);
          setAnswers(parsed.answers || {});
          setConfidenceRatings(parsed.confidenceRatings || {});
          setActiveIdx(parsed.activeIdx || 0);
          setQuestionTimers(parsed.questionTimers || {});
          setIsCompleted(parsed.isCompleted || false);
        }
      } catch (err) {
        console.error('Failed to parse saved session state:', err);
      }
    }
  }, []);

  // --- SAVE STATE TO STORAGE ---
  useEffect(() => {
    if (student && paper.length > 0) {
      const stateToSave = {
        student,
        paper,
        answers,
        confidenceRatings,
        activeIdx,
        questionTimers,
        isCompleted
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [student, paper, answers, confidenceRatings, activeIdx, questionTimers, isCompleted]);

  // --- ACTIVE TASK TIMER ---
  useEffect(() => {
    if (!student || isCompleted || paper.length === 0) return;

    const currentQ = paper[activeIdx];
    if (!currentQ) return;

    // Start 1-second interval tracker
    timerRef.current = setInterval(() => {
      setQuestionTimers((prev) => {
        const currentSeconds = prev[currentQ.id] || 0;
        return {
          ...prev,
          [currentQ.id]: currentSeconds + 1
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [student, isCompleted, activeIdx, paper]);

  // --- ONBOARDING ACTIONS ---
  const handleStartOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter the student’s full name.');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('Please enter a valid school or parent email address.');
      return;
    }
    if (!formGrade) {
      setFormError('Please select a grade level.');
      return;
    }
    if (!formCurriculum) {
      setFormError('Please select a curriculum framework.');
      return;
    }

    const assessmentId = `MML-${formCurriculum}-${formGrade}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newStudent: StudentInfo = {
      name: formName.trim(),
      email: formEmail.trim(),
      grade: formGrade,
      curriculum: formCurriculum,
      assessmentId,
      date: new Date().toISOString()
    };

    // Generate Randomized Curricular Baseline
    const randomizedPaper = createRandomizedAssessmentPaper(formGrade, formCurriculum);

    setStudent(newStudent);
    setPaper(randomizedPaper);
    setAnswers({});
    setConfidenceRatings({});
    setActiveIdx(0);
    setQuestionTimers({});
    setIsCompleted(false);
  };

  const handleResetSession = () => {
    setShowResetConfirm(true);
  };

  const executeResetSession = () => {
    setShowResetConfirm(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setStudent(null);
    setPaper([]);
    setAnswers({});
    setConfidenceRatings({});
    setActiveIdx(0);
    setQuestionTimers({});
    setIsCompleted(false);
    setFormName('');
    setFormEmail('');
    setFormGrade('');
    setFormCurriculum('');
  };

  // --- ASSESSMENT NAVIGATION ---
  const handleNext = () => {
    setShowHint(false);
    if (activeIdx < paper.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const handlePrev = () => {
    setShowHint(false);
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  // --- LIVE SYNC TRANSMITTER ---
  const transmitToSheets = async (finalReport: DiagnosticReport, targetUrl?: string) => {
    const urlToUse = targetUrl || scriptUrl || 'https://script.google.com/macros/s/AKfycbzIA9I8YNitTs0XeZrTHLTzWSuifHTTfYqK6g4nGatcnQ2bc6pA9a8xMKaLSBr4lGy50w/exec';
    if (!student || !urlToUse) return;

    setSyncStatus('pending');
    setSyncMessage('Transmitting diagnostic scores to Google Sheets...');

    try {
      // Loop and transmit one row per question
      let successCount = 0;

      for (let i = 0; i < paper.length; i++) {
        const q = paper[i];
        const ans = answers[q.id];
        const isCorrect = evaluateResponse(q, ans);
        const qTime = questionTimers[q.id] || 0;
        
        // Match specific category score for diagnostic mapping
        const catScore = finalReport.categoryScores[q.category] || { percentage: 0, mastery: 'Emerging' };

        const payload = {
          timestamp: student.date,
          assessmentId: student.assessmentId,
          studentName: student.name,
          email: student.email,
          grade: `Grade ${student.grade}`,
          curriculum: student.curriculum,
          category: q.category,
          subcategory: q.subcategory,
          standard: q.standardCode,
          questionId: q.id,
          difficulty: q.difficulty,
          questionType: q.type,
          question: q.text,
          correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer),
          studentResponse: ans !== undefined ? (Array.isArray(ans) ? ans.join(', ') : String(ans)) : 'Skipped/No Answer',
          correctOrWrong: isCorrect ? 'Correct' : 'Wrong',
          marks: isCorrect ? 1 : 0,
          timeTaken: qTime,
          overallScore: finalReport.overallScore,
          percentage: `${finalReport.overallPercentage}%`
        };

        // Transmit row POST to the Web App
        const res = await fetch(urlToUse, {
          method: 'POST',
          mode: 'no-cors', // standard Apps Script CORS requirement
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        successCount++;
      }

      setSyncStatus('synced');
      setSyncMessage(`All ${successCount} item rows successfully synchronized with your spreadsheet!`);
    } catch (err: any) {
      console.error('Webhook sheet sync error:', err);
      setSyncStatus('failed');
      setSyncMessage(`Failed to synchronize: ${err.message}. Progress is saved locally.`);
    }
  };

  // --- EVALUATION ENGINE ---
  const evaluateResponse = (q: Question, ans: any): boolean => {
    if (ans === undefined || ans === null || ans === '') return false;
    
    if (q.type === 'DRAG_DROP_ORDERING') {
      if (!Array.isArray(ans) || !Array.isArray(q.correctAnswer)) return false;
      return ans.every((val, idx) => val === (q.correctAnswer as number[])[idx]);
    }
    
    if (q.type === 'MULTIPLE_SELECT') {
      if (!Array.isArray(ans) || !Array.isArray(q.correctAnswer)) return false;
      if (ans.length !== q.correctAnswer.length) return false;
      return ans.every(val => (q.correctAnswer as string[]).includes(val));
    }
    
    if (q.type === 'SHORT_NUMERICAL' || q.type === 'FILL_IN_BLANK') {
      return String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    }
    
    return String(ans).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
  };

  // --- SUBMIT ASSESSMENT ---
  const handleSubmitAssessment = () => {
    setShowSubmitConfirm(true);
  };

  const executeSubmitAssessment = () => {
    setShowSubmitConfirm(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsCompleted(true);
    
    // Calculate final psychometric outcomes
    const finalReport = calculateDiagnosticReport();
    
    // Trigger Webhook Sheets Sync automatically on completion
    const targetUrl = scriptUrl || 'https://script.google.com/macros/s/AKfycbzIA9I8YNitTs0XeZrTHLTzWSuifHTTfYqK6g4nGatcnQ2bc6pA9a8xMKaLSBr4lGy50w/exec';
    transmitToSheets(finalReport, targetUrl);
  };

  // --- RECALCULATE DIAGNOSTIC METRICS ---
  const calculateDiagnosticReport = (): DiagnosticReport => {
    let overallCorrect = 0;
    const categoryTotals: Record<string, { correct: number; total: number }> = {};
    const difficultyTotals: Record<string, { correct: number; total: number }> = {
      Easy: { correct: 0, total: 0 },
      Medium: { correct: 0, total: 0 },
      Hard: { correct: 0, total: 0 }
    };

    let skippedCount = 0;
    let totalSolveTime = 0;

    // Cognitive domain buffers
    let fluencyTotal = 0, fluencyCorrect = 0;
    let reasoningTotal = 0, reasoningCorrect = 0;
    let computationalTotal = 0, computationalCorrect = 0;
    let geometryTotal = 0, geometryCorrect = 0;
    let fractionsTotal = 0, fractionsCorrect = 0;
    let numberSenseTotal = 0, numberSenseCorrect = 0;

    paper.forEach((q) => {
      const ans = answers[q.id];
      const isCorrect = evaluateResponse(q, ans);
      const isSkipped = ans === undefined || ans === null || ans === '';
      const qTime = questionTimers[q.id] || 0;

      totalSolveTime += qTime;

      // Category tracking
      if (!categoryTotals[q.category]) {
        categoryTotals[q.category] = { correct: 0, total: 0 };
      }
      categoryTotals[q.category].total += 1;

      // Difficulty tracking
      difficultyTotals[q.difficulty].total += 1;

      if (isSkipped) {
        skippedCount++;
      } else if (isCorrect) {
        overallCorrect++;
        categoryTotals[q.category].correct += 1;
        difficultyTotals[q.difficulty].correct += 1;
      }

      // Cognitive Domain grouping
      if (q.category.includes('Fluency') || q.category.includes('Mental')) {
        fluencyTotal++;
        if (isCorrect) fluencyCorrect++;
      }
      if (q.category.includes('Problem Solving') || q.category.includes('Reasoning')) {
        reasoningTotal++;
        if (isCorrect) reasoningCorrect++;
      }
      if (q.category.includes('Operations') || q.category.includes('Algebra')) {
        computationalTotal++;
        if (isCorrect) computationalCorrect++;
      }
      if (q.category.includes('Geometry')) {
        geometryTotal++;
        if (isCorrect) geometryCorrect++;
      }
      if (q.category.includes('Fraction') || q.category.includes('Rational')) {
        fractionsTotal++;
        if (isCorrect) fractionsCorrect++;
      }
      if (q.category.includes('Number Sense')) {
        numberSenseTotal++;
        if (isCorrect) numberSenseCorrect++;
      }
    });

    // Percentages
    const overallPercentage = Math.round((overallCorrect / paper.length) * 100);
    const overallScore = `${overallCorrect} / ${paper.length}`;

    // Mastery mapper
    const mapMastery = (pct: number): MasteryLevel => {
      if (pct >= 95) return 'Mastered';
      if (pct >= 85) return 'Proficient';
      if (pct >= 70) return 'Developing';
      if (pct >= 50) return 'Emerging';
      return 'Needs Immediate Intervention';
    };

    // Compile category list
    const categoryScores: DiagnosticReport['categoryScores'] = {};
    Object.entries(categoryTotals).forEach(([category, score]) => {
      const pct = Math.round((score.correct / score.total) * 100);
      categoryScores[category] = {
        correct: score.correct,
        total: score.total,
        percentage: pct,
        mastery: mapMastery(pct)
      };
    });

    const easyAccuracy = Math.round((difficultyTotals.Easy.correct / (difficultyTotals.Easy.total || 1)) * 100);
    const medAccuracy = Math.round((difficultyTotals.Medium.correct / (difficultyTotals.Medium.total || 1)) * 100);
    const hardAccuracy = Math.round((difficultyTotals.Hard.correct / (difficultyTotals.Hard.total || 1)) * 100);

    // Speed analysis
    let fastestCategory = 'N/A';
    let slowestCategory = 'N/A';
    let minTime = Infinity;
    let maxTime = -1;

    Object.keys(categoryTotals).forEach((category) => {
      const catQuestions = paper.filter(q => q.category === category);
      const catTime = catQuestions.reduce((acc, q) => acc + (questionTimers[q.id] || 0), 0);
      const avgCatTime = catTime / catQuestions.length;

      if (avgCatTime < minTime) {
        minTime = avgCatTime;
        fastestCategory = category;
      }
      if (avgCatTime > maxTime) {
        maxTime = avgCatTime;
        slowestCategory = category;
      }
    });

    // Readiness score: weighted sum representing high order tiers
    const readinessScore = Math.round(
      ((difficultyTotals.Easy.correct * 1 + difficultyTotals.Medium.correct * 1.5 + difficultyTotals.Hard.correct * 2) /
      ((difficultyTotals.Easy.total * 1 + difficultyTotals.Medium.total * 1.5 + difficultyTotals.Hard.total * 2) || 1)) *
      100
    );

    // Gaps and Strengths detection
    const learningGaps: string[] = [];
    const strongestSkills: string[] = [];
    const weakestSkills: string[] = [];

    Object.entries(categoryScores).forEach(([cat, s]) => {
      if (s.percentage >= 85) {
        strongestSkills.push(`Exhibits mastery in ${cat}`);
      } else if (s.percentage < 50) {
        weakestSkills.push(`Lacks operational foundation in ${cat}`);
        learningGaps.push(`Systemic learning gaps detected in ${cat}`);
      } else if (s.percentage < 70) {
        learningGaps.push(`Requires reinforcement in ${cat}`);
      }
    });

    // Starting Grade logic
    let recommendedStartingGrade: Grade = student?.grade || 1;
    if (overallPercentage < 50 && recommendedStartingGrade > 1) {
      recommendedStartingGrade = (recommendedStartingGrade - 1) as Grade;
    } else if (overallPercentage >= 95 && recommendedStartingGrade < 9) {
      recommendedStartingGrade = (recommendedStartingGrade + 1) as Grade;
    }

    // Recommended Lessons mapping
    const recommendedLessons: string[] = [];
    let recommendedStartingUnit = 'Unit 1: Foundational Equations';

    if (overallPercentage < 50) {
      recommendedStartingUnit = 'Unit 1: Core Mathematical Mechanics';
      recommendedLessons.push('Integers & Place Value Blocks', 'Visual Basic Operations');
    } else if (overallPercentage < 75) {
      recommendedStartingUnit = 'Unit 2: Transitional Algebraic Concepts';
      recommendedLessons.push('Equivalent Fraction Models', 'Linear Representation');
    } else {
      recommendedStartingUnit = 'Unit 3: Higher Complexity Math Modelling';
      recommendedLessons.push('Linear Equation Builders', 'Advanced Coordinate Geometry');
    }

    // Average solve time per question
    const averageTimePerQuestion = Math.round(totalSolveTime / (paper.length || 1));

    // Guess Probability: rapid correct MCQ answers
    const rapidMcqCorrect = paper.filter(q => q.type === 'MCQ' && answers[q.id] && evaluateResponse(q, answers[q.id]) && (questionTimers[q.id] || 0) < 10).length;
    const guessProbability = Math.min(1, rapidMcqCorrect / 20);

    return {
      overallPercentage,
      overallScore,
      categoryScores,
      accuracy: overallPercentage,
      averageTimePerQuestion,
      totalTime: totalSolveTime,
      fastestCategory,
      slowestCategory,
      difficultyAccuracy: {
        Easy: easyAccuracy,
        Medium: medAccuracy,
        Hard: hardAccuracy
      },
      skippedCount,
      guessProbability,
      masteryLevel: mapMastery(overallPercentage),
      learningGaps,
      strongestSkills,
      weakestSkills,
      recommendedStartingGrade,
      recommendedStartingUnit,
      recommendedLessons,
      readinessScore,
      confidenceIndex: 85, // estimated baseline index
      learningVelocity: overallPercentage >= 85 && averageTimePerQuestion < 20 ? 'Accelerated' : overallPercentage < 50 ? 'Needs Support' : 'Steady',
      
      // Domain mappings
      fluencyScore: fluencyTotal ? Math.round((fluencyCorrect / fluencyTotal) * 100) : 0,
      reasoningScore: reasoningTotal ? Math.round((reasoningCorrect / reasoningTotal) * 100) : 0,
      computationalScore: computationalTotal ? Math.round((computationalCorrect / computationalTotal) * 100) : 0,
      geometryScore: geometryTotal ? Math.round((geometryCorrect / geometryTotal) * 100) : 0,
      fractionsScore: fractionsTotal ? Math.round((fractionsCorrect / fractionsTotal) * 100) : 0,
      numberSenseScore: numberSenseTotal ? Math.round((numberSenseCorrect / numberSenseTotal) * 100) : 0
    };
  };

  // --- SAVE WEBHOOK ---
  const handleSaveWebhook = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem(WEBHOOK_URL_KEY, url);
    setSyncStatus('offline');
    setSyncMessage('Google Sheets synchronization endpoint saved.');
  };

  const report = isCompleted ? calculateDiagnosticReport() : null;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = paper.length - answeredCount;

  const leftPanelContent = () => {
    // Top Logo
    const headerLogo = (
      <div className="flex items-center gap-3.5 select-none">
        {/* Beautiful high-fidelity 3D logo icon */}
        <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hexagonal frame faces in 3D Burnt Orange and Vibrant Orange */}
          <path d="M 50 10 L 10 33 L 10 77 L 50 100 L 50 86 L 22 71 L 22 39 L 50 24 Z" fill="#D05C15" />
          <path d="M 50 10 L 74 24 L 66 31 L 50 24 Z" fill="#F7941D" />
          
          {/* 3D isometric letter M in teal and orange tones */}
          {/* Left slant top */}
          <polygon points="34,54 48,38 52,42 38,58" fill="#02ADB5" />
          {/* Left slant front */}
          <polygon points="34,54 48,38 48,48 34,64" fill="#008694" />
          {/* Inner left fold */}
          <polygon points="48,38 62,54 62,64 48,48" fill="#054D50" />
          {/* Inner right fold */}
          <polygon points="62,54 76,38 76,48 62,64" fill="#008694" />
          {/* Right slant top */}
          <polygon points="62,54 76,38 80,42 66,58" fill="#02ADB5" />
          {/* Rightmost column front */}
          <polygon points="76,38 92,52 92,76 76,60" fill="#F7941D" />
          {/* Rightmost column side */}
          <polygon points="92,52 92,76 84,82 84,58" fill="#D05C15" />
        </svg>

        <div className="leading-none flex flex-col justify-center">
          <div className="relative pb-1">
            <span className="text-xl font-extrabold tracking-tight text-white">MyMastery</span>
            <span className="text-xl font-extrabold tracking-tight text-[#FFA07A]">Lab</span>
            {/* Underline bar matching the uploaded logo */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#F7941D] rounded-full" />
          </div>
          <span className="text-[9px] font-extrabold text-[#C3EAED] block uppercase tracking-widest mt-1.5">
            Baseline Engine
          </span>
        </div>
      </div>
    );

    // Bottom Sync status
    const statusBox = (
      <div className="bg-white/10 p-5 rounded-2xl border border-white/15 mt-auto">
        <span className="text-[9px] uppercase tracking-widest font-extrabold block text-[#C3EAED] opacity-75 mb-1.5">Data Integration</span>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-white">
            {scriptUrl ? '✓ Connected' : '⚠ Local Saved Only'}
          </span>
          <span className={`w-2 h-2 rounded-full ${scriptUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        </div>
        {scriptUrl && (
          <p className="text-[10px] text-[#C3EAED]/80 mt-1.5 truncate" title={scriptUrl}>
            {syncStatus === 'synced' ? '✓ Data synchronized' : syncStatus === 'pending' ? 'Syncing items...' : 'Connected Endpoint'}
          </p>
        )}
      </div>
    );

    if (!student) {
      return (
        <div className="flex flex-col h-full justify-between gap-8">
          <div className="space-y-8">
            {headerLogo}
            <div className="space-y-5">
              <h1 className="font-sans text-3xl font-extrabold leading-tight text-white">
                Diagnostic<br/>Baseline<br/>Engine
              </h1>
              <p className="text-[#C3EAED] text-xs leading-relaxed max-w-xs">
                Grade 1 to Grade 9 adaptive assessment system. Pre-curriculum evaluation mapping cognitive mastery levels and concept gaps.
              </p>
              
              <div className="space-y-3.5 pt-4">
                <div className="flex items-center gap-3 text-xs font-semibold text-white">
                  <div className="w-2 h-2 rounded-full bg-[#FFA07A]" />
                  <span>Dual Curriculums (US / UK)</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-white">
                  <div className="w-2 h-2 rounded-full bg-[#FFA07A]" />
                  <span>6 Cognitive Math Domains</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-white">
                  <div className="w-2 h-2 rounded-full bg-[#FFA07A]" />
                  <span>Data Synchronization Ready</span>
                </div>
              </div>
            </div>
          </div>
          {statusBox}
        </div>
      );
    }

    if (student && !isCompleted) {
      // Find answered count
      const answeredCount = Object.keys(answers).length;
      const progressPct = paper.length > 0 ? Math.round((answeredCount / paper.length) * 100) : 0;
      
      return (
        <div className="flex flex-col h-full justify-between gap-8">
          <div className="space-y-8">
            {headerLogo}
            <div className="space-y-5">
              <span className="text-[9px] bg-white/10 text-[#C3EAED] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border border-white/10">
                Assessment Active
              </span>
              <div>
                <h1 className="font-sans text-xl font-black leading-tight text-white truncate max-w-[220px]">{student.name}</h1>
                <p className="text-[#C3EAED] text-xs mt-1 font-medium">
                  Grade {student.grade} • {student.curriculum === 'US' ? 'US Curriculum' : 'UK & Europe'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-bold text-[#C3EAED]">
                  <span>Progress</span>
                  <span>{answeredCount} / {paper.length} Items</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FFA07A] h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              <div className="space-y-3.5 pt-4 text-xs font-medium text-[#C3EAED]">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFA07A]" />
                  <span>ID: <code className="text-white font-mono">{student.assessmentId}</code></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFA07A]" />
                  <span>Active Speed Diagnostic</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleResetSession}
              className="w-full bg-white/10 hover:bg-white/25 hover:text-white text-[#C3EAED] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restart Session
            </button>
            {statusBox}
          </div>
        </div>
      );
    }

    // Is Completed
    return (
      <div className="flex flex-col h-full justify-between gap-8">
        <div className="space-y-8">
          {headerLogo}
          <div className="space-y-5">
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
              Completed
            </span>
            <div>
              <h1 className="font-sans text-xl font-black leading-tight text-white truncate max-w-[220px]">{student.name}</h1>
              <p className="text-[#C3EAED] text-xs mt-1 font-medium">
                Grade {student.grade} • {student.curriculum === 'US' ? 'US Curriculum' : 'UK & Europe'}
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-[#C3EAED] font-semibold">Diagnostic Score:</span>
                <span className="text-xs font-bold text-white">{report?.overallScore}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs text-[#C3EAED] font-semibold">Percentage Accuracy:</span>
                <span className="text-xs font-bold text-white">{report?.overallPercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#C3EAED] font-semibold">Recommended Grade:</span>
                <span className="text-xs font-extrabold text-[#FFA07A]">Grade {report?.recommendedStartingGrade}</span>
              </div>
            </div>

            <div className="text-xs text-[#C3EAED] font-medium leading-relaxed">
              Diagnostic report is generated and structured into Parent & Teacher pathways.
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleResetSession}
            className="w-full bg-white/10 hover:bg-white/20 hover:text-white text-[#C3EAED] font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Start New Session
          </button>
          {statusBox}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#C3EAED] flex items-center justify-center font-sans p-4 md:p-8 antialiased">
      <div className="w-full max-w-7xl bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden border-8 border-white min-h-[760px]">
        
        {/* LEFT PANEL SIDEBAR */}
        <aside className="w-full md:w-80 bg-[#0B6162] p-6 md:p-8 flex flex-col justify-between text-white shrink-0 border-r border-slate-100">
          {leftPanelContent()}
        </aside>

        {/* RIGHT PANEL CONTENT PLATFORM */}
        <main className="flex-1 bg-[#F7FAFA] flex flex-col overflow-auto p-6 md:p-10 justify-between">
          
          <div className="w-full">
            {/* PAGE 1: STUDENT DETAILS ONBOARDING */}
            {!student && (
              <div id="onboarding-form-card" className="w-full max-w-3xl mx-auto flex flex-col gap-6">
                <div className="space-y-2 mb-4">
                  <h2 className="font-sans text-2xl font-black text-[#0B6162]">Student Onboarding</h2>
                  <p className="text-sm text-slate-500">Please enter the learner's details to initialize the diagnostic baseline engine.</p>
                </div>

                <form onSubmit={handleStartOnboarding} className="space-y-6 flex-1">
                  {formError && (
                    <div id="onboarding-error-box" className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B6162] uppercase tracking-wider">
                        Student Full Name *
                      </label>
                      <input
                        id="onboarding-student-name"
                        type="text"
                        placeholder="e.g. Charlie Brown"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#D05C15] outline-none text-sm transition-all bg-white hover:border-slate-300"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-[#0B6162] uppercase tracking-wider">
                        Parent / Teacher Email *
                      </label>
                      <input
                        id="onboarding-student-email"
                        type="email"
                        placeholder="e.g. parent@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#D05C15] outline-none text-sm transition-all bg-white hover:border-slate-300"
                      />
                    </div>

                    {/* Grade Dropdown */}
                    <div className="flex flex-col col-span-1 md:col-span-2 gap-1.5">
                      <label className="text-xs font-bold text-[#0B6162] uppercase tracking-wider">
                        Select Grade Level *
                      </label>
                      <select
                        id="onboarding-student-grade"
                        value={formGrade}
                        onChange={(e) => setFormGrade(Number(e.target.value) as Grade)}
                        className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 focus:border-[#D05C15] outline-none text-sm transition-all bg-white cursor-pointer hover:border-slate-300"
                      >
                        <option value="">-- Choose Grade level --</option>
                        {Array.from({ length: 9 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Grade {i + 1} (Ages {i + 6}-{i + 7})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Curriculum Selection Cards */}
                    <div className="col-span-1 md:col-span-2 space-y-3">
                      <label className="text-xs font-bold text-[#0B6162] uppercase tracking-wider block">
                        Select Curriculum Pathway *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Option 1: US */}
                        <label className="cursor-pointer group">
                          <input
                            type="radio"
                            name="pathway"
                            value="US"
                            checked={formCurriculum === 'US'}
                            onChange={() => setFormCurriculum('US')}
                            className="sr-only"
                          />
                          <div className={`p-4 border-2 rounded-2xl bg-white transition-all flex items-center gap-4 hover:border-slate-300 ${
                            formCurriculum === 'US'
                              ? 'border-[#D05C15] bg-[#FFE6D9]/40 ring-2 ring-[#D05C15]/15'
                              : 'border-slate-200'
                          }`}>
                            <div className="text-3xl">🇺🇸</div>
                            <div>
                               <div className="font-bold text-[#D05C15]">US Curriculum</div>
                              <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">CCSS • State Expectations</div>
                            </div>
                          </div>
                        </label>

                        {/* Option 2: UK_EUROPE */}
                        <label className="cursor-pointer group">
                          <input
                            type="radio"
                            name="pathway"
                            value="UK_EUROPE"
                            checked={formCurriculum === 'UK_EUROPE'}
                            onChange={() => setFormCurriculum('UK_EUROPE')}
                            className="sr-only"
                          />
                          <div className={`p-4 border-2 rounded-2xl bg-white transition-all flex items-center gap-4 hover:border-slate-300 ${
                            formCurriculum === 'UK_EUROPE'
                              ? 'border-[#D05C15] bg-[#FFE6D9]/40 ring-2 ring-[#D05C15]/15'
                              : 'border-slate-200'
                          }`}>
                            <div className="text-3xl">🇬🇧</div>
                            <div>
                               <div className="font-bold text-[#D05C15]">UK & Europe</div>
                              <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">England Key Stages • IB • Edexcel</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Bottom buttons / metadata alignment */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                    <div className="flex gap-3">
                      <div className="px-3.5 py-1.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engine Active</span>
                      </div>
                      <div className="px-3.5 py-1.5 bg-white rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-[#D05C15] rounded-full" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adaptive v4.2</span>
                      </div>
                    </div>

                    <button
                      id="btn-onboarding-start"
                      type="submit"
                      className="px-8 py-3.5 bg-gradient-to-r from-[#D05C15] to-[#F7941D] hover:from-[#F7941D] hover:to-[#FFA07A] text-white font-sans font-bold text-sm rounded-2xl shadow-lg shadow-[#D05C15]/10 transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.01] active:scale-100"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Initialize Assessment</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PAGE 2: ACTIVE DIAGNOSTIC TEST PANEL */}
            {student && !isCompleted && paper.length > 0 && (
              <div id="active-assessment-container" className="w-full flex flex-col gap-6">
                
                {/* Header / Meta */}
                <div className="border-b border-slate-100 pb-5 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-extrabold text-[#0B6162] uppercase tracking-widest bg-[#C3EAED]/50 px-2.5 py-1 rounded-md">
                      Active Diagnostic
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-2 font-sans">
                      {paper[activeIdx]?.category}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Subconcept: {paper[activeIdx]?.subcategory} • Standard: {paper[activeIdx]?.standardCode}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 items-center shrink-0">
                    <span className="text-xs font-bold text-[#0B6162] uppercase tracking-widest bg-[#C3EAED]/30 border border-[#0B6162]/10 px-3 py-1.5 rounded-xl">
                      Question {activeIdx + 1} of {paper.length}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-gradient-to-r from-[#D05C15] to-[#F7941D] h-full transition-all duration-300"
                    style={{ width: `${((activeIdx + 1) / paper.length) * 100}%` }}
                  />
                </div>

                {/* Question Display */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <QuestionRenderer
                      question={paper[activeIdx]}
                      currentAnswer={answers[paper[activeIdx].id]}
                      onChangeAnswer={(val) => setAnswers((prev) => ({ ...prev, [paper[activeIdx].id]: val }))}
                      showHint={showHint}
                      onToggleHint={() => setShowHint(!showHint)}
                    />

                    {/* Confidence Metacognition Check */}
                    <div id="confidence-panel" className="bg-white border border-slate-200/60 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-[#D05C15] uppercase tracking-wider block">Metacognitive Self-Check</span>
                        <span className="text-[11px] text-slate-500">Rate your current confidence in your diagnostic response</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {['Low', 'Medium', 'High'].map((lvl) => {
                          const isSel = confidenceRatings[paper[activeIdx].id] === lvl;
                          return (
                            <button
                              key={lvl}
                              id={`btn-confidence-${lvl}`}
                              type="button"
                              onClick={() => setConfidenceRatings(prev => ({ ...prev, [paper[activeIdx].id]: lvl as any }))}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                isSel
                                  ? 'bg-[#D05C15] text-white border-[#D05C15] shadow-md shadow-[#D05C15]/15 scale-105'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Actions Footer */}
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-8">
                    <button
                      id="btn-prev-question"
                      type="button"
                      onClick={handlePrev}
                      disabled={activeIdx === 0}
                      className={`inline-flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl transition-all text-xs cursor-pointer ${
                        activeIdx === 0
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50 border border-slate-100'
                          : 'bg-white text-[#0B6162] border border-slate-200 hover:border-[#0B6162]/40 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    {activeIdx < paper.length - 1 ? (
                      <button
                        id="btn-next-question"
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 bg-[#D05C15] hover:bg-[#F7941D] text-white font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#D05C15]/10 text-xs cursor-pointer"
                      >
                        Next <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        id="btn-submit-assessment"
                        type="button"
                        onClick={handleSubmitAssessment}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D05C15] to-[#F7941D] hover:from-[#F7941D] hover:to-[#FFA07A] text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#D05C15]/15 text-xs hover:scale-[1.02] active:scale-100 cursor-pointer animate-pulse"
                      >
                        Finish Diagnostic Assessment
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* PAGE 3: COMPREHENSIVE DIAGNOSTIC DASHBOARDS */}
            {student && isCompleted && report && (
              <div id="diagnostic-dashboard-root" className="flex flex-col gap-6">
                
                {/* VIEW SELECTOR BAR */}
                <div className="bg-slate-100/80 border border-slate-200/60 rounded-2xl p-2 flex flex-col md:flex-row gap-1">
                  <button
                    id="btn-view-parent"
                    onClick={() => setActiveTab('parent')}
                    className={`flex-1 py-2.5 px-4 text-center font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'parent'
                        ? 'bg-[#D05C15] text-white shadow-md font-extrabold'
                        : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-200/60'
                    }`}
                  >
                    <Award className="w-4 h-4" /> Parent Diagnostic Report
                  </button>
                  <button
                    id="btn-view-teacher"
                    onClick={() => setActiveTab('teacher')}
                    className={`flex-1 py-2.5 px-4 text-center font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'teacher'
                        ? 'bg-[#D05C15] text-white shadow-md font-extrabold'
                        : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-200/60'
                    }`}
                  >
                    <Layers className="w-4 h-4" /> Teacher Portal
                  </button>
                </div>

                {/* TAB PANELS */}
                <div className="transition-all duration-300">
                  {activeTab === 'parent' && (
                    <div id="panel-parent-view" className="animate-fadeIn">
                      <ParentDashboard student={student} responses={paper.map(q => ({
                        questionId: q.id,
                        category: q.category,
                        subcategory: q.subcategory,
                        difficulty: q.difficulty,
                        type: q.type,
                        questionText: q.text,
                        studentAnswer: answers[q.id],
                        correctAnswer: q.correctAnswer,
                        isCorrect: evaluateResponse(q, answers[q.id]),
                        timeTaken: questionTimers[q.id] || 0,
                        attempts: 1,
                        skipped: answers[q.id] === undefined,
                        confidence: confidenceRatings[q.id]
                      }))} report={report} />
                    </div>
                  )}

                  {activeTab === 'teacher' && (
                    <div id="panel-teacher-view" className="animate-fadeIn">
                      <TeacherDashboard
                        student={student}
                        responses={paper.map(q => ({
                          questionId: q.id,
                          category: q.category,
                          subcategory: q.subcategory,
                          difficulty: q.difficulty,
                          type: q.type,
                          questionText: q.text,
                          studentAnswer: answers[q.id],
                          correctAnswer: q.correctAnswer,
                          isCorrect: evaluateResponse(q, answers[q.id]),
                          timeTaken: questionTimers[q.id] || 0,
                          attempts: 1,
                          skipped: answers[q.id] === undefined,
                          confidence: confidenceRatings[q.id]
                        }))}
                        report={report}
                        rawQuestions={paper}
                        syncStatus={syncStatus}
                        syncMessage={syncMessage}
                      />
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* INTEGRATED SYSTEM FOOTER */}
          <footer className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
            <span>MyMasteryLab © 2026</span>
            <div className="flex gap-4">
              <span>Grades 1-9 Baseline System v4.2</span>
              <span>•</span>
              <span>Enterprise Diagnostic Engine</span>
            </div>
          </footer>

        </main>

      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Submit Assessment?</h3>
                <p className="text-xs text-slate-500">Please review your progress before finishing.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-800">{paper.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Answered Questions:</span>
                <span className="font-bold text-slate-800">{answeredCount}</span>
              </div>
              {unansweredCount > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-semibold flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You have {unansweredCount} unanswered questions!</span>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-semibold flex items-center gap-2 mt-1">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>All questions answered! Great job!</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                id="btn-confirm-submit-assessment"
                onClick={executeSubmitAssessment}
                className="px-5 py-2.5 bg-[#D05C15] hover:bg-[#F7941D] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D05C15]/10 cursor-pointer"
              >
                Submit and Show Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reset Session?</h3>
                <p className="text-xs text-slate-500">Restarting will discard all progress.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to reset this baseline assessment? All your current questions, answered responses, and timer counts will be cleared. This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Keep Progress
              </button>
              <button
                type="button"
                id="btn-confirm-reset-assessment"
                onClick={executeResetSession}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Reset and Start New
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

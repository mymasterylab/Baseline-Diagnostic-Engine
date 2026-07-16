import React, { useState, useEffect } from 'react';
import { Grade, CurriculumType, StudentInfo, Question, Difficulty, QuestionType, MasteryLevel } from '../types';
import { ArrowUpRight, Clipboard, FileText, CheckCircle2, AlertCircle, RefreshCw, Upload, Sparkles, BookOpen, User } from 'lucide-react';

interface ReportRegeneratorProps {
  scriptUrl: string;
  onRegenerate: (
    student: StudentInfo,
    paper: Question[],
    answers: Record<string, any>,
    confidenceRatings: Record<string, 'Low' | 'Medium' | 'High'>,
    questionTimers: Record<string, number>
  ) => void;
}

export default function ReportRegenerator({ scriptUrl, onRegenerate }: ReportRegeneratorProps) {
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<Grade | ''>('');
  
  // Local history of completed assessments
  const [localHistory, setLocalHistory] = useState<any[]>([]);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'success' | 'not_found'>('idle');
  const [foundRecord, setFoundRecord] = useState<any | null>(null);

  // Manual Paste/Upload State
  const [pasteData, setPasteData] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedDataPreview, setParsedDataPreview] = useState<{
    student: StudentInfo;
    questionsCount: number;
    scoreText: string;
  } | null>(null);

  const [reconstructedState, setReconstructedState] = useState<{
    student: StudentInfo;
    paper: Question[];
    answers: Record<string, any>;
    confidenceRatings: Record<string, 'Low' | 'Medium' | 'High'>;
    questionTimers: Record<string, number>;
  } | null>(null);

  // Load completed history from localStorage
  useEffect(() => {
    try {
      const historyJson = localStorage.getItem('mymasterylab_completed_history');
      if (historyJson) {
        setLocalHistory(JSON.parse(historyJson));
      }
    } catch (e) {
      console.error('Failed to load completed assessment history', e);
    }
  }, []);

  // Handle Search in local history or via webhook
  const handleSearchAndLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchStatus('idle');
    setFoundRecord(null);
    setParseError('');

    if (!name.trim()) {
      setParseError('Please enter the student name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setParseError('Please enter a valid email address.');
      return;
    }
    if (!grade) {
      setParseError('Please select a grade level.');
      return;
    }

    // 1. Search in Local History
    const match = localHistory.find(
      (item) =>
        item.student?.name?.toLowerCase().trim() === name.toLowerCase().trim() &&
        item.student?.email?.toLowerCase().trim() === email.toLowerCase().trim() &&
        Number(item.student?.grade) === Number(grade)
    );

    if (match) {
      setFoundRecord(match);
      setSearchStatus('success');
      return;
    }

    // 2. Fallback: Search webhook if any GET API is available
    if (scriptUrl) {
      setSearchStatus('idle');
      try {
        const queryUrl = `${scriptUrl}?action=getStudentReport&email=${encodeURIComponent(
          email.trim()
        )}&name=${encodeURIComponent(name.trim())}&grade=${grade}`;
        
        // Timeout protection for fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(queryUrl, { signal: controller.signal, method: 'GET' });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result && result.success && result.student && result.paper) {
            setFoundRecord(result);
            setSearchStatus('success');
            return;
          }
        }
      } catch (err) {
        console.log('GET search on Web App is not configured or blocked by CORS (standard Apps Script behavior). Search fell back to manual upload.');
      }
    }

    setSearchStatus('not_found');
  };

  // Quick launch from search record
  const launchFoundRecord = () => {
    if (foundRecord) {
      onRegenerate(
        foundRecord.student,
        foundRecord.paper,
        foundRecord.answers,
        foundRecord.confidenceRatings || {},
        foundRecord.questionTimers || {}
      );
    }
  };

  // CSV/TSV Parser Helper
  const parseCSVLine = (line: string, delimiter: string = ','): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // Main Parsing Process
  const handleParseSheetData = (rawText: string) => {
    setParseError('');
    setParsedDataPreview(null);
    setReconstructedState(null);

    if (!rawText.trim()) {
      return;
    }

    setIsParsing(true);

    try {
      // Split into lines
      const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('Insufficient rows found. Make sure to copy the header row and at least one student attempt row.');
      }

      // Auto-detect delimiter
      const firstLine = lines[0];
      const delimiter = firstLine.includes('\t') ? '\t' : ',';

      // Parse headers
      const headers = parseCSVLine(firstLine, delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
      
      // Map column headers to their indices
      const findIndex = (aliases: string[]) => {
        return headers.findIndex(h => 
          aliases.some(alias => h.toLowerCase() === alias.toLowerCase())
        );
      };

      const nameIdx = findIndex(['student name', 'studentName', 'name', 'Student']);
      const emailIdx = findIndex(['email', 'Email Address']);
      const gradeIdx = findIndex(['grade', 'Grade Level']);
      const currIdx = findIndex(['curriculum', 'Curriculum', 'Curriculum Type']);
      const assessmentIdIdx = findIndex(['assessment id', 'assessmentId', 'id']);
      const timestampIdx = findIndex(['timestamp', 'date', 'Timestamp']);

      const qIdIdx = findIndex(['question id', 'questionId', 'Question ID']);
      const categoryIdx = findIndex(['category', 'Category']);
      const subcategoryIdx = findIndex(['subcategory', 'Subcategory']);
      const standardIdx = findIndex(['standard code', 'standardCode', 'standard', 'Standard', 'Standard Code']);
      const difficultyIdx = findIndex(['difficulty', 'Difficulty']);
      const qTypeIdx = findIndex(['question type', 'questionType', 'Question Type']);
      const qTextIdx = findIndex(['question text', 'question', 'Question Text', 'Question']);
      const hintIdx = findIndex(['hint', 'Hint']);
      const explanationIdx = findIndex(['explanation', 'Explanation']);
      const estTimeIdx = findIndex(['estimated time (s)', 'estimatedTime', 'Estimated Time (s)']);
      const bloomIdx = findIndex(['bloom level', 'bloomLevel', 'Bloom Level']);
      const tagsIdx = findIndex(['tags', 'Tags']);
      const skillIdIdx = findIndex(['skill id', 'skillId', 'Skill ID']);
      const conceptIdIdx = findIndex(['concept id', 'conceptId', 'Concept ID']);
      const lessonIdx = findIndex(['lesson', 'Lesson']);
      const topicIdx = findIndex(['topic', 'Topic']);
      const objectiveIdx = findIndex(['learning objective', 'learningObjective', 'Learning Objective']);
      const solutionIdx = findIndex(['solution', 'Solution']);
      const stepExplIdx = findIndex(['step-by-step explanation', 'stepByStepExplanation', 'Step-by-Step Explanation']);
      const misconceptionIdx = findIndex(['common misconception', 'commonMisconception', 'Common Misconception']);
      const skillsTestedIdx = findIndex(['skills tested', 'skillsTested', 'Skills Tested']);
      const prereqsIdx = findIndex(['prerequisite concepts', 'prerequisiteConcepts', 'Prerequisite Concepts']);
      const optionsIdx = findIndex(['options', 'Options']);

      const correctAnswerIdx = findIndex(['correct answer', 'correctAnswer', 'Correct Answer']);
      const studentResponseIdx = findIndex(['student response', 'studentAnswer', 'Student Response']);
      const timeTakenIdx = findIndex(['time taken', 'time taken (s)', 'timeTaken', 'Time Taken', 'Time Taken (s)']);
      const confidenceIdx = findIndex(['confidence rating', 'confidence', 'Confidence Rating']);

      // Overall Score Header
      const scoreIdx = findIndex(['overall score', 'overallScore', 'Overall Score']);
      const pctIdx = findIndex(['overall percentage', 'percentage', 'Overall Percentage', 'Percentage']);

      if (nameIdx === -1 || emailIdx === -1 || qIdIdx === -1) {
        throw new Error('Required headers not found. Ensure your data has "Student Name", "Email", and "Question ID" columns.');
      }

      // Parse data rows
      const questionRows: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const rowValues = parseCSVLine(lines[i], delimiter).map(val => val.trim().replace(/^["']|["']$/g, ''));
        if (rowValues.length < headers.length - 2 && rowValues.join('').trim().length === 0) {
          continue; // skip empty rows
        }
        questionRows.push(rowValues);
      }

      if (questionRows.length === 0) {
        throw new Error('No question attempt records found in the data.');
      }

      // Reconstruct student info from the first row
      const firstRow = questionRows[0];
      const parsedName = firstRow[nameIdx] || 'Charlie Brown';
      const parsedEmail = firstRow[emailIdx] || 'student@school.com';
      const rawGrade = firstRow[gradeIdx] || 'Grade 4';
      const parsedGradeNum = Number(rawGrade.replace(/[^0-9]/g, '')) as Grade;
      const parsedGrade: Grade = (parsedGradeNum >= 1 && parsedGradeNum <= 9 ? parsedGradeNum : 4) as Grade;
      const parsedCurriculum: CurriculumType = firstRow[currIdx]?.toUpperCase().includes('UK') ? 'UK_EUROPE' : 'US';
      const parsedId = firstRow[assessmentIdIdx] || `MML-REGEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const parsedDate = firstRow[timestampIdx] || new Date().toISOString();

      const student: StudentInfo = {
        name: parsedName,
        email: parsedEmail,
        grade: parsedGrade,
        curriculum: parsedCurriculum,
        assessmentId: parsedId,
        date: parsedDate
      };

      // Assemble papers and responses
      const paper: Question[] = [];
      const answers: Record<string, any> = {};
      const confidenceRatings: Record<string, 'Low' | 'Medium' | 'High'> = {};
      const questionTimers: Record<string, number> = {};

      let overallScoreStr = '';
      let correctCount = 0;

      questionRows.forEach((row, index) => {
        const qId = row[qIdIdx];
        if (!qId) return; // skip row if no Question ID

        // Parse list-based properties
        const parseList = (val: string) => {
          if (!val) return [];
          return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
        };

        const parseOptions = (val: string) => {
          if (!val) return undefined;
          return val.split('|').map(s => s.trim()).filter(s => s.length > 0);
        };

        // Determine correct answer format (if array/JSON)
        let rawCorrect: any = row[correctAnswerIdx] || '';
        let finalCorrect: any = rawCorrect;
        if (rawCorrect.includes(',')) {
          finalCorrect = rawCorrect.split(',').map((s: string) => s.trim());
        }

        // Determine student response
        let rawStudentResp: any = row[studentResponseIdx] || '';
        let finalStudentResp: any = rawStudentResp;
        if (rawStudentResp === 'Skipped/No Answer' || rawStudentResp === 'Skipped' || rawStudentResp === '') {
          finalStudentResp = undefined;
        } else if (rawStudentResp.includes(',')) {
          finalStudentResp = rawStudentResp.split(',').map((s: string) => s.trim());
        }

        // Check if correct/wrong for local tally
        const isCorrect = row[findIndex(['correct/wrong', 'correctOrWrong', 'Correct/Wrong'])]?.toLowerCase() === 'correct';
        if (isCorrect) {
          correctCount++;
        }

        // Build question object
        const question: Question = {
          id: qId,
          grade: student.grade,
          curriculum: student.curriculum,
          category: row[categoryIdx] || 'Foundational Skills',
          subcategory: row[subcategoryIdx] || 'Operations',
          standardCode: row[standardIdx] || 'CCSS.MATH',
          difficulty: (row[difficultyIdx] || 'Medium') as Difficulty,
          type: (row[qTypeIdx] || 'MCQ') as QuestionType,
          text: row[qTextIdx] || `Question regarding ${row[subcategoryIdx]}`,
          hint: hintIdx !== -1 ? row[hintIdx] || '' : '',
          explanation: explanationIdx !== -1 ? row[explanationIdx] || '' : '',
          estimatedTime: estTimeIdx !== -1 ? Number(row[estTimeIdx]) || 30 : 30,
          bloomLevel: (bloomIdx !== -1 ? row[bloomIdx] || 'Applying' : 'Applying') as any,
          tags: tagsIdx !== -1 ? parseList(row[tagsIdx]) : [],
          skillId: skillIdIdx !== -1 ? row[skillIdIdx] || '' : '',
          conceptId: conceptIdIdx !== -1 ? row[conceptIdIdx] || '' : '',
          lesson: lessonIdx !== -1 ? row[lessonIdx] || '' : '',
          topic: topicIdx !== -1 ? row[topicIdx] || '' : '',
          learningObjective: objectiveIdx !== -1 ? row[objectiveIdx] || '' : '',
          solution: solutionIdx !== -1 ? row[solutionIdx] || '' : '',
          stepByStepExplanation: stepExplIdx !== -1 ? row[stepExplIdx] || '' : '',
          commonMisconception: misconceptionIdx !== -1 ? row[misconceptionIdx] || '' : '',
          skillsTested: skillsTestedIdx !== -1 ? parseList(row[skillsTestedIdx]) : [],
          prerequisiteConcepts: prereqsIdx !== -1 ? parseList(row[prereqsIdx]) : [],
          options: optionsIdx !== -1 ? parseOptions(row[optionsIdx]) : undefined,
          correctAnswer: finalCorrect
        };

        paper.push(question);

        if (finalStudentResp !== undefined) {
          answers[qId] = finalStudentResp;
        }

        confidenceRatings[qId] = (row[confidenceIdx] || 'Medium') as 'Low' | 'Medium' | 'High';
        questionTimers[qId] = Number(row[timeTakenIdx]) || 12;
      });

      const pctStr = scoreIdx !== -1 && firstRow[pctIdx] ? `${firstRow[pctIdx]}%` : `${Math.round((correctCount / paper.length) * 100)}%`;
      overallScoreStr = scoreIdx !== -1 && firstRow[scoreIdx] ? firstRow[scoreIdx] : `${correctCount} / ${paper.length}`;

      setReconstructedState({
        student,
        paper,
        answers,
        confidenceRatings,
        questionTimers
      });

      setParsedDataPreview({
        student,
        questionsCount: paper.length,
        scoreText: `${overallScoreStr} (${pctStr})`
      });

    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse sheet data. Check formatting and headers.');
    } finally {
      setIsParsing(false);
    }
  };

  // Launch the fully parsed/reconstructed assessment report!
  const launchReconstructedReport = () => {
    if (reconstructedState) {
      onRegenerate(
        reconstructedState.student,
        reconstructedState.paper,
        reconstructedState.answers,
        reconstructedState.confidenceRatings,
        reconstructedState.questionTimers
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setPasteData(text);
        handleParseSheetData(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="report-regenerator-container" className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Top Header info */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="p-3 bg-[#C3EAED] text-[#0B6162] rounded-2xl">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-sans text-2xl font-black text-[#0B6162]">Regenerate Diagnostics Report</h2>
          <p className="text-xs text-slate-500">Reconstruct past learner scores instantly from spreadsheet details or local history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: LOCAL HISTORY & BACKEND QUERY */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#D05C15]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B6162]">Find Local History Record</h3>
            </div>
            
            <form onSubmit={handleSearchAndLoad} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">STUDENT FULL NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Charlie Brown"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#D05C15] outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">PARENT / TEACHER EMAIL</label>
                <input
                  type="email"
                  placeholder="e.g. parent@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#D05C15] outline-none text-xs bg-slate-50/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500">GRADE LEVEL</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value) as Grade)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#D05C15] outline-none text-xs bg-slate-50/50 cursor-pointer"
                >
                  <option value="">-- Choose Grade --</option>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0B6162] hover:bg-[#074748] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Search Records</span>
              </button>
            </form>

            {/* SEARCH OUTCOME */}
            <div className="pt-4 border-t border-slate-100">
              {searchStatus === 'success' && foundRecord && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-emerald-950 block">Record Found!</span>
                      <span className="text-[10px] text-emerald-700/80 block">Completed on: {new Date(foundRecord.student.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-white/70 p-2.5 rounded-xl border border-emerald-500/10 space-y-1">
                    <div><strong>Score:</strong> {foundRecord.report?.overallScore || 'Calculated'} ({foundRecord.report?.overallPercentage || '0'}%)</div>
                    <div><strong>Curriculum:</strong> {foundRecord.student.curriculum === 'US' ? 'US Curriculum' : 'UK & Europe'}</div>
                    <div><strong>ID:</strong> <code className="font-mono bg-slate-100 px-1 rounded">{foundRecord.student.assessmentId}</code></div>
                  </div>
                  <button
                    onClick={launchFoundRecord}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wide shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Load & Regenerate Report</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {searchStatus === 'not_found' && (
                <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold text-amber-950 block">No local session matching</span>
                    <span className="text-[10px] text-amber-700/80 leading-relaxed block">
                      We couldn't locate this student's assessment history locally. Please upload the exported Google Sheets CSV on the right to regenerate instantly!
                    </span>
                  </div>
                </div>
              )}

              {searchStatus === 'idle' && (
                <div className="text-center py-4 text-slate-400 text-[11px]">
                  Fill out the student metadata to look up active local caches.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECONSTRUCTION FROM SHEET DATA / CSV */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#D05C15]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B6162]">Spreadsheet Data / CSV Reconstruction</h3>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded font-bold uppercase">Dynamic Parser</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If your browser's local cache was cleared, or you are loading results from the central Google Sheet, simply download the sheet as a <strong>.csv file</strong> or copy the student's rows and paste them here. The engine will fully reconstruct the question set, metadata, and responses.
            </p>

            <div className="space-y-4">
              {/* File upload row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-[#D05C15]/40 rounded-2xl p-3.5 flex items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50 hover:bg-[#FFE6D9]/10">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-600">Select Google Sheet CSV File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Text Area */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>PASTE SPREADSHEET ROWS HERE (CSV OR TAB-SEPARATED TSV)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.readText().then(text => {
                        setPasteData(text);
                        handleParseSheetData(text);
                      });
                    }}
                    className="text-[#D05C15] hover:underline flex items-center gap-0.5"
                    type="button"
                  >
                    <Clipboard className="w-3 h-3" /> Paste clipboard
                  </button>
                </div>
                <textarea
                  placeholder="Paste your copied rows here (including the header row containing 'Student Name', 'Email', 'Question ID', etc.)"
                  value={pasteData}
                  onChange={(e) => {
                    setPasteData(e.target.value);
                    handleParseSheetData(e.target.value);
                  }}
                  className="w-full h-36 p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[10px] text-slate-600 focus:border-[#D05C15] outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Parsed Outcomes Block */}
              {parseError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-700 flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {parsedDataPreview && (
                <div className="p-4 bg-[#FFE6D9]/50 border border-[#D05C15]/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D05C15]">
                    <Sparkles className="w-4 h-4" />
                    <span>Diagnostics Structure Generated successfully!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs bg-white/70 p-3 rounded-xl border border-[#D05C15]/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Learner Info</span>
                      <span className="font-bold text-slate-800">{parsedDataPreview.student.name}</span>
                      <span className="text-[10px] text-slate-500 block">{parsedDataPreview.student.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">System Alignments</span>
                      <span className="font-bold text-slate-800">Grade {parsedDataPreview.student.grade} • {parsedDataPreview.student.curriculum === 'US' ? 'US Curriculum' : 'UK & Europe'}</span>
                      <span className="text-[10px] text-[#D05C15] block font-bold mt-0.5">{parsedDataPreview.scoreText} score reconstructed</span>
                    </div>
                  </div>

                  <button
                    onClick={launchReconstructedReport}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#D05C15] to-[#F7941D] hover:from-[#F7941D] hover:to-[#FFA07A] text-white font-sans font-bold text-xs rounded-xl shadow-md shadow-[#D05C15]/10 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Regenerate and Open Diagnostics Report Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

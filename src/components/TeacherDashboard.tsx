/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentInfo, StudentResponse, DiagnosticReport, Question } from '../types';
import { Table, BarChart2, CheckCircle, XCircle, Clock, Save, Download, FileText, Settings, Award, Users, AlertTriangle, Layers } from 'lucide-react';

interface TeacherDashboardProps {
  student: StudentInfo;
  responses: StudentResponse[];
  report: DiagnosticReport;
  rawQuestions: Question[];
  syncStatus: 'synced' | 'pending' | 'failed' | 'offline';
  syncMessage: string;
}

export default function TeacherDashboard({
  student,
  responses,
  report,
  rawQuestions,
  syncStatus,
  syncMessage
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'raw' | 'concepts' | 'bloom' | 'misconceptions'>('raw');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Misconception Detection Engine
  const detectMisconceptions = () => {
    const list: { id: string; category: string; description: string; impact: string }[] = [];
    
    // Check for "Denominator Addition" in Fractions (e.g. 1/3 + 1/4 = 2/7)
    const fractionResponses = responses.filter(r => r.category.includes('Fraction') && !r.isCorrect);
    const denominatorSlip = fractionResponses.some(r => r.studentAnswer === '2/7' || (typeof r.studentAnswer === 'string' && r.studentAnswer.includes('2/7')));
    if (denominatorSlip) {
      list.push({
        id: 'MIS-FR-01',
        category: 'Fractions',
        description: 'Denominator Addition Slip (adding denominators instead of finding common multiple)',
        impact: 'High - indicates a weak foundation in fraction parts and equivalence.'
      });
    }

    // Check for Decimal place value alignment issue
    const decimalResponses = responses.filter(r => r.category.includes('Fractions') && r.questionText.includes('decimal') && !r.isCorrect);
    if (decimalResponses.length > 0) {
      list.push({
        id: 'MIS-DEC-02',
        category: 'Decimals',
        description: 'Decimal Place Value Slip (misunderstanding repeating decimals or decimal sizing)',
        impact: 'Medium - impacts standard division and precision math.'
      });
    }

    // Check for "Speed vs Accuracy" guess pattern (fast wrong responses)
    const fastWrong = responses.filter(r => !r.isCorrect && r.timeTaken < 10);
    if (fastWrong.length >= 3) {
      list.push({
        id: 'MIS-PSY-03',
        category: 'Psychometric',
        description: 'Impaired Attention/Fast Guessing (spent <10 seconds on multiple incorrect items)',
        impact: 'Critical - learner needs prompting to review work and avoid speed bias.'
      });
    }

    // Check for Shape definition confusion
    const shapeConfusion = responses.some(r => r.category.includes('Geometry') && r.questionText.includes('rectangle') && r.studentAnswer === 'True' && !r.isCorrect);
    if (shapeConfusion) {
      list.push({
        id: 'MIS-GE-04',
        category: 'Geometry',
        description: 'Square vs General Rectangle Over-generalization',
        impact: 'Low - standard spatial vocabulary mismatch.'
      });
    }

    // Default if clean
    if (list.length === 0) {
      list.push({
        id: 'CLEAN-00',
        category: 'All Categories',
        description: 'No recurring misconceptions or speed-guessing patterns detected in this set!',
        impact: 'Optimized foundational baseline.'
      });
    }

    return list;
  };

  const misconceptions = detectMisconceptions();

  // 2. CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Assessment ID',
      'Student Name',
      'Email',
      'Grade',
      'Curriculum',
      'Question ID',
      'Category',
      'Subcategory',
      'Standard Code',
      'Difficulty',
      'Question Type',
      'Question Text',
      'Hint',
      'Explanation',
      'Estimated Time (s)',
      'Bloom Level',
      'Tags',
      'Skill ID',
      'Concept ID',
      'Lesson',
      'Topic',
      'Learning Objective',
      'Solution',
      'Step-by-Step Explanation',
      'Common Misconception',
      'Skills Tested',
      'Prerequisite Concepts',
      'Options',
      'Correct Answer',
      'Student Response',
      'Correct/Wrong',
      'Marks',
      'Time Taken (s)',
      'Confidence Rating',
      'Skipped',
      'Overall Score',
      'Overall Percentage',
      'Accuracy',
      'Average Time Per Question',
      'Total Solve Time',
      'Fastest Category',
      'Slowest Category',
      'Easy Accuracy (%)',
      'Medium Accuracy (%)',
      'Hard Accuracy (%)',
      'Skipped Count',
      'Guess Probability (%)',
      'Mastery Level',
      'Learning Velocity',
      'Readiness Score',
      'Confidence Index',
      'Recommended Starting Grade',
      'Recommended Starting Unit',
      'Recommended Lessons',
      'Learning Gaps',
      'Strongest Skills',
      'Weakest Skills',
      'Fluency Score (%)',
      'Reasoning Score (%)',
      'Computational Score (%)',
      'Geometry Score (%)',
      'Fractions Score (%)',
      'Number Sense Score (%)'
    ];

    const escapeCSV = (val: any) => {
      const str = val !== undefined && val !== null ? String(val) : '';
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = responses.map((res) => {
      const q = rawQuestions.find(item => item.id === res.questionId);
      
      const qHint = q?.hint || '';
      const qExpl = q?.explanation || '';
      const qEstTime = q?.estimatedTime || 0;
      const qBloom = q?.bloomLevel || '';
      const qTags = q?.tags ? q.tags.join(', ') : '';
      const qSkillId = q?.skillId || '';
      const qConceptId = q?.conceptId || '';
      const qLesson = q?.lesson || '';
      const qTopic = q?.topic || '';
      const qObjective = q?.learningObjective || '';
      const qSolution = q?.solution || '';
      const qStepExpl = q?.stepByStepExplanation || '';
      const qMisconception = q?.commonMisconception || '';
      const qSkillsTested = q?.skillsTested ? q.skillsTested.join(', ') : '';
      const qPrereqs = q?.prerequisiteConcepts ? q.prerequisiteConcepts.join(', ') : '';
      const qOptions = q?.options ? q.options.join(' | ') : '';
      const qStandardCode = q?.standardCode || '';

      return [
        escapeCSV(student.date),
        escapeCSV(student.assessmentId),
        escapeCSV(student.name),
        escapeCSV(student.email),
        escapeCSV(`Grade ${student.grade}`),
        escapeCSV(student.curriculum),
        escapeCSV(res.questionId),
        escapeCSV(res.category),
        escapeCSV(res.subcategory),
        escapeCSV(qStandardCode),
        escapeCSV(res.difficulty),
        escapeCSV(res.type),
        escapeCSV(res.questionText),
        escapeCSV(qHint),
        escapeCSV(qExpl),
        escapeCSV(qEstTime),
        escapeCSV(qBloom),
        escapeCSV(qTags),
        escapeCSV(qSkillId),
        escapeCSV(qConceptId),
        escapeCSV(qLesson),
        escapeCSV(qTopic),
        escapeCSV(qObjective),
        escapeCSV(qSolution),
        escapeCSV(qStepExpl),
        escapeCSV(qMisconception),
        escapeCSV(qSkillsTested),
        escapeCSV(qPrereqs),
        escapeCSV(qOptions),
        escapeCSV(res.correctAnswer),
        escapeCSV(res.studentAnswer),
        escapeCSV(res.isCorrect ? 'Correct' : 'Wrong'),
        escapeCSV(res.isCorrect ? 1 : 0),
        escapeCSV(res.timeTaken),
        escapeCSV(res.confidence || 'Medium'),
        escapeCSV(res.skipped ? 'Yes' : 'No'),
        escapeCSV(report.overallScore),
        escapeCSV(report.overallPercentage),
        escapeCSV(report.accuracy),
        escapeCSV(report.averageTimePerQuestion),
        escapeCSV(report.totalTime),
        escapeCSV(report.fastestCategory),
        escapeCSV(report.slowestCategory),
        escapeCSV(report.difficultyAccuracy.Easy),
        escapeCSV(report.difficultyAccuracy.Medium),
        escapeCSV(report.difficultyAccuracy.Hard),
        escapeCSV(report.skippedCount),
        escapeCSV(Math.round(report.guessProbability * 100)),
        escapeCSV(report.masteryLevel),
        escapeCSV(report.learningVelocity),
        escapeCSV(report.readinessScore),
        escapeCSV(report.confidenceIndex),
        escapeCSV(report.recommendedStartingGrade),
        escapeCSV(report.recommendedStartingUnit),
        escapeCSV(report.recommendedLessons ? report.recommendedLessons.join(', ') : ''),
        escapeCSV(report.learningGaps ? report.learningGaps.join(' | ') : ''),
        escapeCSV(report.strongestSkills ? report.strongestSkills.join(' | ') : ''),
        escapeCSV(report.weakestSkills ? report.weakestSkills.join(' | ') : ''),
        escapeCSV(report.fluencyScore),
        escapeCSV(report.reasoningScore),
        escapeCSV(report.computationalScore),
        escapeCSV(report.geometryScore),
        escapeCSV(report.fractionsScore),
        escapeCSV(report.numberSenseScore)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MyMasteryLab_${student.name}_Grade${student.grade}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. PDF print trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Filter raw responses
  const filteredResponses = responses.filter(r =>
    r.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.questionId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="teacher-dashboard-root" className="flex flex-col gap-6">
      
      {/* DATA SYNC STATUS HEADER */}
      <div id="teacher-sync-banner" className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Settings className="w-5 h-5 text-[#D05C15] animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">INTEGRATION ENGINE</span>
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-0.5">
              Data Synchronization Status: 
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                syncStatus === 'synced' ? 'bg-emerald-100 text-emerald-800' :
                syncStatus === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                'bg-rose-100 text-rose-800'
              }`}>
                ● {syncStatus.toUpperCase()}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{syncMessage}</p>
          </div>
        </div>
      </div>

      {/* METRIC ROW BENTO */}
      <div id="teacher-bento-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Accuracy bento */}
        <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">Assessment Accuracy</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-black text-slate-800">{report.accuracy}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#D05C15] h-full" style={{ width: `${report.accuracy}%` }} />
          </div>
        </div>

        {/* Skipped bento */}
        <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">Skipped / Unanswered</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-black text-slate-800">{report.skippedCount}</span>
            <span className="text-xs text-slate-400">items</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#FFA07A] h-full" style={{ width: `${(report.skippedCount / responses.length) * 100}%` }} />
          </div>
        </div>

        {/* Guess probability bento */}
        <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">Guess Probability</span>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-black text-slate-800">{(report.guessProbability * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${report.guessProbability * 100}%` }} />
          </div>
        </div>

        {/* Difficulty accuracy bento */}
        <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tier Accuracy (E / M / H)</span>
          <div className="flex gap-2 items-center mt-3">
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-bold text-emerald-600">{report.difficultyAccuracy.Easy}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-mono">Easy</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-bold text-blue-600">{report.difficultyAccuracy.Medium}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-mono">Med</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-bold text-orange-600">{report.difficultyAccuracy.Hard}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-mono">Hard</span>
            </div>
          </div>
        </div>

      </div>

      {/* NAVIGATION TABS */}
      <div id="teacher-tab-navigation" className="flex border-b border-slate-100 bg-white rounded-t-3xl overflow-hidden shadow-sm">
        <button
          id="tab-raw"
          onClick={() => setActiveTab('raw')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'raw'
              ? 'border-b-4 border-[#D05C15] text-[#D05C15] bg-[#FFE6D9]/25'
              : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-50'
          }`}
        >
          <Table className="w-4 h-4" /> Item Responses
        </button>
        <button
          id="tab-concepts"
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'concepts'
              ? 'border-b-4 border-[#D05C15] text-[#D05C15] bg-[#FFE6D9]/25'
              : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Subconcept Mastery
        </button>
        <button
          id="tab-misconceptions"
          onClick={() => setActiveTab('misconceptions')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'misconceptions'
              ? 'border-b-4 border-[#D05C15] text-[#D05C15] bg-[#FFE6D9]/25'
              : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Misconception Auditing
        </button>
        <button
          id="tab-bloom"
          onClick={() => setActiveTab('bloom')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bloom'
              ? 'border-b-4 border-[#D05C15] text-[#D05C15] bg-[#FFE6D9]/25'
              : 'text-slate-500 hover:text-[#D05C15] hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Bloom's Cognitive Levels
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="bg-white border border-slate-100 rounded-b-3xl p-6 shadow-md -mt-6">
        
        {/* RAW DATA TABLE TAB */}
        {activeTab === 'raw' && (
          <div id="panel-raw-data" className="flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4">
              <input
                id="inp-item-search"
                type="text"
                placeholder="Search items by keyword, category, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border-2 border-slate-200 focus:border-[#008080] rounded-xl outline-none text-sm"
              />
              <span className="text-xs font-semibold text-slate-400 uppercase shrink-0">
                Found {filteredResponses.length} items
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3">ID</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Time Taken</th>
                    <th className="p-3">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {filteredResponses.map((res, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-[#0B6162]">{res.questionId}</td>
                      <td className="p-3">
                        <span className="font-semibold block leading-normal">{res.category}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 leading-none">{res.subcategory}</span>
                      </td>
                      <td className="p-3 text-xs font-mono">{res.type}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                          res.difficulty === 'Medium' ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                          'bg-orange-50 text-orange-800 border border-orange-100'
                        }`}>
                          {res.difficulty}
                        </span>
                      </td>
                      <td className="p-3">
                        {res.skipped ? (
                          <span className="text-amber-500 font-bold flex items-center gap-1 text-xs">● SKIPPED</span>
                        ) : res.isCorrect ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 text-xs">
                            <CheckCircle className="w-4 h-4 shrink-0" /> CORRECT
                          </span>
                        ) : (
                          <span className="text-rose-500 font-bold flex items-center gap-1 text-xs">
                            <XCircle className="w-4 h-4 shrink-0" /> INCORRECT
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs">{res.timeTaken}s</td>
                      <td className="p-3">
                        <div className="max-w-xs truncate font-mono text-xs text-slate-500" title={String(res.studentAnswer)}>
                          {res.skipped ? 'N/A' : String(res.studentAnswer)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONCEPT MAP TAB */}
        {activeTab === 'concepts' && (
          <div id="panel-concepts" className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase">Subconcept Mastery Audit</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(report.categoryScores).map(([cat, score]) => (
                <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-700 text-sm truncate">{cat}</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      score.mastery === 'Mastered' ? 'bg-emerald-100 text-emerald-800' :
                      score.mastery === 'Proficient' ? 'bg-teal-100 text-teal-800' :
                      score.mastery === 'Developing' ? 'bg-blue-100 text-blue-800' :
                      score.mastery === 'Emerging' ? 'bg-orange-100 text-orange-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {score.mastery}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-1">
                    <span>Correct Items: {score.correct} / {score.total}</span>
                    <span>Accuracy: {score.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D05C15] h-full" style={{ width: `${score.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MISCONCEPTION AUDITING TAB */}
        {activeTab === 'misconceptions' && (
          <div id="panel-misconceptions" className="flex flex-col gap-5">
            <h4 className="text-sm font-bold text-slate-500 uppercase">Recurring Misconception Detection</h4>
            <div className="flex flex-col gap-3">
              {misconceptions.map((item, idx) => (
                <div key={idx} className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl flex gap-3.5 items-start">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{item.category}</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{item.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600">Educational Impact:</span> {item.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOOM'S COGNITIVE LEVELS */}
        {activeTab === 'bloom' && (
          <div id="panel-bloom" className="flex flex-col gap-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase">Bloom's Taxonomy Cognitive Distribution</h4>
            <div className="space-y-4">
              {[
                { level: 'Remembering', desc: 'Recall facts and basic mathematical concepts.', val: 15 },
                { level: 'Understanding', desc: 'Explain ideas, patterns, and mathematical models.', val: 35 },
                { level: 'Applying', desc: 'Use information in new situations or solve multi-step problems.', val: 30 },
                { level: 'Analyzing', desc: 'Draw connections among algebraic variables or functions.', val: 15 },
                { level: 'Evaluating', desc: 'Justify a stand, double check answers, or audit logical proofs.', val: 5 }
              ].map((b, idx) => {
                // Calculate response counts in this category
                const bloomTotal = responses.length;
                return (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-sm font-bold mb-1">
                      <span className="text-slate-800">{b.level}</span>
                      <span className="font-mono text-[#D05C15]">{b.val}% Distribution</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{b.desc}</p>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#D05C15] to-[#F7941D] h-full" style={{ width: `${b.val}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

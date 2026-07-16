/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentInfo, StudentResponse, DiagnosticReport, MasteryLevel, Grade } from '../types';
import { Award, BookOpen, Clock, AlertTriangle, TrendingUp, Compass, ChevronRight, Activity, Percent, Brain, Lightbulb } from 'lucide-react';

interface ParentDashboardProps {
  student: StudentInfo;
  responses: StudentResponse[];
  report: DiagnosticReport;
}

export default function ParentDashboard({ student, responses, report }: ParentDashboardProps) {
  // Helper to determine color classes for Mastery Levels
  const getMasteryColor = (mastery: MasteryLevel) => {
    switch (mastery) {
      case 'Mastered':
        return { text: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', bar: 'bg-emerald-500' };
      case 'Proficient':
        return { text: 'text-teal-600', bg: 'bg-teal-50 border-teal-100', bar: 'bg-teal-500' };
      case 'Developing':
        return { text: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', bar: 'bg-blue-500' };
      case 'Emerging':
        return { text: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', bar: 'bg-orange-400' };
      default:
        return { text: 'text-rose-600', bg: 'bg-rose-50 border-rose-100', bar: 'bg-rose-500' };
    }
  };

  const masteryTheme = getMasteryColor(report.masteryLevel);

  // Calculate SVGs angles and dasharrays
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.overallPercentage / 100) * circumference;

  return (
    <div id="parent-dashboard-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* HEADER HERO PROFILE */}
      <div id="parent-hero-profile" className="lg:col-span-12 bg-gradient-to-r from-[#D05C15] to-[#F7941D] rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-white/10 text-[#FFE6D9] font-mono text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-full font-bold">
            Diagnostic Profile
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2.5">
            {student.name}'s Learning Journey
          </h1>
          <p className="text-sm text-[#FFE6D9]/90 mt-1 font-medium">
            Grade {student.grade} • {student.curriculum === 'US' ? '🇺🇸 United States Common Core' : '🇬🇧 UK & European National Framework'}
          </p>
        </div>
        <div className="flex gap-4 items-center bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 w-full md:w-auto shrink-0">
          <div className="p-3 bg-white text-[#D05C15] rounded-xl shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-white/70 font-mono">ASSESSMENT INDEX</p>
            <p className="text-lg font-bold text-white">{student.assessmentId}</p>
            <p className="text-xs text-[#FFE6D9] mt-0.5">{student.date.split('T')[0]}</p>
          </div>
        </div>
      </div>

      {/* CORE STATS BANNER */}
      <div id="parent-core-metrics" className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFA07A]/10 rounded-full blur-2xl -mr-8 -mt-8" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Mastery Index</p>
        
        {/* Animated Radial Wheel */}
        <div className="relative w-40 h-40 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
            {/* Foreground progress */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#D05C15"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center leading-none">
            <span className="text-4xl font-extrabold text-[#D05C15]">{report.overallPercentage}%</span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{report.overallScore} Points</span>
          </div>
        </div>

        <div className={`mt-3 px-4 py-2 rounded-2xl border ${masteryTheme.bg} w-full`}>
          <span className={`text-sm font-bold ${masteryTheme.text}`}>{report.masteryLevel}</span>
        </div>
        <p className="text-xs text-slate-400 mt-3 max-w-xs">
          This rating indicates high confidence in foundational skills required for next-tier learning modules.
        </p>
      </div>

      {/* DIAL DIAGNOSTIC GRID */}
      <div id="parent-diagnostic-grid" className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
        <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#D05C15]" /> Diagnostic Analytical Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Fluency Accuracy</span>
              <Percent className="w-4 h-4 text-[#FFA07A]" />
            </div>
            <p className="text-2xl font-extrabold text-[#D05C15] mt-2">{report.accuracy}%</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#D05C15] h-full" style={{ width: `${report.accuracy}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Overall computational reliability.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Avg Solve Time</span>
              <Clock className="w-4 h-4 text-[#FFA07A]" />
            </div>
            <p className="text-2xl font-extrabold text-[#D05C15] mt-2">{report.averageTimePerQuestion}s</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[#FFA07A] h-full" style={{ width: `${Math.min(100, (report.averageTimePerQuestion / 60) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Average pace per assessment task.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Readiness Rating</span>
              <Compass className="w-4 h-4 text-[#FFA07A]" />
            </div>
            <p className="text-2xl font-extrabold text-[#D05C15] mt-2">{report.readinessScore}/100</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: `${report.readinessScore}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Preparedness index for next grade.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-orange-50/30 border border-orange-100/60 rounded-2xl flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#D05C15] shrink-0" />
            <div className="leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D05C15] block">Fastest Processing Area</span>
              <span className="text-xs font-extrabold text-slate-800">{report.fastestCategory}</span>
            </div>
          </div>
          <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-500 shrink-0 transform rotate-90" />
            <div className="leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">Requires Deliberate Pace</span>
              <span className="text-xs font-extrabold text-slate-800">{report.slowestCategory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CATEGORY INSIGHT BAR PLOTS */}
      <div id="parent-category-performance" className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-[#D05C15]" /> Curricular Area Mastery Scores
        </h3>
        <div className="flex flex-col gap-4">
          {Object.entries(report.categoryScores).map(([category, stats]) => {
            const masteryThemeCat = getMasteryColor(stats.mastery);
            return (
              <div key={category} className="flex flex-col gap-1.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">({stats.correct}/{stats.total})</span>
                    <span className="font-bold text-slate-800">{stats.percentage}%</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-center">
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${masteryThemeCat.bar}`} style={{ width: `${stats.percentage}%` }} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${masteryThemeCat.bg} ${masteryThemeCat.text} shrink-0`}>
                    {stats.mastery}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COGNITIVE DOMAINS (CUSTOM SVG CHART) */}
      <div id="parent-cognitive-domains" className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#D05C15]" /> Cognitive Domain Analysis
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Visual profile representing score percentage in specific mathematical modalities.
        </p>

        {/* Custom Radar Bar Chart */}
        <div className="flex-1 flex flex-col justify-center gap-3">
          {[
            { label: 'Fluency / Speed', val: report.fluencyScore, desc: 'Mental math recall and efficiency' },
            { label: 'Problem Reasoning', val: report.reasoningScore, desc: 'Logical strategies and reasoning' },
            { label: 'Computational Power', val: report.computationalScore, desc: 'Algebraic calculations & operations' },
            { label: 'Fractions & Ratios', val: report.fractionsScore, desc: 'Rational number and partitioning' },
            { label: 'Spatial Geometry', val: report.geometryScore, desc: 'Geometric properties and angles' },
            { label: 'Number Sense', val: report.numberSenseScore, desc: 'Base 10 place-value understanding' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>{item.label}</span>
                <span className="font-mono text-[#D05C15]">{item.val}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#D05C15] to-[#F7941D] h-full" style={{ width: `${item.val}%` }} />
              </div>
              <span className="text-[9px] text-slate-400 block mt-1">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DEPTH COMPREHENSION: GAP DETECTION & RECOGNITION */}
      <div id="parent-gap-detection" className="lg:col-span-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* STRONGEST SKILLS */}
          <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex flex-col h-full">
            <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider w-fit">
              <Lightbulb className="w-3.5 h-3.5" /> Strengths Detected
            </span>
            <div className="flex-1 mt-4 flex flex-col gap-3">
              {report.strongestSkills.length > 0 ? (
                report.strongestSkills.map((skill, sIdx) => (
                  <div key={sIdx} className="flex gap-2.5 items-start">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✔</span>
                    <p className="text-sm font-semibold text-slate-700">{skill}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Completing more test attempts will narrow down high proficiency concepts.</p>
              )}
            </div>
          </div>

          {/* LEARNING GAPS */}
          <div className="p-5 bg-orange-50/40 rounded-2xl border border-orange-100 flex flex-col h-full">
            <span className="inline-flex items-center gap-1.5 text-xs bg-orange-100 text-orange-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider w-fit">
              <AlertTriangle className="w-3.5 h-3.5" /> Conceptual Learning Gaps
            </span>
            <div className="flex-1 mt-4 flex flex-col gap-3">
              {report.learningGaps.length > 0 ? (
                report.learningGaps.map((gap, gIdx) => (
                  <div key={gIdx} className="flex gap-2.5 items-start">
                    <span className="text-orange-500 font-bold shrink-0 mt-0.5">!</span>
                    <p className="text-sm font-semibold text-slate-700">{gap}</p>
                  </div>
                ))
              ) : (
                <div className="flex gap-2.5 items-start text-emerald-700">
                  <span>✨</span>
                  <p className="text-sm font-semibold">Incredible! No major systematic learning gaps detected in this diagnostic set.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* RECOMMENDED LEARNING PATHWAY */}
      <div id="parent-learning-pathway" className="lg:col-span-12 bg-white rounded-3xl p-6 border border-slate-100 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFA07A]/10 rounded-full blur-3xl -mr-12 -mt-12" />
        <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#D05C15]" /> Recommended Pathway & Curriculum Launchpoint
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Tailored learning roadmap computed to target misconceptions and secure immediate grade placement.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Target Launcher Grade */}
          <div className="md:col-span-4 bg-gradient-to-br from-[#D05C15]/5 to-[#FFE6D9]/30 border border-[#D05C15]/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-[#D05C15]/80 uppercase tracking-wider">RECOMMENDED STARTING GRADE</span>
            <p className="text-5xl font-black text-[#D05C15] mt-3 mb-1">G{report.recommendedStartingGrade}</p>
            <p className="text-xs text-slate-500 px-4 mt-2">
              Provides the ideal challenge-to-support ratio based on mastery levels.
            </p>
          </div>

          {/* Unit Roadmap Steps */}
          <div className="md:col-span-8 flex flex-col justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#D05C15] text-white font-extrabold text-sm rounded-full flex items-center justify-center shrink-0 shadow-md">
                1
              </div>
              <div>
                <p className="text-xs font-bold text-[#D05C15] uppercase tracking-wider">SUGGESTED FIRST UNIT</p>
                <p className="text-base font-bold text-slate-800 mt-0.5">{report.recommendedStartingUnit}</p>
                <p className="text-xs text-slate-400 mt-0.5">Focuses on patching identified gaps in foundational number patterns and operations.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#F7941D] text-white font-extrabold text-sm rounded-full flex items-center justify-center shrink-0 shadow-md">
                2
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#D05C15] uppercase tracking-wider">TARGET PATH LESSONS</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {report.recommendedLessons.map((lesson, lIdx) => (
                    <div key={lIdx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#D05C15]" />
                      <span className="text-xs font-semibold text-slate-700">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-[#FFA07A] text-[#D05C15] font-extrabold text-sm rounded-full flex items-center justify-center shrink-0 shadow-md">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-[#FFA07A] uppercase tracking-wider">EXPECTED COMPREHENSION VELOCITY</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-2">
                  {report.learningVelocity === 'Accelerated' ? '🚀 Accelerated (Faster Pace)' : report.learningVelocity === 'Steady' ? '📈 Steady Progress Pathway' : '📝 Deep Support Track'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Calculated based on speed accuracy and solve times of Easy/Medium tiers.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

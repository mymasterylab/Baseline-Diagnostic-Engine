/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { ArrowUp, ArrowDown, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  currentAnswer: any;
  onChangeAnswer: (answer: any) => void;
  showHint: boolean;
  onToggleHint: () => void;
}

export default function QuestionRenderer({
  question,
  currentAnswer,
  onChangeAnswer,
  showHint,
  onToggleHint
}: QuestionRendererProps) {
  const { type, text, options, visualData, hint } = question;

  // Render visual aid if available
  const renderVisualAid = () => {
    if (!visualData) return null;

    if (type === 'FRACTION_MODEL' && visualData.fractionParts) {
      const { shaded, total } = visualData.fractionParts;
      return (
        <div id="fraction-visual-container" className="my-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="flex gap-1.5 h-16 w-full max-w-sm border-2 border-slate-800 rounded-lg overflow-hidden bg-white shadow-sm">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 transition-all duration-300 ${
                  i < shaded ? 'bg-[#008080]' : 'bg-[#C3EAED]'
                }`}
                style={{ borderRight: i < total - 1 ? '2px solid #1e293b' : 'none' }}
              />
            ))}
          </div>
          <p className="mt-3 text-xs font-mono text-slate-500">
            Visual Partition Model: {shaded} of {total} equal parts shaded
          </p>
        </div>
      );
    }

    if (type === 'CLOCK_TIME' && visualData.clockTime) {
      const { hour, minute } = visualData.clockTime;
      // Calculate hand rotations (degrees)
      const minuteAngle = minute * 6; // 360 / 60
      const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360 / 12 = 30; 30 / 60 = 0.5 per minute

      return (
        <div id="clock-visual-container" className="my-6 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <svg className="w-40 h-40 drop-shadow-md" viewBox="0 0 100 100">
            {/* Clock Face */}
            <circle cx="50" cy="50" r="45" fill="white" stroke="#0B6162" strokeWidth="3" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            
            {/* Hour markers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 50 + 38 * Math.sin(angle);
              const y1 = 50 - 38 * Math.cos(angle);
              const x2 = 50 + 42 * Math.sin(angle);
              const y2 = 50 - 42 * Math.cos(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#1e293b"
                  strokeWidth={i % 3 === 0 ? '1.5' : '0.75'}
                />
              );
            })}

            {/* Hour Numbers for major axes */}
            <text x="50" y="16" fontSize="7" textAnchor="middle" fontWeight="bold" fill="#0B6162">12</text>
            <text x="86" y="52" fontSize="7" textAnchor="middle" fontWeight="bold" fill="#0B6162">3</text>
            <text x="50" y="88" fontSize="7" textAnchor="middle" fontWeight="bold" fill="#0B6162">6</text>
            <text x="14" y="52" fontSize="7" textAnchor="middle" fontWeight="bold" fill="#0B6162">9</text>

            {/* Hour Hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 24 * Math.sin((hourAngle * Math.PI) / 180)}
              y2={50 - 24 * Math.cos((hourAngle * Math.PI) / 180)}
              stroke="#0B6162"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Minute Hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 34 * Math.sin((minuteAngle * Math.PI) / 180)}
              y2={50 - 34 * Math.cos((minuteAngle * Math.PI) / 180)}
              stroke="#FFA07A"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Pin */}
            <circle cx="50" cy="50" r="3" fill="#1e293b" />
          </svg>
          <p className="mt-3 text-xs font-mono text-slate-500">Analog Clock Diagnostic Display</p>
        </div>
      );
    }

    if (type === 'MONEY_COUNT' && visualData.moneyCoins) {
      return (
        <div id="money-visual-container" className="my-6 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            {visualData.moneyCoins.map((coinGroup, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: coinGroup.count }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`flex items-center justify-center rounded-full border-2 border-slate-400 font-bold shadow-sm transition-all duration-300 hover:scale-105 ${
                        coinGroup.type === 'quarter'
                          ? 'w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700 text-xs'
                          : 'w-11 h-11 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-[10px]'
                      }`}
                    >
                      <div className="text-center flex flex-col leading-none">
                        <span className="uppercase text-[9px] text-slate-500">
                          {coinGroup.type}
                        </span>
                        <span className="text-xs">{coinGroup.type === 'quarter' ? '25¢' : '10¢'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {coinGroup.count} × {coinGroup.type === 'quarter' ? 'Quarter' : 'Dime'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (type === 'PATTERN_RECOGNITION' && visualData.pattern) {
      return (
        <div id="pattern-visual-container" className="my-6 flex justify-center items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="flex items-center gap-3">
            {visualData.pattern.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-lg shadow-sm font-bold text-lg text-[#0B6162]">
                  {item}
                </div>
                {idx < visualData.pattern.length - 1 && (
                  <span className="text-slate-400 font-bold">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="text-slate-400 font-bold">→</span>
            <div className="w-12 h-12 flex items-center justify-center bg-[#C3EAED] border-2 border-dashed border-[#0B6162] rounded-lg shadow-sm font-bold text-lg text-[#0B6162] animate-pulse">
              ?
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Multiple Choice (MCQ) / True/False Handler
  const handleSelectOption = (option: string) => {
    onChangeAnswer(option);
  };

  // Multiple Select Handler
  const handleToggleMultipleSelect = (option: string) => {
    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
    if (current.includes(option)) {
      onChangeAnswer(current.filter((o: string) => o !== option));
    } else {
      onChangeAnswer([...current, option]);
    }
  };

  // Text Inputs (FILL_IN_BLANK & SHORT_NUMERICAL)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeAnswer(e.target.value);
  };

  // Ordering Handler (Up/Down Buttons)
  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    // Current answer for ordering is an array of indices corresponding to current ordered option array
    const orderedIndices = Array.isArray(currentAnswer) 
      ? [...currentAnswer] 
      : Array.from({ length: options?.length || 0 }).map((_, i) => i);

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedIndices.length) return;

    // Swap indices
    const temp = orderedIndices[index];
    orderedIndices[index] = orderedIndices[targetIdx];
    orderedIndices[targetIdx] = temp;

    onChangeAnswer(orderedIndices);
  };

  // Re-initialize ordered list state if question changes
  const getOrderedOptions = (): string[] => {
    if (!options) return [];
    if (!Array.isArray(currentAnswer) || currentAnswer.length !== options.length) {
      // Default to natural options order index mapping
      return options;
    }
    // Return options arranged by currentAnswer index ordering
    return (currentAnswer as number[]).map((idx) => options[idx]);
  };

  const orderedOptions = getOrderedOptions();

  return (
    <div id={`question-renderer-${question.id}`} className="flex flex-col gap-5">
      {/* Question Text */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
        <h3 
          className="text-lg md:text-xl font-semibold text-slate-800 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {question.estimatedTime <= 30 && (
          <span className="inline-flex items-center gap-1.5 mt-3 text-xs bg-orange-100 text-orange-800 font-semibold px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Rapid Recall Segment (30s)
          </span>
        )}
      </div>

      {/* Visual Aid */}
      {renderVisualAid()}

      {/* Answer Widget Router */}
      <div className="mt-2">
        {/* MCQ or FRACTION_MODEL or CLOCK_TIME or MONEY_COUNT or PATTERN_RECOGNITION (rendered as choices) */}
        {(type === 'MCQ' || type === 'FRACTION_MODEL' || type === 'CLOCK_TIME' || type === 'MONEY_COUNT' || type === 'PATTERN_RECOGNITION') && options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((option, idx) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={idx}
                  id={`option-card-${idx}`}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`flex items-start gap-3 p-4 rounded-xl text-left border-2 transition-all duration-300 shadow-sm ${
                    isSelected
                      ? 'border-[#008080] bg-[#C3EAED]/30 text-slate-900 ring-2 ring-[#008080]/20 font-medium'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected ? 'bg-[#008080] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm md:text-base">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* TRUE_FALSE */}
        {type === 'TRUE_FALSE' && (
          <div className="flex gap-4 justify-center py-4">
            {['True', 'False'].map((option, idx) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={idx}
                  id={`tf-card-${option}`}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`flex flex-col items-center justify-center w-36 h-28 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                    isSelected
                      ? 'border-[#008080] bg-[#C3EAED]/40 text-[#0B6162] font-semibold scale-105'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg font-bold">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* MULTIPLE_SELECT */}
        {type === 'MULTIPLE_SELECT' && options && (
          <div className="flex flex-col gap-2.5">
            <span className="text-xs text-slate-500 font-semibold mb-1">
              Select all correct answers (multiple choice):
            </span>
            {options.map((option, idx) => {
              const currentArr = Array.isArray(currentAnswer) ? currentAnswer : [];
              const isChecked = currentArr.includes(option);
              return (
                <button
                  key={idx}
                  id={`multiselect-option-${idx}`}
                  type="button"
                  onClick={() => handleToggleMultipleSelect(option)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isChecked
                      ? 'border-[#008080] bg-[#C3EAED]/20 text-slate-900 font-medium'
                      : 'border-slate-100 bg-white hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all shrink-0 ${
                    isChecked ? 'border-[#008080] bg-[#008080] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <span className="text-[10px]">✔</span>}
                  </div>
                  <span className="text-sm md:text-base">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* FILL_IN_BLANK & SHORT_NUMERICAL */}
        {(type === 'FILL_IN_BLANK' || type === 'SHORT_NUMERICAL') && (
          <div className="flex flex-col gap-2 max-w-md mx-auto py-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Type Your Answer Below:
            </label>
            <input
              id="short-answer-input"
              type={type === 'SHORT_NUMERICAL' ? 'number' : 'text'}
              value={currentAnswer || ''}
              onChange={handleTextChange}
              placeholder={type === 'SHORT_NUMERICAL' ? 'Enter a number...' : 'Type answer here...'}
              className="w-full text-center px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-[#008080] focus:ring-4 focus:ring-[#008080]/15 outline-none font-medium text-lg text-slate-800 transition-all placeholder:text-slate-300 shadow-sm"
              autoFocus
            />
          </div>
        )}

        {/* DRAG_DROP_ORDERING */}
        {type === 'DRAG_DROP_ORDERING' && options && (
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <span className="text-xs text-slate-500 font-semibold mb-1">
              Arrange items using the up and down buttons:
            </span>
            {orderedOptions.map((option, idx) => {
              // We need to find this item's index inside the original options array
              const originalIndex = options.indexOf(option);
              return (
                <div
                  key={originalIndex}
                  id={`ordering-item-${idx}`}
                  className="flex items-center justify-between p-3.5 bg-white border-2 border-slate-200 rounded-xl shadow-sm transition-all duration-200 hover:border-[#008080]/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="text-sm md:text-base font-semibold text-slate-700">
                      {option}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      id={`btn-order-up-${idx}`}
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, 'up')}
                      className={`p-2 rounded-lg border transition-all ${
                        idx === 0
                          ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                          : 'border-slate-200 hover:border-[#008080] text-[#0B6162] hover:bg-[#C3EAED]/20 bg-white'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      id={`btn-order-down-${idx}`}
                      type="button"
                      disabled={idx === options.length - 1}
                      onClick={() => handleMoveItem(idx, 'down')}
                      className={`p-2 rounded-lg border transition-all ${
                        idx === options.length - 1
                          ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                          : 'border-slate-200 hover:border-[#008080] text-[#0B6162] hover:bg-[#C3EAED]/20 bg-white'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint Accordion */}
      <div id="hint-accordion-section" className="mt-4 border-t border-slate-100 pt-4">
        <button
          id="btn-toggle-hint"
          type="button"
          onClick={onToggleHint}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B6162] hover:text-[#008080] transition-colors focus:outline-none"
        >
          <HelpCircle className="w-4 h-4" />
          {showHint ? 'Hide Hint' : 'Show Diagnostic Hint'}
        </button>
        {showHint && (
          <div className="mt-2.5 p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#FFA07A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-950 mb-0.5">Stuck? Here is a hint:</p>
              <p>{hint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

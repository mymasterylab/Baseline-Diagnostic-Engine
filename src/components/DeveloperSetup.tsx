/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, Clipboard, Check, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface DeveloperSetupProps {
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
}

export default function DeveloperSetup({ scriptUrl, onSaveScriptUrl }: DeveloperSetupProps) {
  const [urlInput, setUrlInput] = useState(scriptUrl);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const appsScriptCode = `/**
 * MyMasteryLab - Google Sheets Sync Apps Script Webhook
 * Auto-creates sheets "Grade 1" through "Grade 9" and appends student responses dynamically.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.grade || "Grade Unknown";
    
    // Open the Active Spreadsheet (the one this script is attached to)
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    // Define headers
    var headers = [
      "Timestamp", "Assessment ID", "Student Name", "Email", "Grade", "Curriculum", 
      "Category", "Subcategory", "Standard", "Question ID", "Difficulty", 
      "Question Type", "Question", "Correct Answer", "Student Response", 
      "Correct/Wrong", "Marks", "Time Taken", "Overall Score", "Percentage"
    ];
    
    // If the grade-specific sheet doesn't exist, create it and set headers
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow(headers);
      // Format headers with bold and frozen rows
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#C3EAED");
      sheet.setFrozenRows(1);
    }
    
    // Prepare the row data based on the JSON payload
    var rowData = [
      data.timestamp || new Date(),
      data.assessmentId || "",
      data.studentName || "",
      data.email || "",
      data.grade || "",
      data.curriculum || "",
      data.category || "",
      data.subcategory || "",
      data.standard || "",
      data.questionId || "",
      data.difficulty || "",
      data.questionType || "",
      data.question || "",
      data.correctAnswer || "",
      data.studentResponse || "",
      data.correctOrWrong || "",
      data.marks !== undefined ? data.marks : "",
      data.timeTaken || "",
      data.overallScore || "",
      data.percentage || ""
    ];
    
    // Append the student response row
    sheet.appendRow(rowData);
    
    // Return a CORS-compliant JSON success output
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Student response successfully recorded in sheet: " + sheetName 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveScriptUrl(urlInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div id="developer-setup-container" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="p-3 bg-[#FFE6D9] text-[#D05C15] rounded-2xl shadow-sm">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Google Sheets Integration Panel</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated synchronization setup for schools and instructors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INSTRUCTIONS */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#D05C15] uppercase tracking-wider">Setup Instructions</h3>
          <ol className="text-xs text-slate-600 space-y-3.5 list-decimal pl-4 leading-relaxed">
            <li>
              Create a new spreadsheet in <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-[#D05C15] font-semibold underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3" /></a>.
            </li>
            <li>
              Navigate to <strong>Extensions</strong> → <strong>Apps Script</strong>.
            </li>
            <li>
              Delete any template code inside the editor and paste the code on the right.
            </li>
            <li>
              Click the floppy disk icon (<strong>Save</strong>) at the top of Apps Script.
            </li>
            <li>
              Click <strong>Deploy</strong> (blue button) → <strong>New deployment</strong>.
            </li>
            <li>
              Under "Select type", click the gear and select <strong>Web app</strong>.
            </li>
            <li>
              Set "Execute as" to <strong>Me (your email)</strong> and "Who has access" to <strong>Anyone</strong> (this allows the assessment sandbox to submit responses securely).
            </li>
            <li>
              Click <strong>Deploy</strong>, grant permissions when prompted, and copy the generated <strong>Web app URL</strong>.
            </li>
            <li>
              Paste the URL in the config box below!
            </li>
          </ol>

          {/* Webhook Form */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Apps Script Web App Webhook URL
            </label>
            <div className="flex gap-2">
              <input
                id="inp-webhook-url"
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-slate-200 focus:border-[#D05C15] rounded-xl outline-none text-xs text-slate-800 font-mono"
              />
              <button
                id="btn-save-webhook"
                type="button"
                onClick={handleSave}
                className="bg-[#D05C15] hover:bg-[#F7941D] text-white font-bold p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center"
                title="Save URL"
              >
                {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              </button>
            </div>
            {isSaved && (
              <span className="text-[10px] text-emerald-600 font-bold block mt-2">
                ✔ Webhook URL saved successfully! Live synchronization active.
              </span>
            )}
          </div>
        </div>

        {/* CODE BLOCK */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex justify-between items-center bg-slate-800 text-white px-4 py-2.5 rounded-t-2xl">
            <span className="text-xs font-mono font-semibold text-slate-300">Code.gs (Apps Script)</span>
            <button
              id="btn-copy-script"
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs text-[#FFE6D9] hover:text-[#F7941D] font-bold transition-colors focus:outline-none"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>
          <div className="flex-1 bg-slate-900 rounded-b-2xl p-4 overflow-auto max-h-[350px] border border-slate-800 shadow-inner">
            <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed">
              {appsScriptCode}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}

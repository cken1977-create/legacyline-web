"use client";

import { useState } from "react";
import Shell from "../../_components/Shell";

export default function IntakeImportPage() {
  const [fileName, setFileName] = useState("");
  const [csvText, setCsvText] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
    function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce<Record<string, string>>((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });

  return { headers, rows };
    }
  }
   const parsed = csvText ? parseCsv(csvText) : { headers: [], rows: [] };
  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold">Bulk Intake Import</h2>

        <p className="mt-3 text-white/70">
          Upload a CSV file containing participant records.
        </p>

        <div className="mt-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="rounded-xl bg-black/40 p-2"
          />
        </div>

        {fileName && (
          <div className="mt-4 text-green-300 text-sm">
            Selected file: {fileName}
          </div>
        )}

        {csvText && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
            {csvText}
          </pre>
        )}
      </div>
    </Shell>
  );
}

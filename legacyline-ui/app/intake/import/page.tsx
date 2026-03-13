"use client";

import { useState } from "react";
import Shell from "../../_components/Shell";

export default function IntakeImportPage() {
  const [fileName, setFileName] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
  }

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
      </div>
    </Shell>
  );
}

"use client";

import Shell from "../../_components/Shell";

export default function IntakeImportPage() {
  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold">Bulk Intake Import</h2>
        <p className="mt-3 text-white/70">
          Upload a CSV to create participants in bulk.
        </p>
      </div>
    </Shell>
  );
}

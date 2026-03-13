"use client";

import { useMemo, useState } from "react";
import Shell from "../../_components/Shell";
import { api } from "../../../lib/api";

type CsvRow = Record<string, string>;

type ParticipantImportPayload = {
  first_name: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  case_manager: string;
  citizenship_status: string;
  program: string;
  country_of_origin: string;
  organization: string;
};

function normalizePhone(input: string) {
  return input.replace(/[^\d]/g, "");
}

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
}

function getValue(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    const normalized = normalizeHeader(key);
    const match = Object.keys(row).find((k) => normalizeHeader(k) === normalized);
    if (match && row[match]?.trim()) {
      return row[match].trim();
    }
  }
  return "";
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return { headers: [], rows: [] as CsvRow[] };

  const headers = lines[0].split(",").map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce<CsvRow>((acc, header, index) => {
      acc[header] = values[index] || "";
      return acc;
    }, {});
  });

  return { headers, rows };
}

function mapRowToParticipant(row: CsvRow): ParticipantImportPayload {
  return {
    first_name: getValue(row, ["first_name", "first name", "firstname"]),
    last_name: getValue(row, ["last_name", "last name", "lastname"]),
    dob: getValue(row, ["dob", "date_of_birth", "date of birth", "birth_date"]),
    email: getValue(row, ["email", "email_address", "email address"]),
    phone: normalizePhone(getValue(row, ["phone", "phone_number", "phone number", "mobile"])),
    address: getValue(row, ["address", "street_address", "street address"]),
    city: getValue(row, ["city"]),
    state: getValue(row, ["state"]),
    zip: getValue(row, ["zip", "zipcode", "zip_code", "postal_code"]),
    notes: getValue(row, ["notes", "note"]),
    case_manager: getValue(row, ["case_manager", "case manager"]),
    citizenship_status: getValue(row, ["citizenship_status", "citizenship status", "status"]),
    program: getValue(row, ["program", "program_track", "program track"]),
    country_of_origin: getValue(row, ["country_of_origin", "country of origin", "country"]),
    organization: getValue(row, ["organization", "org"]) || "vizionz_sankofa",
  };
}

export default function IntakeImportPage() {
  const [fileName, setFileName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  }

  const parsed = useMemo(
    () => (csvText ? parseCsv(csvText) : { headers: [], rows: [] as CsvRow[] }),
    [csvText]
  );

  const mappedRows = useMemo(
    () => parsed.rows.map(mapRowToParticipant),
    [parsed.rows]
  );

  const validRows = useMemo(
    () =>
      mappedRows.filter(
        (row) => row.first_name.trim() && row.last_name.trim() && row.dob.trim()
      ),
    [mappedRows]
  );

  const invalidRows = useMemo(
    () =>
      mappedRows.filter(
        (row) => !row.first_name.trim() || !row.last_name.trim() || !row.dob.trim()
      ),
    [mappedRows]
  );

  async function handleImport() {
  if (loading) return;
  if (validRows.length === 0) {
    setMessage("No valid rows found. CSV must include first_name, last_name, and dob.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const result = await api<{ imported: number; failed: number; total: number }>(
      "/participants/import",
      {
        method: "POST",
        body: JSON.stringify(validRows),
      }
    );

    setMessage(
      `Import complete. Imported: ${result.imported}. Failed: ${result.failed}. Invalid rows skipped: ${invalidRows.length}.`
    );
  } catch (err: any) {
    setMessage(err?.message || "Import failed.");
  } finally {
    setLoading(false);
  }
  }

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold">Bulk Intake Import</h2>

        <p className="mt-3 text-white/70">
          Upload a CSV file to create participants in bulk.
        </p>

        <div className="mt-4 rounded-2xl bg-black/30 p-4 text-sm text-white/70 ring-1 ring-white/10">
          <div>Required fields per row:</div>
          <div className="mt-2 text-white/90">first_name, last_name, dob</div>
          <div className="mt-3">Optional fields supported:</div>
          <div className="mt-2 text-white/90">
            email, phone, address, city, state, zip, notes, case_manager,
            citizenship_status, program, country_of_origin, organization
          </div>
        </div>

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

        {parsed.headers.length > 0 && (
          <div className="mt-6 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Detected Columns</div>
            <pre className="mt-3 max-h-40 overflow-auto text-xs text-white/80">
              {JSON.stringify(parsed.headers, null, 2)}
            </pre>
          </div>
        )}

        {parsed.rows.length > 0 && (
          <div className="mt-6 rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="text-white/90">Total rows: {parsed.rows.length}</div>
              <div className="text-green-300">Valid: {validRows.length}</div>
              <div className="text-yellow-300">Invalid: {invalidRows.length}</div>
            </div>

            <div className="mt-4 text-sm text-white/80">Preview (first 5 mapped rows)</div>
            <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
              {JSON.stringify(mappedRows.slice(0, 5), null, 2)}
            </pre>
          </div>
        )}

        {parsed.rows.length > 0 && (
          <button
            onClick={handleImport}
            disabled={loading || validRows.length === 0}
            className="mt-6 rounded-xl bg-white px-4 py-2 text-black disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Participants"}
          </button>
        )}

        {message && (
          <pre className="mt-4 text-xs text-green-300 whitespace-pre-wrap">
            {message}
          </pre>
        )}
      </div>
    </Shell>
  );
      }

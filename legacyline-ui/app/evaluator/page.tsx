"use client";

import { useEffect, useState } from "react";
import Shell from "../_components/Shell";
import { api } from "../../lib/api";

type IntakeSubmission = {
  id: string;
  participant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  housing_type: string;
  employment_status: string;
  monthly_income: string;
  submitted_at: string;
};

export default function EvaluatorPage() {
  const [rows, setRows] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSubmissions() {
    try {
      const data = await api<IntakeSubmission[]>("/admin/intake-submissions");
      setRows(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <Shell>
      <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
        <h2 className="text-2xl font-semibold tracking-tight">
          Evaluator Console
        </h2>

        <p className="mt-2 text-white/70">
          Review participant intake submissions and take evaluator action.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-white/60">
              <tr>
                <th className="pb-3">Participant</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Housing</th>
                <th>Employment</th>
                <th>Income</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>

            <tbody className="text-white">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-6 text-white/60">
                    Loading submissions...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="py-3">
                      {row.first_name} {row.last_name}
                    </td>

                    <td>{row.email}</td>

                    <td>{row.phone}</td>

                    <td>{row.housing_type}</td>

                    <td>{row.employment_status}</td>

                    <td>${row.monthly_income}</td>

                    <td>
                      {new Date(row.submitted_at).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="rounded-lg bg-white px-3 py-1 text-black text-xs"
                        onClick={() =>
                          window.location.href = `/intake/${row.participant_id}`
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
                    }

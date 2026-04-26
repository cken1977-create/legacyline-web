"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

const C = {
  navy: "#1A3A5C", navyDeep: "#0B1C30", gold: "#C8A84B",
  white: "#F4F6F9", gray: "#8899AA", surface: "#162E4A",
  teal: "#2DD4BF", red: "#F87171", green: "#34D399",
};

const DOCUMENT_TYPES = [
  { key: "gov_id", label: "Government-Issued ID" },
  { key: "selfie", label: "Identity Selfie" },
  { key: "bank_statement", label: "Bank Statement" },
  { key: "intake_complete", label: "Intake Form" },
  { key: "supporting_doc", label: "Supporting Document" },
];

type DocumentVersion = {
  id: string;
  document_type: string;
  version: number;
  uploaded_by: string;
  reason: string;
  uploaded_at: string;
};

type Props = {
  participantId: string;
  actorEmail: string;
};

export default function DocumentUploadPanel({
  participantId,
  actorEmail,
}: Props) {
  const [documents, setDocuments] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<any>(null);

  const [docType, setDocType] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [participantId]);

  async function loadDocuments() {
    try {
      const res: any = await api(
        `/participants/${participantId}/documents`
      );
      if (res.documents) setDocuments(res.documents);
    } catch {
      // No documents yet — empty state is fine
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    setMsg(null);

    // Frontend validation
    if (!docType) {
      setMsg({ ok: false, text: "Please select a document type." });
      return;
    }
    if (!reason || reason.trim().length < 10) {
      setMsg({ ok: false, text: "Please provide a reason (minimum 10 characters)." });
      return;
    }
    if (!file) {
      setMsg({ ok: false, text: "Please select a file to upload." });
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", docType);
      form.append("reason", reason);

      // Use fetch directly for multipart — api() wrapper may not handle FormData
      const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(
        `${baseURL}/participants/${participantId}/documents/update`,
        {
          method: "POST",
          headers: { "X-Actor": actorEmail },
          body: form,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Upload failed");
      }

      setMsg({ ok: true, text: "✓ Document uploaded and version recorded." });
      setDocType("");
      setReason("");
      setFile(null);
      await loadDocuments();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message ?? "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  // Group documents by type showing latest version
  const latestByType = DOCUMENT_TYPES.map((dt) => {
    const versions = documents
      .filter((d) => d.document_type === dt.key)
      .sort((a, b) => b.version - a.version);
    return { ...dt, latest: versions[0] ?? null, count: versions.length };
  });

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.gold}44`,
      borderRadius: 8,
      padding: 20,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.gray,
        letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 16,
      }}>
        Document Updates
      </div>

      {/* Current document versions */}
      {!loading && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: C.gold,
            marginBottom: 12, textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>
            Version History
          </div>
          {latestByType.map(({ key, label, latest, count }) => (
            <div key={key} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10,
              padding: "8px 12px", borderRadius: 6,
              background: "rgba(0,0,0,0.2)",
              border: `1px solid ${latest ? C.teal : "rgba(255,255,255,0.05)"}33`,
            }}>
              <div>
                <div style={{
                  fontSize: 13, color: latest ? C.white : C.gray,
                  fontWeight: latest ? 500 : 400,
                }}>
                  {label}
                </div>
                {latest && (
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                    v{latest.version} · {latest.uploaded_by} ·{" "}
                    {new Date(latest.uploaded_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: latest ? C.teal : C.gray,
                padding: "3px 8px", borderRadius: 999,
                background: latest ? `${C.teal}22` : "transparent",
                border: `1px solid ${latest ? C.teal : C.gray}44`,
              }}>
                {latest ? `${count} version${count > 1 ? "s" : ""}` : "No updates"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <div style={{
        borderTop: `1px solid ${C.gold}22`,
        paddingTop: 20,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: C.gold,
          marginBottom: 14, textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Upload Updated Document
        </div>

        {/* Document type selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 12, color: C.gray, marginBottom: 6,
          }}>
            Document Type
          </div>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            style={{
              width: "100%", background: "rgba(0,0,0,0.3)",
              border: `1px solid ${docType ? C.gold : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6, padding: "8px 10px",
              color: docType ? C.white : C.gray,
              fontSize: 13, outline: "none",
            }}
          >
            <option value="">Select document type...</option>
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.key} value={dt.key}
                style={{ background: C.navyDeep }}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>
            Reason for Update
          </div>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this document being updated..."
            style={{
              width: "100%", background: "rgba(0,0,0,0.2)",
              border: `1px solid ${reason.trim().length > 0 && reason.trim().length < 10
                ? C.red : "rgba(255,255,255,0.1)"}`,
              borderRadius: 6, padding: "8px 10px",
              color: C.white, fontSize: 13,
              outline: "none", resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {reason.trim().length > 0 && reason.trim().length < 10 && (
            <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>
              {10 - reason.trim().length} more characters required
            </div>
          )}
        </div>

        {/* File selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>
            File
          </div>
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 6,
            border: `1px dashed ${file ? C.teal : "rgba(255,255,255,0.2)"}`,
            background: "rgba(0,0,0,0.2)", cursor: "pointer",
          }}>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.heic,.heif"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <span style={{
              fontSize: 13,
              color: file ? C.teal : C.gray,
            }}>
              {file ? `✓ ${file.name}` : "Choose file (JPEG, PNG, PDF, HEIC)"}
            </span>
          </label>
        </div>

        {msg && (
          <div style={{
            padding: "10px 14px", borderRadius: 6,
            marginBottom: 14, fontSize: 13,
            background: msg.ok
              ? "rgba(45,212,191,0.1)"
              : "rgba(248,113,113,0.1)",
            border: `1px solid ${msg.ok ? C.teal : C.red}55`,
            color: msg.ok ? C.teal : C.red,
          }}>
            {msg.text}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 6, background: C.gold,
            border: "none", color: C.navyDeep,
            fontWeight: 700, fontSize: 13,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : "Upload Document →"}
        </button>
      </div>
    </div>
  );
      }

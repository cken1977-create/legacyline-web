"use client";

import { useState, useEffect } from "react";
import { api } from "../../../lib/api";

const C = {
  navy: "#1A3A5C", navyDeep: "#0B1C30", gold: "#C8A84B",
  white: "#F4F6F9", gray: "#8899AA", surface: "#162E4A",
  teal: "#2DD4BF", red: "#F87171", green: "#34D399",
  yellow: "#FBBF24",
};

type Question = {
  id: string;
  text: string;
  type: "standard" | "followup";
};

type Response = {
  question_id: string;
  question_text: string;
  question_type: string;
  response_text: string;
  ai_followups: string[];
  asked_at: string;
};

type Session = {
  id: string;
  evaluator_email: string;
  status: string;
  created_at: string;
  completed_at: string | null;
};

type Props = {
  participantId: string;
  actorEmail: string;
};

export default function QuestionnairePanel({
  participantId,
  actorEmail,
}: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState("");
  const [followups, setFollowups] = useState<string[]>([]);
  const [activeFollowup, setActiveFollowup] = useState<string | null>(null);
  const [followupResponse, setFollowupResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [view, setView] = useState<"history" | "active">("history");

  useEffect(() => {
    loadSessions();
  }, [participantId]);

  async function loadSessions() {
    setLoading(true);
    try {
      const res: any = await api(
        `/participants/${participantId}/questionnaire/sessions`
      );
      setSessions(res.sessions ?? []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function startSession() {
    setMsg(null);
    try {
      const res: any = await api(
        `/participants/${participantId}/questionnaire/start`,
        {
          method: "POST",
          headers: { "X-Actor": actorEmail },
          body: JSON.stringify({}),
        }
      );
      setActiveSession(res.session_id);
      setQuestions(
        (res.questions ?? []).map((q: any) => ({
          ...q,
          type: "standard",
        }))
      );
      setResponses([]);
      setCurrentIndex(0);
      setCurrentResponse("");
      setFollowups([]);
      setActiveFollowup(null);
      setView("active");
      await loadSessions();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message ?? "Failed to start session." });
    }
  }

  async function submitResponse(
    questionId: string,
    questionText: string,
    responseText: string,
    questionType: string,
    sequence: number
  ) {
    if (!responseText.trim() || !activeSession) return;
    setSubmitting(true);
    setMsg(null);

    try {
      const res: any = await api(
        `/participants/${participantId}/questionnaire/${activeSession}/respond`,
        {
          method: "POST",
          headers: { "X-Actor": actorEmail },
          body: JSON.stringify({
            question_id: questionId,
            question_text: questionText,
            question_type: questionType,
            response_text: responseText.trim(),
            sequence,
          }),
        }
      );

      const newFollowups: string[] = res.followups ?? [];
      setFollowups(newFollowups);
      setActiveFollowup(null);
      setFollowupResponse("");

      setResponses((prev) => [
        ...prev,
        {
          question_id: questionId,
          question_text: questionText,
          question_type: questionType,
          response_text: responseText.trim(),
          ai_followups: newFollowups,
          asked_at: new Date().toISOString(),
        },
      ]);

      setCurrentResponse("");

      if (questionType === "standard") {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message ?? "Failed to save response." });
    } finally {
      setSubmitting(false);
    }
  }

  async function completeSession() {
    if (!activeSession) return;
    setCompleting(true);
    try {
      await api(
        `/participants/${participantId}/questionnaire/${activeSession}/complete`,
        {
          method: "POST",
          headers: { "X-Actor": actorEmail },
          body: JSON.stringify({}),
        }
      );
      setActiveSession(null);
      setView("history");
      await loadSessions();
    } catch (err: any) {
      setMsg({ ok: false, text: err?.message ?? "Failed to complete session." });
    } finally {
      setCompleting(false);
    }
  }

  async function loadSessionResponses(sessionId: string) {
    try {
      const res: any = await api(
        `/participants/${participantId}/questionnaire/${sessionId}/responses`
      );
      setResponses(res.responses ?? []);
      setActiveSession(sessionId);
      setView("active");
      setQuestions([]);
      setCurrentIndex(999);
    } catch (err: any) {
      setMsg({ ok: false, text: "Failed to load session responses." });
    }
  }

  const currentQuestion = questions[currentIndex] ?? null;
  const isComplete = currentIndex >= questions.length && questions.length > 0;

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
        Behavioral Narrative Engine
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20,
        borderBottom: `1px solid ${C.gold}22`,
        paddingBottom: 12,
      }}>
        <button
          onClick={() => setView("history")}
          style={{
            padding: "6px 14px", borderRadius: 6, fontSize: 12,
            fontWeight: 600, cursor: "pointer",
            background: view === "history" ? `${C.gold}22` : "transparent",
            border: `1px solid ${view === "history" ? C.gold : "rgba(255,255,255,0.1)"}`,
            color: view === "history" ? C.gold : C.gray,
          }}
        >
          Session History
        </button>
        {activeSession && (
          <button
            onClick={() => setView("active")}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12,
              fontWeight: 600, cursor: "pointer",
              background: view === "active" ? `${C.gold}22` : "transparent",
              border: `1px solid ${view === "active" ? C.gold : "rgba(255,255,255,0.1)"}`,
              color: view === "active" ? C.gold : C.gray,
            }}
          >
            Active Session
          </button>
        )}
      </div>

      {msg && (
        <div style={{
          padding: "10px 14px", borderRadius: 6, marginBottom: 16,
          fontSize: 13,
          background: msg.ok ? "rgba(45,212,191,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${msg.ok ? C.teal : C.red}55`,
          color: msg.ok ? C.teal : C.red,
        }}>
          {msg.text}
        </div>
      )}

      {/* History view */}
      {view === "history" && (
        <div>
          <button
            onClick={startSession}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 6,
              background: C.gold, border: "none",
              color: C.navyDeep, fontWeight: 700, fontSize: 13,
              cursor: "pointer", marginBottom: 20,
            }}
          >
            Start New Interview Session →
          </button>

          {loading && (
            <div style={{ fontSize: 12, color: C.gray }}>
              Loading sessions...
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div style={{
              padding: "24px 16px", textAlign: "center",
              background: "rgba(0,0,0,0.2)", borderRadius: 6,
              color: C.gray, fontSize: 13,
            }}>
              No interview sessions recorded yet.
            </div>
          )}

          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => loadSessionResponses(s.id)}
              style={{
                padding: "12px 14px", borderRadius: 6,
                background: "rgba(0,0,0,0.2)",
                border: `1px solid ${s.status === "completed" ? C.teal : C.gold}33`,
                marginBottom: 10, cursor: "pointer",
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 4,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: s.status === "completed" ? C.teal : C.yellow,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {s.status}
                </div>
                <div style={{ fontSize: 11, color: C.gray }}>
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.gray }}>
                {s.evaluator_email}
              </div>
              {s.completed_at && (
                <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                  Completed {new Date(s.completed_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Active session view */}
      {view === "active" && (
        <div>
          {/* Responses recorded so far */}
          {responses.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: C.gold,
                marginBottom: 12, textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                Recorded Responses
              </div>
              {responses.map((resp, i) => (
                <div key={i} style={{
                  marginBottom: 14, padding: "12px 14px",
                  borderRadius: 6, background: "rgba(0,0,0,0.2)",
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}>
                  <div style={{
                    fontSize: 11, color: C.gold, fontWeight: 600,
                    marginBottom: 4,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {resp.question_type === "followup" ? "Follow-up" : `Q${i + 1}`}
                  </div>
                  <div style={{
                    fontSize: 13, color: C.white,
                    marginBottom: 8, lineHeight: 1.5,
                  }}>
                    {resp.question_text}
                  </div>
                  <div style={{
                    fontSize: 12, color: C.gray,
                    lineHeight: 1.6, paddingLeft: 10,
                    borderLeft: `2px solid ${C.gold}44`,
                  }}>
                    {resp.response_text}
                  </div>
                  {resp.ai_followups?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{
                        fontSize: 10, color: C.teal, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}>
                        AI Generated Follow-ups
                      </div>
                      {resp.ai_followups.map((fq, fi) => (
                        <div key={fi} style={{
                          fontSize: 12, color: C.teal,
                          padding: "4px 0",
                          borderBottom: fi < resp.ai_followups.length - 1
                            ? `1px solid rgba(45,212,191,0.1)` : "none",
                        }}>
                          {fq}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Follow-up questions from last response */}
          {followups.length > 0 && !isComplete && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: C.teal,
                marginBottom: 10, textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                AI Follow-up Questions
              </div>
              {followups.map((fq, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActiveFollowup(fq);
                    setFollowupResponse("");
                  }}
                  style={{
                    padding: "10px 12px", borderRadius: 6,
                    marginBottom: 8, cursor: "pointer",
                    background: activeFollowup === fq
                      ? `${C.teal}22` : "rgba(0,0,0,0.2)",
                    border: `1px solid ${activeFollowup === fq
                      ? C.teal : "rgba(45,212,191,0.2)"}`,
                    color: C.teal, fontSize: 13, lineHeight: 1.5,
                  }}
                >
                  {fq}
                </div>
              ))}

              {activeFollowup && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    rows={4}
                    value={followupResponse}
                    onChange={(e) => setFollowupResponse(e.target.value)}
                    placeholder="Participant response..."
                    style={{
                      width: "100%", background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6, padding: "10px 12px",
                      color: C.white, fontSize: 13,
                      outline: "none", resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={() => submitResponse(
                      `fq-${Date.now()}`,
                      activeFollowup,
                      followupResponse,
                      "followup",
                      responses.length
                    )}
                    disabled={submitting || !followupResponse.trim()}
                    style={{
                      marginTop: 8, width: "100%",
                      padding: "10px 0", borderRadius: 6,
                      background: C.teal, border: "none",
                      color: C.navyDeep, fontWeight: 700,
                      fontSize: 13, cursor: "pointer",
                      opacity: submitting || !followupResponse.trim() ? 0.5 : 1,
                    }}
                  >
                    {submitting ? "Saving..." : "Submit Follow-up Response →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Current standard question */}
          {currentQuestion && !isComplete && (
            <div style={{
              padding: "16px", borderRadius: 8,
              background: `${C.gold}0A`,
              border: `1px solid ${C.gold}33`,
              marginBottom: 16,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: C.gold,
                textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 8,
              }}>
                Question {currentIndex + 1} of {questions.length}
              </div>
              <div style={{
                fontSize: 14, color: C.white,
                lineHeight: 1.6, marginBottom: 14,
                fontWeight: 500,
              }}>
                {currentQuestion.text}
              </div>
              <textarea
                rows={4}
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Record participant response..."
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, padding: "10px 12px",
                  color: C.white, fontSize: 13,
                  outline: "none", resize: "vertical",
                  boxSizing: "border-box", marginBottom: 10,
                }}
              />
              <button
                onClick={() => submitResponse(
                  currentQuestion.id,
                  currentQuestion.text,
                  currentResponse,
                  "standard",
                  currentIndex
                )}
                disabled={submitting || !currentResponse.trim()}
                style={{
                  width: "100%", padding: "11px 0",
                  borderRadius: 6, background: C.gold,
                  border: "none", color: C.navyDeep,
                  fontWeight: 700, fontSize: 13,
                  cursor: submitting || !currentResponse.trim()
                    ? "not-allowed" : "pointer",
                  opacity: submitting || !currentResponse.trim() ? 0.5 : 1,
                }}
              >
                {submitting ? "Saving & Generating Follow-ups..." : "Submit Response →"}
              </button>
            </div>
          )}

          {/* Session complete */}
          {isComplete && (
            <div style={{
              padding: "16px", borderRadius: 8,
              background: "rgba(52,211,153,0.06)",
              border: `1px solid ${C.green}33`,
              marginBottom: 16, textAlign: "center",
            }}>
              <div style={{
                fontSize: 13, color: C.green,
                fontWeight: 600, marginBottom: 12,
              }}>
                All standard questions completed.
              </div>
              <button
                onClick={completeSession}
                disabled={completing}
                style={{
                  padding: "10px 24px", borderRadius: 6,
                  background: C.green, border: "none",
                  color: C.navyDeep, fontWeight: 700,
                  fontSize: 13, cursor: "pointer",
                  opacity: completing ? 0.6 : 1,
                }}
              >
                {completing ? "Completing..." : "Complete & Close Session →"}
              </button>
            </div>
          )}

          {/* Viewing completed session */}
          {questions.length === 0 && responses.length > 0 && (
            <div style={{
              padding: "10px 14px", borderRadius: 6,
              background: `${C.teal}11`,
              border: `1px solid ${C.teal}33`,
              color: C.teal, fontSize: 12, textAlign: "center",
            }}>
              Viewing completed session record
            </div>
          )}
        </div>
      )}
    </div>
  );
          }

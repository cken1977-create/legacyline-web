// Run: npx tsx scripts/person-check.ts. Checks the person-app schedule and nudges against the approved follow-up rules.
import { CHECK_IN_QUESTIONS, checkInSchedule, personNudges, coachingTips, NUDGES_ON } from "../lib/person";
let fails = 0; const t = (n: string, c: boolean) => { console.log((c ? "PASS " : "FAIL ") + n); if (!c) fails++; };
const enrolled = "2026-04-27T18:00:00Z"; const D = (n: number) => new Date(Date.parse(enrolled) + n * 864e5);
t("17 questions", CHECK_IN_QUESTIONS.length === 17);
t("income asked as ranges", !!CHECK_IN_QUESTIONS.find((q) => q.key === "income_range")?.choices?.every(([, l]) => /\$|rather/.test(l)));
t("nudges ship off", NUDGES_ON === (process.env.NEXT_PUBLIC_KAMILI_NUDGES === "1"));
const s1 = checkInSchedule(enrolled, [{ day: 0, submitted_at: enrolled, answers: { housing: "own_renting" } }], D(22));
t("day 30 not open at day 22", s1[1].status === "upcoming");
t("day 30 opens 7 days early", checkInSchedule(enrolled, [], D(23))[1].status === "open");
t("day 30 late at day 45", checkInSchedule(enrolled, [], D(45))[1].status === "late" && checkInSchedule(enrolled, [], D(45))[1].daysLate === 15);
const n = personNudges({ status: "data_collecting", consent: "none", schedule: checkInSchedule(enrolled, [], D(45)), reReview: { status: "due", next_due_at: D(30).toISOString() }, nextSteps: [], now: D(45) });
t("consent nudge first-tier", n[0].urgency === "now" && n.some((x) => x.kind === "consent"));
t("late check-in mentions early re-review at 14+", n.some((x) => x.id === "checkin-30" && /re-reviewed early/.test(x.body)));
t("re-review due shows grace end", n.some((x) => x.kind === "rereview" && /Grace period ends/.test(x.body)));
const p = personNudges({ status: "certified", consent: "granted", schedule: checkInSchedule(enrolled, [0, 30, 90, 180].map((day) => ({ day, submitted_at: D(day).toISOString(), answers: {} })), D(200)), reReview: { status: "paused" }, nextSteps: [], now: D(200) });
t("paused certification is a do-now nudge", p.some((x) => x.kind === "rereview" && x.urgency === "now" && /paused/.test(x.title)));
t("coaching tip from rent answer", coachingTips({ behind_rent: "1m_plus" })[0].includes("rent"));
console.log(fails ? `${fails} FAILED` : "all passed"); process.exit(fails ? 1 : 0);

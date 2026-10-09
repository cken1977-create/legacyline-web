import { redirect } from "next/navigation";

// Phase S: this page used to "sign in" any visitor regardless of password
// (it called a stub route that set a cookie unconditionally). The real
// participant sign-in, which verifies the password against legacyline-core,
// lives at /app/login.
export default function IndividualLoginRedirect() {
  redirect("/app/login");
}

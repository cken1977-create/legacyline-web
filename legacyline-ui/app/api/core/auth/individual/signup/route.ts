import { proxyLogin } from "../../../../../../lib/session-server";

// P1: login/signup goes through the BFF so the token lands in an httpOnly cookie.
export async function POST(req: Request) {
  return proxyLogin(req, "/auth/individual/signup", "individual");
}

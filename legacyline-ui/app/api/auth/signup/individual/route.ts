import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Temporary signup success
    const response = NextResponse.json(
      {
        success: true,
        user: {
          firstName,
          lastName,
          email,
        },
      },
      { status: 201 }
    );

    response.cookies.set("ll_user", email, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to create account." },
      { status: 500 }
    );
  }
}

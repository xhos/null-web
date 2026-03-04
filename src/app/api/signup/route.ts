import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: displayName,
      },
    });

    if (!signUpResponse?.user) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
    }

    const user = signUpResponse.user;

    const sessionResponse = await auth.api.signInEmail({
      body: { email, password },
    });

    if (!sessionResponse?.token) {
      console.error("Failed to create session after signup");
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

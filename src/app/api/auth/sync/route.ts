import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { User } from "@/contexts/auth-context";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, action }: { user?: User; action: "login" | "logout" } = body;

    const cookieStore = await cookies();

    if (action === "login" && user) {
      // Set server-side session cookie
      cookieStore.set("prinsur_user", JSON.stringify(user), {
        httpOnly: false, // Allow client-side access for compatibility
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      // Log successful login for monitoring
      console.log(`User ${user.email} session synced to server`);

      return NextResponse.json({ success: true, message: "Session synced" });
    } else if (action === "logout") {
      // Clear server-side session cookie
      cookieStore.delete("prinsur_user");

      // Log successful logout for monitoring
      console.log("User session cleared from server");

      return NextResponse.json({ success: true, message: "Session cleared" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action or missing user data" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Session sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

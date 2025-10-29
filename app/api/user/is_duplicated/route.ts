import { getToken } from "next-auth/jwt";
import {NextRequest, NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const supabase = createClient();

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const emails = (await supabase.from("user").select("*").eq("email", email)).data;

    if (emails) {
      return NextResponse.json({ content: emails.length === 0 });
    } else {
      return NextResponse.json({ content: "통신 실패" });
    }

  } catch (err) {
    if (err instanceof Error) {
      console.error("error:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

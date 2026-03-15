import { NextResponse } from "next/server";
import { clearAccessTokenCookie } from "@/lib/api/auth";

export async function POST() {
  const response = NextResponse.json({ data: { success: true } });
  clearAccessTokenCookie(response);
  return response;
}

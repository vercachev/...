import { NextResponse } from "next/server";

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function validateText(text: unknown, maxLength = 5000): string | null {
  if (typeof text !== "string" || !text.trim()) {
    return "Text is required";
  }
  if (text.length > maxLength) {
    return `Text must be under ${maxLength} characters`;
  }
  return null;
}

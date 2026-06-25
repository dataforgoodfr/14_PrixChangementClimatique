import { NextRequest, NextResponse } from "next/server";
import type { ContactFormData, GoogleScriptPayload } from "@/lib/types/contact";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const formData: ContactFormData = body;

    // Basic server-side validation
    if (!formData.name || !formData.email || !formData.message) {
      return NextResponse.json(
        { error: "nom, email et message sont requis." },
        { status: 400 },
      );
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.error("GOOGLE_SCRIPT_URL is not set.");
      return NextResponse.json(
        { error: "Server misconfiguration." },
        { status: 500 },
      );
    }

    // Convert ContactFormData (camelCase) to GoogleScriptPayload (snake_case)
    const gsPayload: GoogleScriptPayload = {
      nom: formData.name,
      situation: formData.userType,
      email: formData.email,
      message: formData.message,
      ville: formData.city,
    };

    const gsRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gsPayload),
    });

    const responseText = await gsRes.text();
    console.log("[Google Script] status:", gsRes.status);
    console.log("[Google Script] body:", responseText);

    if (!gsRes.ok) {
      throw new Error(`Google Script responded with status ${gsRes.status}`);
    }

    const gsData = JSON.parse(responseText);
    if (!gsData.success) {
      throw new Error(gsData.error || "Unknown error from Google Script.");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

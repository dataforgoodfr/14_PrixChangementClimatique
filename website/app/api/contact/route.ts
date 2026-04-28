import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nom,
      type_utilisateur,
      email,
      message,
      ville,
      assurance_climatique,
    } = body;

    // Basic server-side validation
    if (!nom || !email || !message) {
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

    const gsRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom,
        type_utilisateur,
        email,
        message,
        ville,
        assurance_climatique,
      }),
    });

    const responseText = await gsRes.text();
    console.log("[Google Script] status:", gsRes.status);
    console.log("[Google Script] body:", responseText);

    if (!gsRes.ok) {
      throw new Error(`Google Script responded with status ${gsRes.status}`);
    }

    const gsData = JSON.parse(responseText);
    if (!gsData.success) {
      return NextResponse.json({ error: gsData.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Contact route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

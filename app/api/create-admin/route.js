import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    const { name, email, password } = await req.json();

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();
    const normalizedName = String(name || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (normalizedPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });

    await adminDb.collection("admins").doc(userRecord.uid).set({
      name: normalizedName || null,
      email: normalizedEmail,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Failed to create admin" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import twilio from "twilio";

// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER;
// Twilio Client
const client = twilio(accountSid, authToken);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { latitude, longitude, emergencyContact } = body;

    if (!latitude || !longitude || !emergencyContact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Debug: ensure Twilio credentials are present on the server
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Missing Twilio env vars", {
        accountSid: !!accountSid,
        authToken: !!authToken,
        twilioPhoneNumber: !!twilioPhoneNumber,
      });
      return NextResponse.json({ error: "Twilio credentials not configured on server" }, { status: 500 });
    }

    // Send SOS Alert via Twilio SMS
    const message = await client.messages.create({
      body: `🚨 Emergency Alert! 🚨\nLocation: https://www.google.com/maps?q=${latitude},${longitude}`,
      from: twilioPhoneNumber,
      to: emergencyContact,
    });

    console.log("Twilio Message SID:", message.sid);

    return NextResponse.json({ message: "SOS Sent Successfully!" }, { status: 200 });
  } catch (error) {
    // Log full error for server-side debugging
    console.error("Error sending SOS via Twilio:", error);

    // Return detailed error information for debugging (remove/obfuscate in production)
    const errMessage = (error as any)?.message || String(error);
    const errCode = (error as any)?.code;
    const errStatus = (error as any)?.status;
    const details: Record<string, any> = {};
    if (errCode) details.code = errCode;
    if (errStatus) details.status = errStatus;
    if ((error as any)?.moreInfo) details.moreInfo = (error as any).moreInfo;

    return NextResponse.json(
      { error: "Failed to send SOS via Twilio.", message: errMessage, details },
      { status: 500 },
    );
  }
}

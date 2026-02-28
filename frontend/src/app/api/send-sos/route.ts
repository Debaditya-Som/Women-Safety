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

    // Send SOS Alert via Twilio SMS
    const message = await client.messages.create({
      body: `🚨 Emergency Alert! 🚨\nLocation: https://www.google.com/maps?q=${latitude},${longitude}`,
      from: twilioPhoneNumber,
      to: emergencyContact,
    });

    console.log("Twilio Message SID:", message.sid);

    return NextResponse.json({ message: "SOS Sent Successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error sending SOS via Twilio:", error);
    return NextResponse.json({ error: "Failed to send SOS via Twilio." }, { status: 500 });
  }
}

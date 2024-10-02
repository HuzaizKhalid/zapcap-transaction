import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false,
  },
};

const zapcapApiKey = process.env.ZAPCAP_API_KEY;

export async function POST(request) {
  let tempFilePath = "";
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString("hex");
    const fileExtension = path.extname(file.name);
    const fileName = `upload-${uniqueSuffix}${fileExtension}`;

    // Use os.tmpdir() to get the correct temporary directory for the operating system
    tempFilePath = path.join(os.tmpdir(), fileName);

    await writeFile(tempFilePath, buffer);

    console.log("Video file saved:", tempFilePath);

    console.log("Sending video to Zapcap API...");
    const response = await fetch("https://zapcap.ai/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${zapcapApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: buffer.toString("base64"),
      }),
    });

    console.log("Zapcap API response status:", response.status);

    const result = await response.text();
    console.log("Zapcap API raw response:", result);

    if (!response.ok) {
      throw new Error("Zapcap API request failed");
    }

    // Ensure the response is valid JSON before parsing
    const transcriptionData = JSON.parse(result);
    return NextResponse.json({
      transcription: transcriptionData.transcription,
    });
  } catch (error) {
    console.error("Error in the upload route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Clean up: delete the temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log("Temporary file deleted:", tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
  }
}

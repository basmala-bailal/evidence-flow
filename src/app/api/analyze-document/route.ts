import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requirementType = formData.get("requirementType") as string;
    const org = formData.get("declaredOrganisation") as string;
    const activity = formData.get("declaredActivity") as string;
    const responsiblePerson = formData.get("declaredResponsiblePerson") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    const mimeType = getMimeType(file);

    // Construct the prompt based on requirement type
    let prompt = "";
    if (requirementType === "registration") {
      prompt = `
You are reviewing a registration document for a grant application.
The applicant declared their organisation name as: "${org}".

Task:
1. Extract the official organisation name from this document.
2. Compare it to the declared name: "${org}".
3. If it matches (or is a minor formatting variation), status is "satisfied".
4. If it differs (e.g. Community Workshop C vs Community Workshop B), status is "mismatch".

Return ONLY a JSON object with this exact structure (no markdown code blocks, no backticks):
{
  "status": "satisfied" | "mismatch",
  "documentValue": "The exact name found in the document",
  "reason": "Brief explanation of your finding"
}`;
    } else if (requirementType === "activity-plan") {
      prompt = `
You are reviewing an activity plan document.
The declared activity is: "${activity}".

Task:
1. Verify if this document describes an activity plan or proposal related to "${activity}".
2. If it does, status is "satisfied".
3. If completely unrelated or wrong, status is "mismatch".

Return ONLY a JSON object with this exact structure (no markdown code blocks, no backticks):
{
  "status": "satisfied" | "mismatch",
  "documentValue": "Brief summary of the activity found in the document",
  "reason": "Brief explanation of your finding"
}`;
    } else if (requirementType === "responsible-person-signoff") {
      prompt = `
You are reviewing a signoff/consent document.
The declared responsible person is: "${responsiblePerson}".

Task:
1. Verify if this document is signed by or explicitly mentions "${responsiblePerson}" as the responsible party.
2. If it does, status is "satisfied".
3. If it is missing signatures or signed by someone else, status is "mismatch".

Return ONLY a JSON object with this exact structure (no markdown code blocks, no backticks):
{
  "status": "satisfied" | "mismatch",
  "documentValue": "The name of the person who signed/authorized the document",
  "reason": "Brief explanation of your finding"
}`;
    } else {
      return NextResponse.json({ error: "Unknown requirement type" }, { status: 400 });
    }

    // Attempt Gemini 3.1 Flash Lite (the exact 3.1 Flash model id on the API), with fallback to 2.5 Flash
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-2.5-flash"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);
        responseText = result.response.text();
        if (responseText) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying fallback:`, err.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All candidate models failed to generate response.");
    }

    // Extract JSON reliably
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Invalid model response format: ${responseText.slice(0, 150)}`);
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze document" },
      { status: 500 }
    );
  }
}

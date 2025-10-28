import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      process.env.GOOGLE_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `[이미지]
                  You are an expert in objective facial feature analysis. Look at the person in the attached image.
                    Provide a detailed, clinical breakdown of their facial features. Focus only on observable geometry, shape, and structure.
                    - **Face Shape:** Describe the overall shape of the face (e.g., round, oval) and the prominence of the cheeks and jawline.
                    - **Eyes:**
    - **Shape:** Describe the shape of the eyes (e.g., narrow, almond, round).
    - **Eyelids:** Describe the eyelid structure (e.g., single eyelid, double eyelid).
    - **Eyebrows:** Describe the shape, thickness, and arch of the eyebrows.
    - **Nose:** Describe the shape of the nose bridge (e.g., straight, sloped) and the shape of the nose tip (e.g., rounded, pointed).
    - **Mouth and Jaw:**
    - **Lips:** Describe the thickness of the lips (e.g., full, thin).
    - **Chin/Jaw:** Describe the shape of the chin and the angle of the jawline.
    - **Other Observable Features:** Note any other distinct, observable features (e.g., presence of dimples when smiling, specific hair characteristics).
  **Strictly avoid:** Do NOT make any inferences about age, gender, race, ethnicity, or subjective attractiveness. Confine your analysis purely to the physical morphology.
      Say the result in Korean.` },
                { inline_data: { mime_type: "image/png", data: image.split(",")[1] } },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    console.log(data);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "분석 실패";
    return NextResponse.json({ result: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "분석 실패" }, { status: 500 });
  }
}

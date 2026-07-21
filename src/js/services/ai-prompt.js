/**
 * Modul Layanan AI untuk Image Prompt Builder
 * Berinteraksi dengan Vercel Serverless Function (/api/generate-prompt)
 */

/**
 * Fungsi untuk menghasilkan prompt gambar
 * @param {Object} params Parameter dari form UI
 * @returns {Promise<string>} Hasil prompt bahasa Inggris
 */
export async function generateImagePrompt(params) {
  try {
    const response = await fetch('/api/generate-prompt', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

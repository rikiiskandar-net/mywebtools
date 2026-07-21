/**
 * Modul Layanan AI untuk Image Prompt Builder
 * Berinteraksi dengan Hugging Face Inference API
 */

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
// Menggunakan model Zephyr yang bebas lisensi dan stabil di Inference API
const MODEL_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

/**
 * Fungsi untuk menghasilkan prompt gambar dari Hugging Face
 * @param {Object} params Parameter dari form UI
 * @returns {Promise<string>} Hasil prompt bahasa Inggris
 */
export async function generateImagePrompt(params) {
  if (!HF_API_KEY) {
    throw new Error("API Key Hugging Face tidak ditemukan. Harap atur VITE_HF_API_KEY di .env");
  }

  const { baseIdea, visualStyle, cameraLens, lighting, aspectRatio } = params;

  const systemMessage = `Ubah ide dasar dan parameter pilihan user menjadi prompt gambar bahasa Inggris yang hyper-realistic, kaya detail tekstur, pencahayaan, dan parameter kamera untuk generator gambar AI seperti Midjourney/Flux. Kembalikan HANYA teks prompt bahasa Inggrisnya saja. Jangan tambahkan penjelasan apapun, jangan gunakan markdown formatting, hanya teks murni.`;

  let userMessage = `Ide dasar: ${baseIdea}\n`;
  if (visualStyle) userMessage += `Gaya Visual: ${visualStyle}\n`;
  if (cameraLens) userMessage += `Kamera & Lensa: ${cameraLens}\n`;
  if (lighting) userMessage += `Pencahayaan: ${lighting}\n`;
  if (aspectRatio) userMessage += `Aspect Ratio: ${aspectRatio}\n`;

  // Format pesan untuk Zephyr
  const payload = {
    inputs: `<|system|>\n${systemMessage}</s>\n<|user|>\n${userMessage}</s>\n<|assistant|>\n`,
    parameters: {
      max_new_tokens: 200,
      return_full_text: false,
      temperature: 0.7,
      top_p: 0.9,
    },
    options: {
      wait_for_model: true
    }
  };

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // HF API returns an array with generated_text
    let result = "";
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      result = data[0].generated_text;
    } else {
      throw new Error("Format respons API tidak valid");
    }

    return result.trim();
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

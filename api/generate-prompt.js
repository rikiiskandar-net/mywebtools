export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const HF_API_KEY = process.env.VITE_HF_API_KEY;
  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'API Key Hugging Face tidak ditemukan di Environment Variables server.' });
  }

  const { baseIdea, visualStyle, cameraLens, lighting, aspectRatio } = req.body;

  const systemMessage = `Ubah ide dasar dan parameter pilihan user menjadi prompt gambar bahasa Inggris yang hyper-realistic, kaya detail tekstur, pencahayaan, dan parameter kamera untuk generator gambar AI seperti Midjourney/Flux. Kembalikan HANYA teks prompt bahasa Inggrisnya saja. Jangan tambahkan penjelasan apapun, jangan gunakan markdown formatting, hanya teks murni.`;

  let userMessage = `Ide dasar: ${baseIdea}\n`;
  if (visualStyle) userMessage += `Gaya Visual: ${visualStyle}\n`;
  if (cameraLens) userMessage += `Kamera & Lensa: ${cameraLens}\n`;
  if (lighting) userMessage += `Pencahayaan: ${lighting}\n`;
  if (aspectRatio) userMessage += `Aspect Ratio: ${aspectRatio}\n`;

  const MODEL_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

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
      const errorData = await response.text();
      console.error("HF API Error:", response.status, errorData);
      return res.status(response.status).json({ error: `Hugging Face API Error: ${response.status}` });
    }

    const data = await response.json();
    
    let result = "";
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      result = data[0].generated_text;
    } else {
      return res.status(500).json({ error: "Format respons API tidak valid" });
    }

    return res.status(200).json({ text: result.trim() });
  } catch (error) {
    console.error("Serverless API Error:", error);
    return res.status(500).json({ error: "Gagal memproses permintaan ke AI." });
  }
}

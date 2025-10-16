export default async function handler(req, res) {
  try {
    const response = await fetch("https://generich.my.id/apivote");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data API" });
  }
}

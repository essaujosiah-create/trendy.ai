"use client";

import { useState } from "react";

type Item = { number: number; caption: string; hashtags: string; };

export default function HomePage() {
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("Fun & casual");
  const [languages, setLanguages] = useState<string[]>(["Kiswahili", "English"]);
  const [offers, setOffers] = useState("");
  const [includeTrending, setIncludeTrending] = useState(true);
  const [count, setCount] = useState(30);
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleLang = (l: string) => {
    setLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  async function generate() {
    setLoading(true);
    setError(null);
    setItems([]);
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName, description, platform, tone, languages, offers,
          includeTrending, count, niche
        })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Request failed");
      setItems(data.items || []);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const text = items.map(i => `${i.number}. ${i.caption}\n${i.hashtags}`).join("\n\n");
    navigator.clipboard.writeText(text);
  }

  function downloadCSV() {
    const rows = [["Number", "Caption", "Hashtags"], ...items.map(i => [String(i.number), i.caption, i.hashtags])];
    const csv = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `captions_${businessName || "trendy"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function escapeCSV(val: string) {
    if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
    return val;
  }

  const disabled = !businessName || !description || languages.length === 0;

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <img src="/logo.svg" alt="trendy.ai logo" style={{ height: 56, marginBottom: 12 }} />
        <h1 style={{ margin: 0, color: "#1a1a1a" }}>trendy.ai — Social Caption Agent</h1>
        <p style={{ marginTop: 8, color: "#444" }}>
          Generate bilingual, sales-driven captions for Tanzanian SMEs. Free demo. Fast delivery.
        </p>

        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Business name</label>
            <input style={styles.input} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Yala Cleaners" />
          </div>
          <div>
            <label style={styles.label}>Main platform</label>
            <select style={styles.input} value={platform} onChange={e => setPlatform(e.target.value)}>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>TikTok</option>
              <option>WhatsApp</option>
              <option>Twitter/X</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Describe your products/services</label>
            <textarea style={styles.textarea} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Eco-friendly cleaning services, laundry pick-up and delivery, office cleaning packages..." />
          </div>
          <div>
            <label style={styles.label}>Tone</label>
            <select style={styles.input} value={tone} onChange={e => setTone(e.target.value)}>
              <option>Fun & casual</option>
              <option>Professional & formal</option>
              <option>Luxury & elegant</option>
              <option>Energetic & youthful</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Languages</label>
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <label><input type="checkbox" checked={languages.includes("Kiswahili")} onChange={() => toggleLang("Kiswahili")} /> Kiswahili</label>
              <label><input type="checkbox" checked={languages.includes("English")} onChange={() => toggleLang("English")} /> English</label>
            </div>
          </div>
          <div>
            <label style={styles.label}>Niche (optional)</label>
            <input style={styles.input} value={niche} onChange={e => setNiche(e.target.value)} placeholder="Salon, electronics, restaurant, cleaning..." />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={styles.label}>Offers/hashtags to include (optional)</label>
            <input style={styles.input} value={offers} onChange={e => setOffers(e.target.value)} placeholder="10% off this week, free delivery, #DarEsSalaam" />
          </div>
          <div>
            <label style={styles.label}>Count</label>
            <input type="number" style={styles.input} min={5} max={60} value={count} onChange={e => setCount(parseInt(e.target.value || "30"))} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={includeTrending} onChange={e => setIncludeTrending(e.target.checked)} />
            <span>Include trending hashtags</span>
          </div>
        </div>

        <button style={disabled ? styles.buttonDisabled : styles.button} onClick={generate} disabled={disabled || loading}>
          {loading ? "Generating..." : "Generate Captions"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        {!!items.length && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <button style={styles.secondary} onClick={copyAll}>Copy All</button>
              <button style={styles.secondary} onClick={downloadCSV}>Download CSV</button>
            </div>
            <ol>
              {items.map(it => (
                <li key={it.number} style={{ marginBottom: 12 }}>
                  <div><strong>Caption:</strong> {it.caption}</div>
                  <div><strong>Hashtags:</strong> {it.hashtags}</div>
                </li>
              ))}
            </ol>
          </div>
        )}

        <footer style={{ marginTop: 32, color: "#666", fontSize: 12 }}>
          Built for Dar es Salaam SMEs — no server-side storage in this demo.
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#ff4f70", padding: 16 },
  card: { background: "white", maxWidth: 900, width: "100%", padding: 24, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 },
  label: { fontWeight: 600 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", resize: "vertical" },
  button: { marginTop: 16, padding: "12px 16px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 8, cursor: "pointer" },
  buttonDisabled: { marginTop: 16, padding: "12px 16px", background: "#a6a6a6", color: "white", border: "none", borderRadius: 8, cursor: "not-allowed" },
  secondary: { padding: "8px 12px", background: "#fff0f3", color: "#ff4f70", border: "1px solid #ffc2d1", borderRadius: 8, cursor: "pointer" }
};

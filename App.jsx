import { useState, useMemo, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import {
  Search, Star, MessageCircle, Phone, Calendar, X, Loader2,
  Wrench, Zap, Sparkles, Baby, GraduationCap, Languages, Car, Truck,
  Scissors, Hammer, PawPrint, Wrench as Mechanic, PaintBucket, KeyRound,
  HeartHandshake, Plus,
} from "lucide-react";

const CATEGORIES = [
  { id: "plumber", label: "Plumber", icon: Wrench },
  { id: "electrician", label: "Electrician", icon: Zap },
  { id: "cleaner", label: "Cleaner", icon: Sparkles },
  { id: "painter", label: "Painter", icon: PaintBucket },
  { id: "gardener", label: "Gardener", icon: Scissors },
  { id: "locksmith", label: "Locksmith", icon: KeyRound },
  { id: "carpenter", label: "Carpenter", icon: Hammer },
  { id: "babysitter", label: "Babysitter", icon: Baby },
  { id: "tutor", label: "Tutor", icon: GraduationCap },
  { id: "caregiver", label: "Caregiver", icon: HeartHandshake },
  { id: "petsitter", label: "Pet Sitter", icon: PawPrint },
  { id: "driver", label: "Driver", icon: Car },
  { id: "mover", label: "Moving Service", icon: Truck },
  { id: "translator", label: "Translator", icon: Languages },
  { id: "mechanic", label: "Mechanic", icon: Mechanic },
];

// Keyword-based intent matching for the search bar.
// This is a placeholder for real AI-powered matching (see SETUP_GUIDE.md Part 7).
const INTENT_MAP = [
  { keywords: ["sink", "leak", "pipe", "toilet", "plumb"], id: "plumber" },
  { keywords: ["power", "wiring", "electric", "outlet", "light"], id: "electrician" },
  { keywords: ["clean", "maid"], id: "cleaner" },
  { keywords: ["paint"], id: "painter" },
  { keywords: ["garden", "lawn", "plant"], id: "gardener" },
  { keywords: ["lock", "key", "locked out"], id: "locksmith" },
  { keywords: ["carpenter", "wood", "furniture"], id: "carpenter" },
  { keywords: ["babysit", "kids", "children", "child care"], id: "babysitter" },
  { keywords: ["tutor", "spanish teacher", "teach", "lesson", "learn"], id: "tutor" },
  { keywords: ["elderly", "caregiver", "care for my"], id: "caregiver" },
  { keywords: ["pet", "dog", "cat sitter"], id: "petsitter" },
  { keywords: ["taxi", "ride", "driver"], id: "driver" },
  { keywords: ["mov", "relocation"], id: "mover" },
  { keywords: ["translat", "interpret"], id: "translator" },
  { keywords: ["car", "mechanic", "engine"], id: "mechanic" },
];

function matchCategory(text) {
  const t = text.toLowerCase();
  for (const rule of INTENT_MAP) {
    if (rule.keywords.some((k) => t.includes(k))) return rule.id;
  }
  return null;
}

const LANG_OPTIONS = ["EN", "ES", "AR", "FR"];
const STATUS_OPTIONS = ["Available Now", "Busy", "Offline"];
const statusColor = (s) => (s === "Available Now" ? "#1DA968" : s === "Busy" ? "#E8A93B" : "#94A3B8");

function BecomeProForm({ onDone }) {
  const [form, setForm] = useState({
    name: "", category: "plumber", description: "", years: "", price: "€€",
    phone: "", whatsapp: "", serviceArea: "", workingHours: "", availability: "Available Now",
    langs: ["EN"],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleLang = (l) => {
    setForm((f) => ({
      ...f,
      langs: f.langs.includes(l) ? f.langs.filter((x) => x !== l) : [...f.langs, l],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "professionals"), {
        ...form,
        years: Number(form.years) || 0,
        rating: null,
        reviews: 0,
        approved: false, // admin approval step — see SETUP_GUIDE.md Part 6
        createdAt: serverTimestamp(),
      });
      onDone();
    } catch (err) {
      setError("Could not save. Check your Firebase setup — see SETUP_GUIDE.md.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0F4CA3]";
  const labelCls = "text-xs font-semibold text-slate-500";

  return (
    <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className={labelCls}>Full name / business name</label>
        <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Marcos Rodríguez" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Years of experience</label>
          <input className={inputCls} type="number" min="0" value={form.years} onChange={(e) => setForm({ ...form, years: e.target.value })} placeholder="5" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What you do, your specialties..." />
      </div>
      <div>
        <label className={labelCls}>Languages spoken</label>
        <div className="flex gap-2 mt-1">
          {LANG_OPTIONS.map((l) => (
            <button type="button" key={l} onClick={() => toggleLang(l)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${form.langs.includes(l) ? "bg-[#0F4CA3] text-white border-[#0F4CA3]" : "border-slate-200 text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Price range</label>
          <select className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}>
            <option value="€">€ Budget</option>
            <option value="€€">€€ Standard</option>
            <option value="€€€">€€€ Premium</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Availability</label>
          <select className={inputCls} value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>Service area</label>
        <input className={inputCls} value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} placeholder="Cox, Orihuela, Callosa de Segura..." />
      </div>
      <div>
        <label className={labelCls}>Working hours</label>
        <input className={inputCls} value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="Mon–Sat, 8am–7pm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 00 00 00" />
        </div>
        <div>
          <label className={labelCls}>WhatsApp (optional)</label>
          <input className={inputCls} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+34 600 00 00 00" />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[11px] text-slate-400">
        Your profile will be reviewed before it appears publicly.
      </p>
      <button type="submit" disabled={saving}
        className="w-full bg-[#0F4CA3] text-white text-sm font-semibold py-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-60">
        {saving ? <Loader2 size={15} className="animate-spin" /> : null}
        {saving ? "Submitting..." : "Submit for review"}
      </button>
    </form>
  );
}

export default function App() {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connError, setConnError] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "professionals"),
        (snap) => {
          setPros(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((p) => p.approved));
          setLoading(false);
        },
        (err) => { console.error(err); setConnError(true); setLoading(false); }
      );
      return () => unsub();
    } catch (err) {
      console.error(err); setConnError(true); setLoading(false);
    }
  }, []);

  const matched = useMemo(() => (query.trim() ? matchCategory(query) : null), [query]);
  const effectiveCategory = activeCategory || matched;

  const results = useMemo(() => {
    if (!effectiveCategory) return pros;
    return pros.filter((p) => p.category === effectiveCategory);
  }, [pros, effectiveCategory]);

  return (
    <div className="min-h-screen w-full bg-white">
      <style>{`.card-hover { transition: transform .15s ease, box-shadow .15s ease; } .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 32px -12px rgba(15,76,163,0.18); }`}</style>

      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F4CA3] flex items-center justify-center text-white font-bold text-sm">L</div>
          <span className="text-lg font-extrabold text-[#0F4CA3] tracking-tight">LocalMate</span>
        </div>
        <button onClick={() => { setShowForm(true); setJustSubmitted(false); }} className="bg-[#0F4CA3] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5">
          <Plus size={14} /> Become a Pro
        </button>
      </nav>

      <section className="px-6 sm:px-10 pt-14 pb-10 bg-gradient-to-b from-[#EAF1FB] to-white text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 max-w-2xl mx-auto leading-tight tracking-tight">
          What do you need today?
        </h1>
        <p className="text-slate-500 mt-3 max-w-md mx-auto text-sm sm:text-base">
          Just type naturally — "my sink is leaking" or "I need a Spanish teacher."
        </p>
        <div className="mt-7 max-w-xl mx-auto bg-white rounded-full shadow-lg border border-slate-100 p-1.5 flex items-center gap-2">
          <Search size={19} className="text-slate-400 ml-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveCategory(null); }}
            placeholder="I need a plumber..."
            className="flex-1 py-2.5 outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
          <button className="bg-[#0F4CA3] text-white text-sm font-semibold px-5 py-2.5 rounded-full">Search</button>
        </div>
      </section>

      <section className="px-6 sm:px-10 py-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Browse by category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = activeCategory === c.id;
            return (
              <button key={c.id} onClick={() => { setActiveCategory(active ? null : c.id); setQuery(""); }}
                className={`flex flex-col items-center gap-2 shrink-0 w-20 py-3 rounded-2xl border ${active ? "bg-[#0F4CA3] border-[#0F4CA3] text-white" : "bg-white border-slate-100 text-slate-600"}`}>
                <Icon size={20} />
                <span className="text-[11px] font-semibold text-center leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-6 sm:px-10 pb-16">
        {connError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            Couldn't connect to the database. Check your Firebase config in <code>.env</code> — see SETUP_GUIDE.md.
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {effectiveCategory ? CATEGORIES.find((c) => c.id === effectiveCategory)?.label + "s near you" : "Professionals"}
          </h2>
          <span className="text-xs text-slate-400">{results.length} found</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-lg font-bold text-slate-800">No one here yet</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to list your services, or try another category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((p) => (
              <div key={p.id} onClick={() => setSelected(p)} className="card-hover bg-white border border-slate-100 rounded-2xl p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EAF1FB] flex items-center justify-center text-lg font-bold text-[#0F4CA3]">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{p.category}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: statusColor(p.availability) }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(p.availability) }} />
                    {p.availability}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  {p.rating ? (
                    <span className="inline-flex items-center gap-1"><Star size={12} className="fill-[#F5A623] text-[#F5A623]" /> {p.rating} ({p.reviews})</span>
                  ) : (
                    <span className="text-slate-400">No reviews yet</span>
                  )}
                  <span>{p.years} yrs exp</span>
                  <span className="font-mono text-slate-400">{p.price}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(p.langs || []).map((l) => (
                    <span key={l} className="text-[10px] font-semibold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">{l}</span>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-[#0F4CA3] text-white text-xs font-semibold py-2 rounded-full">Book</button>
                  <button className="p-2 rounded-full border border-slate-200"><MessageCircle size={14} className="text-slate-500" /></button>
                  <a href={`tel:${(p.phone || "").replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-full border border-slate-200"><Phone size={14} className="text-slate-500" /></a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1 rounded-full bg-slate-50"><X size={16} /></button>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#EAF1FB] flex items-center justify-center text-xl font-bold text-[#0F4CA3]">{selected.name?.[0]?.toUpperCase()}</div>
              <div>
                <p className="font-bold text-slate-900">{selected.name}</p>
                <p className="text-xs text-slate-400 capitalize">{selected.category} · {selected.years} years experience</p>
              </div>
            </div>
            {selected.description && <p className="text-sm text-slate-600 mt-3">{selected.description}</p>}
            <div className="text-xs text-slate-500 mt-3 space-y-1">
              {selected.serviceArea && <p>📍 {selected.serviceArea}</p>}
              {selected.workingHours && <p>🕐 {selected.workingHours}</p>}
            </div>
            <div className="flex gap-3 mt-5">
              <button className="flex-1 bg-[#0F4CA3] text-white text-sm font-semibold py-3 rounded-full flex items-center justify-center gap-2">
                <Calendar size={15} /> Book now
              </button>
              <button className="px-4 rounded-full border border-slate-200 flex items-center justify-center"><MessageCircle size={16} className="text-slate-600" /></button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-1 rounded-full bg-slate-50"><X size={16} /></button>
            {justSubmitted ? (
              <div className="text-center py-6">
                <p className="text-lg font-bold text-slate-900">Thanks!</p>
                <p className="text-sm text-slate-500 mt-1">Your profile is pending review and will appear once approved.</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-4">List your services</h2>
                <BecomeProForm onDone={() => setJustSubmitted(true)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

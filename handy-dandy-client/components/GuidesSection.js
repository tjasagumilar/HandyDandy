"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // ⬅️ NOVO
import GuideList from "./GuideList";
import GuideAddNew from "./GuideAddNew";

export default function GuidesSection({ showNotification, variant = "baseline" }) {
  const searchParams = useSearchParams();
  const openFromCTA = searchParams.get("open") === "add-guide";

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);

  // ⬅️ tukaj je glavna fora: inicialno stanje vzamemo iz URL-ja
  const [showAddForm, setShowAddForm] = useState(openFromCTA);

  const [guides, setGuides] = useState([]);

  const fetchGuides = async () => {
    try {
      const res = await fetch("/api/guides");
      const data = await res.json();
      setGuides(data);

      const categories = Array.from(
        new Set(data.map((g) => g.category).filter(Boolean))
      );
      setAvailableCategories(categories);
    } catch {
      showNotification("Napaka pri pridobivanju vodičev", true);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Če se query v URL-ju spremeni (npr. user ročno odstrani ?open=...),
  // posodobimo showAddForm
  useEffect(() => {
    setShowAddForm(openFromCTA);
  }, [openFromCTA]);

  const handleNewGuideAdded = (newGuide) => {
    setGuides((prev) => [newGuide, ...prev]);
    if (newGuide.category && !availableCategories.includes(newGuide.category)) {
      setAvailableCategories((prev) => [...prev, newGuide.category]);
    }
  };

  return (
    <section className="p-6" id="guides">
      <h2 className="text-2xl font-bold mb-4">Guides</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
          placeholder="Search by title or category"
        />

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">All</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Gumb je ostal isti – le variant logiko imaš že dodano */}
          <button
            onClick={() => setShowAddForm(true)}
            className={
              variant === "cta"
                ? "px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
                : "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            }
            title="Dodaj nov vodič"
          >
            {variant === "cta" ? "Dodaj nov vodič" : "+"}
          </button>
        </div>
      </div>

      <GuideList
        guides={guides}
        searchTerm={searchTerm}
        selectedCategory={categoryFilter}
        showNotification={showNotification}
      />

      {showAddForm && (
        <GuideAddNew
          onClose={() => setShowAddForm(false)}
          onGuideAdded={handleNewGuideAdded}
          showNotification={showNotification}
        />
      )}
    </section>
  );
}

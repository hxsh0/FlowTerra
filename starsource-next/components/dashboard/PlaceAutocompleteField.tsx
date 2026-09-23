"use client";
import { useEffect, useRef, useState } from "react";
import { hasGoogleMapsApiKey, loadPlacesLibrary } from "@/lib/google-maps-loader";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

interface Suggestion {
  placeId: string;
  text: string;
}

/**
 * Location input backed by the Places API (New) Autocomplete Data API.
 * Renders our own dropdown (instead of Google's <gmp-place-autocomplete>
 * element) so it matches the rest of the niche-configurator form.
 */
export function PlaceAutocompleteField({ value, onChange, placeholder, required }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const placesLibRef = useRef<google.maps.PlacesLibrary | null>(null);
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!hasGoogleMapsApiKey()) return;
    let cancelled = false;
    loadPlacesLibrary().then((lib) => {
      if (!cancelled) placesLibRef.current = lib;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchSuggestions = async (input: string) => {
    const lib = placesLibRef.current;
    if (!lib || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (!sessionRef.current) {
      sessionRef.current = new lib.AutocompleteSessionToken();
    }
    const requestId = ++requestIdRef.current;
    try {
      const { suggestions: results } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: sessionRef.current,
        includedPrimaryTypes: ["locality", "administrative_area_level_1", "administrative_area_level_2", "country", "postal_code"],
      });
      if (requestId !== requestIdRef.current) return; // a newer keystroke's response already landed
      const next = (results ?? [])
        .map((r) => r.placePrediction)
        .filter((p): p is NonNullable<typeof p> => p != null)
        .map((p) => ({ placeId: p.placeId, text: p.text.text }));
      setSuggestions(next);
      setOpen(next.length > 0);
    } catch {
      if (requestId === requestIdRef.current) setSuggestions([]);
    }
  };

  const handleInput = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  };

  const selectSuggestion = (s: Suggestion) => {
    onChange(s.text);
    setSuggestions([]);
    setOpen(false);
    sessionRef.current = null; // billed as one session; start a fresh one next time
  };

  return (
    <div className="place-autocomplete" ref={containerRef}>
      <input
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="place-autocomplete-list">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button type="button" onClick={() => selectSuggestion(s)}>
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

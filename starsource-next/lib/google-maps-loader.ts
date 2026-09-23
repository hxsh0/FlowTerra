// ============================================================
// StarSource — shared Google Maps JS API loader
//
// A single Loader instance is reused across every component that needs
// the Maps or Places libraries, so the script tag is only injected once
// no matter how many maps/autocomplete fields mount.
// ============================================================
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

let optionsSet = false;

function ensureOptionsSet(): void {
  if (!optionsSet) {
    setOptions({ key: API_KEY, v: "weekly" });
    optionsSet = true;
  }
}

export function hasGoogleMapsApiKey(): boolean {
  return API_KEY.length > 0;
}

export function loadMapsLibrary(): Promise<google.maps.MapsLibrary> {
  ensureOptionsSet();
  return importLibrary("maps");
}

export function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  ensureOptionsSet();
  return importLibrary("places");
}

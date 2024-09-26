import { PostgrestError } from "@supabase/postgrest-js";
import { LatLon } from "./lat-lon";

export function handleError(title: string, error: PostgrestError | null): void {
    if (error) {
        console.error(title, error.message);
        throw error;
    }
}

export enum SourceType {
    URL = 'url',
    STORED = 'stored',
    FLICKR = 'flickr'
}

// https://rosettacode.org/wiki/Haversine_formula#TypeScript
export function calculateDistanceInKm(starting: LatLon, destination: LatLon): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(destination.latitude - starting.latitude);
    const dLon = deg2rad(destination.longitude - starting.longitude);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(starting.latitude)) * Math.cos(deg2rad(destination.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = Math.round(R * c); // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
}

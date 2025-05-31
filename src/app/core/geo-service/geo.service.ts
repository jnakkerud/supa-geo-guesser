import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LatLon } from "../lat-lon";

export interface GeoAddress {
    placeId: string;
    description: string;
    countryCode: string;
    country: string; // full country name
    state?: string;
    locality?: string; // city || town || village
}

export function simpleGeoAddressFormat(address: GeoAddress): string {
    return `${address.locality ? address.locality + ', ' : ''}${address.state ? address.state + ', ' : ''}${address.country}`;
}   
 
class MappedGeoAddress {
    location: string | null = null; // lat/lon as string
    constructor(latLon: LatLon, public address: GeoAddress) {    
        this.location = `${latLon.latitude},${latLon.longitude}`;
    }

    equals(latLon: LatLon): boolean {
        return this.location === `${latLon.latitude},${latLon.longitude}`;
    }
}

// GeoService is used to resolve lat/lon to a place name   
@Injectable({providedIn: 'root'})
export class GeoService {
     lastAddressLookup: MappedGeoAddress | null = null;

    constructor(private httpClient: HttpClient) { }
    
      // https://nominatim.org/release-docs/latest/api/Reverse/
      public lookup(location: LatLon): Promise<GeoAddress> {

        if (this.lastAddressLookup && this.lastAddressLookup.equals(location)) {
            return new Promise((resolve) => {resolve(this.lastAddressLookup!.address)});   
        }

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`;
        return new Promise<GeoAddress>((resolve) => {
            this.httpClient.get(url)
            .subscribe((res: any) => {
                const result: GeoAddress = {
                    placeId: res.place_id,
                    description: res.display_name,
                    countryCode: res.address?.country_code ?? '',
                    country: res.address?.country ?? '',
                    state: res.address?.state ?? null,
                    locality: res.address?.city ?? res.address?.town ?? res.address?.village ?? null
                }
                console.log(`lat=${location.latitude}&lon=${location.longitude}`, result)
                this.lastAddressLookup = new MappedGeoAddress(location, result);
                resolve(result);
            });        
        });
    }      
}
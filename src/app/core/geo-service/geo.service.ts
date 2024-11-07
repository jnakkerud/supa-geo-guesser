import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LatLon } from "../lat-lon";

export interface GeoAddress {
    placeId: string;
    description: string;
    countryCode: string;
    state?: string;
    locality?: string; // city || town || village
}

@Injectable({providedIn: 'root'})
export class GeoService {
    constructor(private httpClient: HttpClient) { }
    
      // https://nominatim.org/release-docs/latest/api/Reverse/
      public lookup(location: LatLon): Promise<GeoAddress> {

        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`;
        return new Promise<GeoAddress>((resolve) => {
            this.httpClient.get(url)
            .subscribe((res: any) => {
                const result: GeoAddress = {
                    placeId: res.place_id,
                    description: res.display_name,
                    countryCode: res.address?.country_code ?? '',
                    state: res.address?.state ?? null,
                    locality: res.address?.city ?? res.address?.town ?? res.address?.village ?? null
                }
                console.log(`lat=${location.latitude}&lon=${location.longitude}`, result)
                resolve(result);
            });        
        });
    }      
}
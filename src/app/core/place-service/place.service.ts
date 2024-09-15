import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geoapifyConfig } from '../../app-config';
import { LatLon } from "../lat-lon";

export interface PlaceSuggestion {
    description: string;
    placeId: string;
    countryCode: string;
    city: string;
    state: string;
    location: LatLon;
}

@Injectable({providedIn: 'root'})
export class PlaceService {
    
    constructor(private httpClient: HttpClient) { }
    
    // https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#autocomplete
    public async search(searchTerm: string, countryCodeFilter?: string): Promise<PlaceSuggestion[]> {
        const urlBuilder = [];
        urlBuilder.push(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchTerm}`);
        if (countryCodeFilter) {
            // Adding a country code filter will return better results for more obscure place names
            urlBuilder.push(`&filter=countrycode:${countryCodeFilter}`);
        }
        urlBuilder.push(`&apiKey=${geoapifyConfig.apiKey}`);
        const url = urlBuilder.join('');

        return new Promise<PlaceSuggestion[]>((resolve) => {
            this.httpClient.get(url)
            .subscribe((res: any) => {
                const features: any[] = Object.assign([], res.features);
                const result: PlaceSuggestion[] = features.map(f => {
                    return {
                        description: f.properties.formatted,
                        placeId: f.properties.place_id,
                        city: f.properties.city || '',
                        countryCode: f.properties.country_code,
                        state: f.properties.state || '',
                        location: {latitude: f.properties.lat, longitude: f.properties.lon}
                    }
                });
                console.log(result);

                resolve(result);
            });        
        });
    }
}
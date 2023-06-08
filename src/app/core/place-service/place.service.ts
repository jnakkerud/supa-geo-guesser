import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geoapifyConfig } from '../../app-config';
import { LongLat } from '../image-service/image.service';

export interface PlaceSuggestion {
    description: string;
    placeId: string;
    countryCode: string;
    city: string;
    state: string;
    location: LongLat;
}

@Injectable({providedIn: 'root'})
export class PlaceService {
    
    constructor(private httpClient: HttpClient) { }
    
    // https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#autocomplete
    public search(searchTerm: string): Promise<PlaceSuggestion[]> {

        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${searchTerm}&apiKey=${geoapifyConfig.apiKey}`;
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
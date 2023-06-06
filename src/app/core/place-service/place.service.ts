import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface PlaceSuggestion {
    description: string;
    placeId: string;
}

const DATA: PlaceSuggestion[] = [
    {
        description: 'Los Angeles',
        placeId: ''
    },
    {
        description: 'Berkeley',
        placeId: ''
    },
    {
        description: 'Albany',
        placeId: ''
    },
    {
        description: 'San Francisco',
        placeId: ''
    },
    {
        description: 'San Diego',
        placeId: ''
    }
]


// https://developers.google.com/maps/documentation/places/web-service/autocomplete

@Injectable({providedIn: 'root'})
export class PlaceService {
    
    constructor(private httpClient: HttpClient) { }
    
    // TODO implement
    public search(place: string): Promise<PlaceSuggestion[]> {

        const result = DATA.filter(v => v.description.startsWith(place));

        return new Promise((resolve) => {resolve(result)});
    }

    // TODO
    // getPlaceDetail(placeId: string): Promise<PlaceDetail>
}
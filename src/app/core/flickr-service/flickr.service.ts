import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flickrConfig } from '../../app-config';

function flickrUrl(methodName: string): URL {
    return new URL(`https://www.flickr.com/services/rest/?method=${methodName}&api_key=${flickrConfig.apiKey}&format=json`);
}

@Injectable({providedIn: 'root'})
export class FlickrService {
    
    constructor(private httpClient: HttpClient) { }
    
    getImageUrl(id: string, size: string) {

        const url: URL = flickrUrl('flickr.photos.getSizes');
        url.searchParams.append('photo_id', id);

        this.httpClient.jsonp(url.href, 'jsoncallback').subscribe((res: any) => {
            console.log(res);
        });
    }

    getGalleryPhotos() {

    }

    getLocation(id: string) {

    }
}
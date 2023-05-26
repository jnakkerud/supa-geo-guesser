import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flickrConfig } from '../../app-config';
import { ImageLoaderConfig } from '@angular/common';
import { ImageSize, Image } from '../image-service/image-service';

function flickrUrl(methodName: string): URL {
    return new URL(`https://www.flickr.com/services/rest/?method=${methodName}&api_key=${flickrConfig.apiKey}&format=json`);
}

/*export interface PhotoSource {
    height: number;
    width: number;
    label: string;
    media: string;
    source: string;
    url: string;
}*/

/*export enum PhotoSize {
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large',
    Large1600 = 'Large 1600'
}

export interface PhotoLatLong {
    latitude: string;
    longitude: string;    
}*/

export interface FlickrImageSource {
    id: string;
    secret: string;
    serverId: string;
}


export function sizeSuffix(size: ImageSize): string {
    switch (size) {
        case ImageSize.SMALL:
            return 'n';
        case ImageSize.MEDIUM:
            return 'c';
        case ImageSize.LARGE:
            return 'h';
    }
}

@Injectable({providedIn: 'root'})
export class FlickrService {
    
    constructor(private httpClient: HttpClient) { }
    
    /*getImageUrl(id: string, photoSize: PhotoSize): Promise<URL> {

        const url: URL = flickrUrl('flickr.photos.getSizes');
        url.searchParams.append('photo_id', id);

        return new Promise<URL>((resolve, reject) => {
            this.httpClient.jsonp(url.href, 'jsoncallback')
                .subscribe((res: any) => {
                    if (res.stat !== 'ok') {
                        console.error(res);
                        reject(`Error calling service: ${res.message}`);
                    }

                    const sizeSource: PhotoSource[] = res.sizes.size;
                    
                    const found = sizeSource.find(e => e.label == photoSize);
                    if (found) {
                        resolve(new URL(found.source));
                    } else {
                        reject(`Size ${photoSize} for photo ${id} not found`);
                    }
                }
            );
        });

    }*/

    // TODO getSource to replace getLocation
    // 

    /*getLocation(id: string): Promise<PhotoLatLong> {
        const url: URL = flickrUrl('flickr.photos.geo.getLocation');
        url.searchParams.append('photo_id', id);

        return new Promise<PhotoLatLong>((resolve, reject) => {
            this.httpClient.jsonp(url.href, 'jsoncallback')
                .subscribe((res: any) => {
                    if (res.stat !== 'ok') {
                        console.error(res);
                        reject(`Error calling service: ${res.message}`);
                    }

                    // Note the Country, etc is returned
                    console.log(res);

                    resolve({latitude: res.photo.location.latitude, longitude: res.photo.location.longitude})
                }
            );
        });

    }*/

    // https://www.flickr.com/services/api/misc.urls.html
    public getImageUrl(image: Image, size: ImageSize): string {
        const imageSource: FlickrImageSource = image.source as FlickrImageSource;
        return `https://live.staticflickr.com/${imageSource.serverId}/${imageSource.id}_${imageSource.secret}_${sizeSuffix(size)}.jpg`;
    }

}
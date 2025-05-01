import { Theme } from "../theme-service/theme.service";
import { Image } from "../image-service/image.service";
import { FlickerImageProvider } from "./flickr-image-provider";
import { randomInt, randomNumber, SourceType } from "../utils";
import { coerceNumberProperty } from "@angular/cdk/coercion";

const PER_PAGE = 10;

export interface FlickrGroupInfo {
    groupID: string;
    photoCount: number;
    url: string;
}

export class FlickrGroupImageProvider extends FlickerImageProvider {

    public override async images(theme: Theme): Promise<Image[]> {
        // return a single image
        const resultImages: Image[] = [];

        const groupInfo: FlickrGroupInfo = theme.sourceInfo;

        // generate a random page number
        const pages = Math.floor(groupInfo.photoCount / PER_PAGE);
        const randomPage = randomNumber(1, pages);

        const res = await this.flickrService.getGroupPhotos(encodeURI(groupInfo.groupID), randomPage, PER_PAGE);
        res.filter((image) => image.latitude != 0 && image.longitude != 0);
        
        if (res.length == 0) {
            console.log('No images found with geo', theme.id);
            return this.images(theme);
        }

        // get a random image
        let randomImage = res[randomInt(res.length)];
        
        console.log('random group image', randomImage)

        resultImages.push(
            {
                id: coerceNumberProperty(randomImage.id),
                location: { latitude: coerceNumberProperty(randomImage.latitude), longitude: coerceNumberProperty(randomImage.longitude) },
                source: randomImage,
                sourceType: SourceType.FLICKR,
                themeId: theme.id,
                description: randomImage.title

            }
        );
        return new Promise((resolve) => { resolve(resultImages) });  
    }
}
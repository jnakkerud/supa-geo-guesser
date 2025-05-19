import { Theme } from "../theme-service/theme.service";
import { Image } from "../image-service/image.service";
import { FlickerImageProvider } from "./flickr-image-provider";
import { randomInt, randomNumber, SourceType } from "../utils";
import { coerceNumberProperty } from "@angular/cdk/coercion";
import { Queue } from "../queue";
import { FlickrPhotoInfo } from "./flickr.service";

const PER_PAGE = 10;
const RANDOM_ITEMS = 15;

export interface FlickrGroupInfo {
    groupID: string;
    photoCount: number;
    url: string;
}

function getRandomItems(arr: FlickrPhotoInfo[], x: number): FlickrPhotoInfo[] {
    if (x > arr.length) {
      throw new Error('The number of items requested is greater than the array length');
    }

    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, x);
}

export class FlickrGroupImageProvider extends FlickerImageProvider {

    queue: Queue<Image> = new Queue<Image>();

    public override async loadImages(theme: Theme): Promise<Image[]> {
        const perPage = theme.storeScore ? 100 : PER_PAGE;

        const groupInfo: FlickrGroupInfo = theme.sourceInfo;

        // generate a random page number
        const pages = Math.floor(groupInfo.photoCount / perPage);
        const randomPage = randomNumber(1, pages);

        let photoInfoAry = await this.flickrService.getGroupPhotos(encodeURI(groupInfo.groupID), randomPage, perPage);
        photoInfoAry = photoInfoAry.filter((pi) => pi.latitude != 0 && pi.longitude != 0);
        
        if (photoInfoAry.length == 0) {
            console.log('No images found with geo', theme.id);
            return this.loadImages(theme);
        }

        // create a queue of images
        if (theme.storeScore) {
            this.loadQueue(getRandomItems(photoInfoAry, RANDOM_ITEMS), theme);
            // TODO: load more images when queue is low
        } else {
            this.loadQueue([photoInfoAry[randomInt(photoInfoAry.length)]], theme);
        }

        const dequeuedImage = this.queue.dequeue();
        this._images = dequeuedImage ? [dequeuedImage] : [];

        console.log('random group image', this._images)

        return new Promise((resolve) => { resolve(this._images) });  
    }

    private loadQueue(photoInfoAry: FlickrPhotoInfo[], theme: Theme): void {
        // load the queue with images
        for (let i = 0; i < photoInfoAry.length; i++) {
            const image = photoInfoAry[i];
            this.queue.enqueue(
                {
                    id: coerceNumberProperty(image.id),
                    location: { latitude: coerceNumberProperty(image.latitude), longitude: coerceNumberProperty(image.longitude) },
                    source: image,
                    sourceType: SourceType.FLICKR,
                    themeId: theme.id,
                    description: image.title
                }
            );
        }
    }

    public override nextImage(): Image {
        const dequeuedImage = this.queue.dequeue();
        this._images = dequeuedImage ? [dequeuedImage] : [];
        this._currentImageIndex++
        return this._images[0];        
    }

    public override hasMoreImages(): boolean {
        return this.queue.size() > 0;
    }

}
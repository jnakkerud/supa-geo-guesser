import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Image, ImageService, ImageSize, SourceType, LongLat } from '../../core/image-service/image-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FlickrPhotoInfo } from 'src/app/core/flickr-service/flickr.service';
import { tileLayer, latLng, Layer, marker, icon } from 'leaflet';

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html',
    styleUrls: ['edit-image.component.scss'],
})
export class EditImageComponent implements OnInit {

    themeId!: number;
    images!: Image[];

    mapOptions = {
        layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            opacity: 0.7,
            maxZoom: 19,
            detectRetina: true,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })],
          zoom:1,
          center:latLng(0,0)
    }; 
    markers: Layer[] = [];

    editImage: FormGroup = new FormGroup({
        source: new FormControl<string>('', [Validators.required]),
        convertedSource: new FormControl<any>({}),
        longitude: new FormControl<number>(0, [Validators.required]),
        latitude: new FormControl<number>(0, [Validators.required]),
        description: new FormControl<string>('')
    });

    constructor(private route: ActivatedRoute, private imageService: ImageService) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                of(params.get('id'))
            )
        ).subscribe((id) => {
            this.themeId = Number(id);
            this.imageService.images(this.themeId).then(r => {
                this.images = r;
                this.addMarkers();
            });
        });
    }

    addMarkers(): void {
        this.images.forEach(i => {
            console.log(i);
            this.addMarker(i.location);
        });
    }

    addMarker(location: LongLat): void {
		const newMarker = marker(
			[ location.latitude, location.longitude ],
			{
				icon: icon({
					iconSize: [ 25, 41 ],
					iconAnchor: [ 13, 41 ],
					iconUrl: 'assets/leaflet/marker-icon.png',
					iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
					shadowUrl: 'assets/leaflet/marker-shadow.png'
				})
			}
		);

		this.markers.push(newMarker);
	}

    onSubmit() {
        const sourceType = SourceType.FLICKR;
        const image:  Partial<Image> = {
            sourceType: sourceType,
            themeId: this.themeId,
            location: {
                longitude: this.editImage.value.longitude,
                latitude: this.editImage.value.latitude
            },
            source: this.editImage.value.convertedSource
        }

        if (!!this.editImage.value.description) {
            image.description = this.editImage.value.description;
        }        
        this.imageService.insert([image]).then(i => {
            console.log('Images saved', i)
            // clear form
            this.editImage.reset();
            // refetch images
            this.imageService.images(this.themeId).then(r => {
                this.images = r;
                // TODO reset map markers
            });
        });
    }

    imageInfo(): void {
        this.imageService.getImageInfo(SourceType.FLICKR, this.editImage.value.source).then(r =>  {
            const flickrResult: FlickrPhotoInfo = r as FlickrPhotoInfo;
            let { longitude, latitude, ...imageSource } = r;
            this.editImage.patchValue(
                {
                    longitude: longitude,
                    latitude: latitude,
                    convertedSource:  imageSource
                }
            )
        });
    }

    imgSmallSource(image: Image): string {
        return this.imageService.getImageUrl(image, ImageSize.SMALL);
    }
}
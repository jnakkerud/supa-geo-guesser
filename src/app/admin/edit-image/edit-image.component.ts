import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Image, ImageService } from '../../core/image-service/image-service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';

@Component({
    selector: 'edit-image',
    templateUrl: 'edit-image.component.html'
})

export class EditImageComponent implements OnInit {

    themeId!: number;
    images!: Promise<Image[]>;

    constructor(private route: ActivatedRoute, private imageService: ImageService) { }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                of(params.get('id'))
            )
        ).subscribe((id) => {
            this.themeId = Number(id);
            this.images = this.imageService.images(this.themeId);
        });
    }
}
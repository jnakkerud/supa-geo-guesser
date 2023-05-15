import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';

@Component({
    selector: 'admin',
    templateUrl: './admin.component.html'
})

export class AdminComponent {
    constructor() { }
}

@NgModule({
    imports: [
        CommonModule, MaterialModule],
    exports: [AdminComponent],
    declarations: [AdminComponent],
  })
export class AdminModule {}
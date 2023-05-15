import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

const modules: any[] = [
    MatButtonModule
];

@NgModule({
  imports: [ ...modules ],
  exports: [ ...modules ]

})
export class MaterialModule { }
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule}  from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';

const modules: any[] = [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule
];

@NgModule({
  imports: [ ...modules ],
  exports: [ ...modules ]

})
export class MaterialModule { }
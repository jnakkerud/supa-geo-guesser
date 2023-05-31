import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { EditImageComponent } from './admin/edit-image/edit-image.component';
import { ThemeComponent } from './theme/theme.component';

const routes: Routes = [
    { path: 'admin', component: AdminComponent},
    { path: 'edit-image', component: EditImageComponent},
    { path: 'theme/:id', component: ThemeComponent },
    { path: '', redirectTo: 'admin', pathMatch: 'full' },
    { path: '**', redirectTo: '' },    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

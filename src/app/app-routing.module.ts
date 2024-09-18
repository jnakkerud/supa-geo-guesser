import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { EditImageComponent } from './admin/edit-image/edit-image.component';
import { ThemePlayComponent } from './home/theme-play/theme-play.component';
import { HomeComponent } from './home/home.component';
import { ThemeResultComponent } from './home/theme-result/theme-result.component';
import { ThemeListComponent } from './home/theme-list/theme-list.component';

const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'admin', component: AdminComponent},
    { path: 'themes', component: ThemeListComponent},
    { path: 'edit-image', component: EditImageComponent},
    { path: 'theme/:id', component: ThemePlayComponent },
    { path: 'result/:id', component: ThemeResultComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

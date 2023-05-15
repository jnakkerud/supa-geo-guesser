import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
    { path: 'admin', component: AdminComponent},
    { path: '', redirectTo: 'admin', pathMatch: 'full' },
    { path: '**', redirectTo: '' },    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

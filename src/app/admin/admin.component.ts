import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Theme, ThemeService } from '../core/theme-service/theme.service';
import { Router } from '@angular/router';
import { SupabaseService } from '../core/supabase-service/supabase.service';
import { SourceType } from '../core/utils';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { MatInput } from '@angular/material/input';
@Component({
    selector: 'admin',
    templateUrl: './admin.component.html',
    styleUrls: ['admin.component.scss'],
    imports: [
        MatFormField,
        MatLabel,
        MatSelect,
        MatOption,
        ReactiveFormsModule,
        AsyncPipe,
        MatInput
    ]
})
export class AdminComponent implements OnInit {

    themes!: Promise<Theme[]>;
    selectedTheme!: Theme;

    adminTheme: FormGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        description: new FormControl<string>('')
    });

    login: FormGroup = new FormGroup({
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        password: new FormControl<string>('', Validators.required)
    });

    constructor(private router: Router, private themeService: ThemeService, private supabaseService: SupabaseService) { }

    ngOnInit(): void {
        this.themes = this.themeService.themes();
    }

    onSelectedTheme() {
        console.log(this.selectedTheme);
        this.router.navigate(['/edit-image', { id: this.selectedTheme.id }]);
    }

    onSubmit() {
        const theme: Partial<Theme>  = {
            name: this.adminTheme.value.name,
            sourceType: SourceType.FLICKR
        }

        if (!!this.adminTheme.value.description) {
            theme.description = this.adminTheme.value.description;
        }
        
        this.themeService.insert(theme).then(r => console.log('Theme created', r));
    }

    onLoginSubmit() {
        this.supabaseService.signIn(this.login.value.email, this.login.value.password);
    }

}
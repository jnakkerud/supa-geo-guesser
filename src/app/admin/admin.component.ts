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
import  { MatButton } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
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
        MatInput,
        MatButton,
        MatRadioModule
    ]
})
export class AdminComponent implements OnInit {
    SourceType = SourceType; // Expose SourceType enum to the template

    themes!: Promise<Theme[]>;
    selectedTheme!: Theme;

    adminTheme: FormGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        sourceType: new FormControl<SourceType>(SourceType.FLICKR, [Validators.required]),
        description: new FormControl<string>('')
    });
    createTheme: boolean = false

    login: FormGroup = new FormGroup({
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        password: new FormControl<string>('', Validators.required)
    });
    loginError: string | undefined;
    loggedIn: boolean = false;

    constructor(private router: Router, private themeService: ThemeService, private supabaseService: SupabaseService) { }

    ngOnInit(): void {
        this.themes = this.themeService.themes();
        this.supabaseService.getAuthSession().then(session => {
            if (session) {
                this.loggedIn = true;
            }
        }).catch(err => {
            console.error('Error getting auth session', err);
        }); 
    }

    onSelectedTheme() {
        console.log('onSelectedTheme', this.selectedTheme);
        this.router.navigate(['/edit-image', { id: this.selectedTheme.id }]);
    }

    onAdminThemeSubmit() {
        const theme: Partial<Theme>  = {
            name: this.adminTheme.value.name,
            sourceType: this.adminTheme.value.sourceType,
            storeScore: false 
        }

        if (!!this.adminTheme.value.description) {
            theme.description = this.adminTheme.value.description;
        }

        this.themeService.insert(theme).then(newTheme => {
            this.router.navigate(['/edit-image', { id: newTheme.id }]);
        });
    }

    onLoginSubmit() {
        if (this.login.valid) {
            this.loginError = undefined;
            this.supabaseService.signIn(this.login.value.email, this.login.value.password)
                .then(() => {
                    this.loggedIn = true;
                })
                .catch(err => {
                    this.loginError = err;
                })
        }
    }

}
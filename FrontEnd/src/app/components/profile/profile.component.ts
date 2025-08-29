import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,

  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  isUpdating = false;
  isChangingPassword = false;
  
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  updateProfile(): void {
    if (this.profileForm.valid && !this.isUpdating) {
      this.isUpdating = true;
      const profileData = this.profileForm.value;
      
      // Simulate API call - replace with actual service method
      setTimeout(() => {
        // Update current user data
        if (this.currentUser) {
          this.currentUser.name = profileData.name;
          this.currentUser.email = profileData.email;
        }
        
        this.snackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.isUpdating = false;
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;
      const passwordData = this.passwordForm.value;
      
      // Simulate API call - replace with actual service method
      setTimeout(() => {
        this.snackBar.open('Contraseña cambiada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Reset password form
        this.passwordForm.reset();
        this.isChangingPassword = false;
      }, 1000);
    }
  }

  confirmDeleteAccount(): void {
    const confirmation = confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (confirmation) {
      const secondConfirmation = confirm(
        'Esta es tu última oportunidad. ¿Realmente quieres eliminar tu cuenta permanentemente?'
      );
      
      if (secondConfirmation) {
        this.deleteAccount();
      }
    }
  }

  deleteAccount(): void {
    // Simulate API call - replace with actual service method
    this.snackBar.open('Eliminando cuenta...', 'Cerrar', {
      duration: 2000,
      panelClass: ['info-snackbar']
    });
    
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
      
      this.snackBar.open('Cuenta eliminada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }, 2000);
  }

  getMemberSince(): string {
    // Simulate member since date - replace with actual user data
    const memberSince = new Date('2024-01-01');
    return memberSince.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}
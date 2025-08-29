import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../services/task.service';
import { TaskCategory } from '../../models/task.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: TaskCategory[] = [];
  isLoading = false;
  isSaving = false;
  isEditMode = false;
  editingCategory: TaskCategory | null = null;
  
  categoryForm: FormGroup;
  
  // Task counts for each category (simulated)
  private taskCounts: { [categoryId: string]: number } = {};

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      color: ['#2196F3']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.taskService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadTaskCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('Error al cargar las categorías', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadTaskCounts(): void {
    // Simulate loading task counts for each category
    // In a real app, this would be an API call
    this.categories.forEach(category => {
      this.taskCounts[category.id] = Math.floor(Math.random() * 10);
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSaving = true;
      const formData = this.categoryForm.value;
      
      if (this.isEditMode && this.editingCategory) {
        // Update existing category
        this.taskService.updateCategory(this.editingCategory.id, formData).subscribe({
          next: () => {
            this.snackBar.open('Categoría actualizada exitosamente', 'Cerrar', {
              duration: 2000,
              panelClass: ['success-snackbar']
            });
            this.resetForm();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.snackBar.open('Error al actualizar la categoría', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isSaving = false;
          }
        });
      } else {
        // Create new category
        this.taskService.createCategory(formData).subscribe({
          next: () => {
            this.snackBar.open('Categoría creada exitosamente', 'Cerrar', {
              duration: 2000,
              panelClass: ['success-snackbar']
            });
            this.resetForm();
            this.loadCategories();
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.snackBar.open('Error al crear la categoría', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isSaving = false;
          }
        });
      }
    }
  }

  editCategory(category: TaskCategory): void {
    this.isEditMode = true;
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      color: category.color || '#2196F3'
    });
  }

  deleteCategory(category: TaskCategory): void {
    const taskCount = this.getTaskCount(category.id);
    if (taskCount > 0) {
      this.snackBar.open(
        `No se puede eliminar la categoría porque tiene ${taskCount} tarea(s) asignada(s)`,
        'Cerrar',
        {
          duration: 4000,
          panelClass: ['warning-snackbar']
        }
      );
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      this.taskService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada exitosamente', 'Cerrar', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.snackBar.open('Error al eliminar la categoría', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.isEditMode = false;
    this.editingCategory = null;
    this.isSaving = false;
    this.categoryForm.reset({
      name: '',
      description: '',
      color: '#2196F3'
    });
  }

  getTaskCount(categoryId: string): number {
    return this.taskCounts[categoryId] || 0;
  }
}
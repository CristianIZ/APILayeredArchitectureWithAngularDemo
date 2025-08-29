import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService } from '../../../services/task.service';
import { Task, TaskStatus, TaskPriority, TaskCategory, TaskFilter, CreateTaskRequest, UpdateTaskRequest } from '../../../models/task.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatButtonToggleModule,
    DragDropModule
  ],
  templateUrl: './task-list.component.html',

  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  categories: TaskCategory[] = [];
  isLoading = false;
  hasFilters = false;
  
  // View state
  viewMode: 'kanban' | 'grid' = 'kanban';
  showGridView = false;
  
  // Dialog state
  showTaskDialog = false;
  isEditMode = false;
  editingTask: Task | null = null;
  isSaving = false;
  
  // Forms
  filterForm: FormGroup;
  taskForm: FormGroup;
  
  // Enums for templates
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  
  // Options for selects
  taskStatuses = [
    { value: TaskStatus.Pending, label: 'Pendiente' },
    { value: TaskStatus.InProgress, label: 'En Progreso' },
    { value: TaskStatus.Completed, label: 'Completada' }
  ];
  
  taskPriorities = [
    { value: TaskPriority.Low, label: 'Baja' },
    { value: TaskPriority.Medium, label: 'Media' },
    { value: TaskPriority.High, label: 'Alta' }
  ];

  constructor(
    private taskService: TaskService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [[]],
      priority: [[]],
      dueDateFrom: [null],
      dueDateTo: [null]
    });
    
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: [TaskPriority.Medium, [Validators.required]],
      status: [TaskStatus.Pending, [Validators.required]],
      dueDate: [null],
      categoryId: [null]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadCategories();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Error al cargar las tareas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.taskService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.tasks];
    
    // Check if any filters are applied
    this.hasFilters = !!(filters.search || 
                        (filters.status && filters.status.length > 0) ||
                        (filters.priority && filters.priority.length > 0) ||
                        filters.dueDateFrom || filters.dueDateTo);
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    
    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    
    // Apply date filters
    if (filters.dueDateFrom) {
      filtered = filtered.filter(task => 
        task.dueDate && new Date(task.dueDate) >= new Date(filters.dueDateFrom)
      );
    }
    
    if (filters.dueDateTo) {
      filtered = filtered.filter(task => 
        task.dueDate && new Date(task.dueDate) <= new Date(filters.dueDateTo)
      );
    }
    
    this.filteredTasks = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: [],
      priority: [],
      dueDateFrom: null,
      dueDateTo: null
    });
  }

  openCreateTaskDialog(): void {
    this.isEditMode = false;
    this.editingTask = null;
    this.taskForm.reset({
      title: '',
      description: '',
      priority: TaskPriority.Medium,
      status: TaskStatus.Pending,
      dueDate: null,
      categoryId: null
    });
    this.showTaskDialog = true;
  }

  editTask(task: Task): void {
    this.isEditMode = true;
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      categoryId: task.categoryId
    });
    this.showTaskDialog = true;
  }

  closeTaskDialog(): void {
    this.showTaskDialog = false;
    this.isEditMode = false;
    this.editingTask = null;
    this.taskForm.reset();
  }

  saveTask(): void {
    if (this.taskForm.valid && !this.isSaving) {
      this.isSaving = true;
      const taskData = this.taskForm.value;
      
      if (this.isEditMode && this.editingTask) {
        const updateData: UpdateTaskRequest = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          categoryId: taskData.categoryId
        };
        
        this.taskService.updateTask(this.editingTask.id, updateData).subscribe({
          next: () => {
            this.snackBar.open('Tarea actualizada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.closeTaskDialog();
            this.loadTasks();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.snackBar.open('Error al actualizar la tarea', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isSaving = false;
          }
        });
      } else {
        const createData: CreateTaskRequest = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          categoryId: taskData.categoryId
        };
        
        this.taskService.createTask(createData).subscribe({
          next: () => {
            this.snackBar.open('Tarea creada exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.closeTaskDialog();
            this.loadTasks();
            this.isSaving = false;
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.snackBar.open('Error al crear la tarea', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.isSaving = false;
          }
        });
      }
    }
  }

  toggleTaskStatus(task: Task): void {
    const newStatus = task.status === TaskStatus.Completed ? TaskStatus.Pending : TaskStatus.Completed;
    const updateData: UpdateTaskRequest = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: newStatus,
      dueDate: task.dueDate,
      categoryId: task.categoryId
    };
    
    this.taskService.updateTask(task.id, updateData).subscribe({
      next: () => {
        const message = newStatus === TaskStatus.Completed ? 'Tarea marcada como completada' : 'Tarea marcada como pendiente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        this.snackBar.open('Error al actualizar el estado de la tarea', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  deleteTask(task: Task): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.snackBar.open('Tarea eliminada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.snackBar.open('Error al eliminar la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // Utility methods
  getTaskCardClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'pending';
      case TaskStatus.InProgress:
        return 'in-progress';
      case TaskStatus.Completed:
        return 'completed';
      default:
        return '';
    }
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.High:
        return 'priority-high';
      case TaskPriority.Medium:
        return 'priority-medium';
      case TaskPriority.Low:
        return 'priority-low';
      default:
        return '';
    }
  }

  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.High:
        return 'keyboard_arrow_up';
      case TaskPriority.Medium:
        return 'remove';
      case TaskPriority.Low:
        return 'keyboard_arrow_down';
      default:
        return 'remove';
    }
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'status-pending';
      case TaskStatus.InProgress:
        return 'status-in-progress';
      case TaskStatus.Completed:
        return 'status-completed';
      default:
        return '';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'Pendiente';
      case TaskStatus.InProgress:
        return 'En Progreso';
      case TaskStatus.Completed:
        return 'Completada';
      default:
        return 'Desconocido';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.Completed) {
      return false;
    }
    return new Date(task.dueDate) < new Date();
  }

  // Drag & Drop functionality
  drop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data as Task;
    const previousContainer = event.previousContainer;
    const currentContainer = event.container;
    
    if (previousContainer === currentContainer) {
      // Reordering within the same column
      moveItemInArray(currentContainer.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      transferArrayItem(
        previousContainer.data,
        currentContainer.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update task status based on the target column
      let newStatus: TaskStatus;
      const containerId = currentContainer.id || currentContainer.element.nativeElement.id;
      
      if (containerId === 'inProgressList' || currentContainer.data === this.getInProgressTasks()) {
        newStatus = TaskStatus.InProgress;
      } else if (containerId === 'completedList' || currentContainer.data === this.getCompletedTasks()) {
        newStatus = TaskStatus.Completed;
      } else {
        newStatus = TaskStatus.Pending;
      }
      
      // Update task status in the backend
      const updateData: UpdateTaskRequest = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: newStatus,
        dueDate: task.dueDate,
        categoryId: task.categoryId
      };
      
      this.taskService.updateTask(task.id, updateData).subscribe({
        next: () => {
          const statusLabel = this.getStatusLabel(newStatus);
          this.snackBar.open(`Tarea movida a ${statusLabel}`, 'Cerrar', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          // Refresh tasks to ensure consistency
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error updating task status:', error);
          this.snackBar.open('Error al mover la tarea', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          // Revert the move on error
          this.loadTasks();
        }
      });
    }
  }

  // Task filtering by status
  getPendingTasks(): Task[] {
    return this.filteredTasks.filter(task => task.status === TaskStatus.Pending);
  }

  getInProgressTasks(): Task[] {
    return this.filteredTasks.filter(task => task.status === TaskStatus.InProgress);
  }

  getCompletedTasks(): Task[] {
    return this.filteredTasks.filter(task => task.status === TaskStatus.Completed);
  }

  // View mode management
  onViewModeChange(event: any): void {
    this.viewMode = event.value;
    this.showGridView = this.viewMode === 'grid';
  }
}
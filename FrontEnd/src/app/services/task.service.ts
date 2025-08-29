import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilter, TaskCategory, TaskStatus, TaskPriority } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = environment.apiUrl;
  
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  
  private categoriesSubject = new BehaviorSubject<TaskCategory[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(filter?: TaskFilter): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status?.length) {
        filter.status.forEach(status => {
          params = params.append('status', status);
        });
      }
      if (filter.priority?.length) {
        filter.priority.forEach(priority => {
          params = params.append('priority', priority);
        });
      }
      if (filter.categoryId?.length) {
        filter.categoryId.forEach(categoryId => {
          params = params.append('categoryId', categoryId.toString());
        });
      }
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      if (filter.dueDateFrom) {
        params = params.set('dueDateFrom', filter.dueDateFrom.toISOString());
      }
      if (filter.dueDateTo) {
        params = params.set('dueDateTo', filter.dueDateTo.toISOString());
      }
    }

    return this.http.get<Task[]>(`${this.API_URL}/tasks`, { params })
      .pipe(
        tap(tasks => {
          // Convert date strings to Date objects
          const processedTasks = tasks.map(task => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined
          }));
          this.tasksSubject.next(processedTasks);
        })
      );
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`)
      .pipe(
        tap(task => {
          // Convert date strings to Date objects
          task.createdAt = new Date(task.createdAt);
          task.updatedAt = new Date(task.updatedAt);
          if (task.dueDate) task.dueDate = new Date(task.dueDate);
          if (task.completedAt) task.completedAt = new Date(task.completedAt);
        })
      );
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, taskData)
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          newTask.createdAt = new Date(newTask.createdAt);
          newTask.updatedAt = new Date(newTask.updatedAt);
          if (newTask.dueDate) newTask.dueDate = new Date(newTask.dueDate);
          this.tasksSubject.next([...currentTasks, newTask]);
        })
      );
  }

  updateTask(id: string, taskData: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/tasks/${id}`, taskData)
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          updatedTask.createdAt = new Date(updatedTask.createdAt);
          updatedTask.updatedAt = new Date(updatedTask.updatedAt);
          if (updatedTask.dueDate) updatedTask.dueDate = new Date(updatedTask.dueDate);
          if (updatedTask.completedAt) updatedTask.completedAt = new Date(updatedTask.completedAt);
          
          const index = currentTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
          }
        })
      );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(filteredTasks);
        })
      );
  }

  // Category Operations
  getCategories(): Observable<TaskCategory[]> {
    return this.http.get<TaskCategory[]>(`${this.API_URL}/categories`)
      .pipe(
        tap(categories => {
          const processedCategories = categories.map(category => ({
            ...category,
            createdAt: new Date(category.createdAt)
          }));
          this.categoriesSubject.next(processedCategories);
        })
      );
  }

  createCategory(categoryData: Partial<TaskCategory>): Observable<TaskCategory> {
    return this.http.post<TaskCategory>(`${this.API_URL}/categories`, categoryData)
      .pipe(
        tap(newCategory => {
          const currentCategories = this.categoriesSubject.value;
          newCategory.createdAt = new Date(newCategory.createdAt);
          this.categoriesSubject.next([...currentCategories, newCategory]);
        })
      );
  }

  updateCategory(id: string, categoryData: Partial<TaskCategory>): Observable<TaskCategory> {
    return this.http.put<TaskCategory>(`${this.API_URL}/categories/${id}`, categoryData)
      .pipe(
        tap(updatedCategory => {
          const currentCategories = this.categoriesSubject.value;
          updatedCategory.createdAt = new Date(updatedCategory.createdAt);
          
          const index = currentCategories.findIndex(category => category.id === id);
          if (index !== -1) {
            currentCategories[index] = updatedCategory;
            this.categoriesSubject.next([...currentCategories]);
          }
        })
      );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categories/${id}`)
      .pipe(
        tap(() => {
          const currentCategories = this.categoriesSubject.value;
          const filteredCategories = currentCategories.filter(category => category.id !== id);
          this.categoriesSubject.next(filteredCategories);
        })
      );
  }

  // Utility methods
  refreshTasks(): void {
    this.getTasks().subscribe();
  }

  refreshCategories(): void {
    this.getCategories().subscribe();
  }

  private generateMockTasks(): Task[] {
    return [
      {
        id: '1',
        title: 'Completar proyecto Angular',
        description: 'Finalizar la aplicación de gestión de tareas',
        status: TaskStatus.InProgress,
         priority: TaskPriority.High,
        categoryId: 'cat-1',
        userId: 1,
        dueDate: new Date('2024-02-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'Revisar documentación',
        description: 'Actualizar la documentación del API',
        status: TaskStatus.Pending,
         priority: TaskPriority.Medium,
        categoryId: 'cat-2',
        userId: 1,
        dueDate: new Date('2024-02-10'),
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: '3',
        title: 'Preparar presentación',
        description: 'Crear slides para la demo del proyecto',
        status: TaskStatus.Completed,
         priority: TaskPriority.Low,
        categoryId: 'cat-1',
        userId: 1,
        dueDate: new Date('2024-01-25'),
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        completedAt: new Date('2024-01-25')
      },
      {
        id: '4',
        title: 'Configurar CI/CD',
        description: 'Implementar pipeline de integración continua',
        status: TaskStatus.Pending,
         priority: TaskPriority.High,
        categoryId: 'cat-3',
        userId: 1,
        dueDate: new Date('2024-02-20'),
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22')
      }
    ];
  }

  private generateMockCategories(): TaskCategory[] {
    return [
      {
        id: 'cat-1',
        name: 'Trabajo',
        description: 'Tareas relacionadas con el trabajo y proyectos profesionales',
        color: '#2196F3',
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-2',
        name: 'Personal',
        description: 'Actividades y tareas personales',
        color: '#4CAF50',
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'cat-3',
        name: 'Estudios',
        description: 'Tareas académicas y de aprendizaje',
        color: '#FF9800',
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }
}
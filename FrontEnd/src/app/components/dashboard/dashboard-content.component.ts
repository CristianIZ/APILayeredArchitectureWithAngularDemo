import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { User } from '../../models/user.model';
import { Task, TaskStatus } from '../../models/task.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.css']
})
export class DashboardContentComponent implements OnInit {
  isHandset$: Observable<boolean>;
  currentUser: User | null = null;
  tasks: Task[] = [];
  recentTasks: Task[] = [];
  totalTasks = 0;
  pendingTasksCount = 0;
  inProgressTasksCount = 0;
  completedTasksCount = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private taskService: TaskService
  ) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadTasks();
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.totalTasks = tasks.length;
      this.pendingTasksCount = tasks.filter(task => task.status === TaskStatus.Pending).length;
      this.inProgressTasksCount = tasks.filter(task => task.status === TaskStatus.InProgress).length;
      this.completedTasksCount = tasks.filter(task => task.status === TaskStatus.Completed).length;
      
      // Get recent tasks (last 5)
      this.recentTasks = tasks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    });
  }

  getStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'warn';
      case TaskStatus.InProgress:
        return 'accent';
      case TaskStatus.Completed:
        return 'primary';
      default:
        return '';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Pending:
        return 'pending_actions';
      case TaskStatus.InProgress:
        return 'hourglass_empty';
      case TaskStatus.Completed:
        return 'check_circle';
      default:
        return 'help';
    }
  }
}
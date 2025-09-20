import { Component, ChangeDetectionStrategy, signal, computed, effect, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SEO_CHECKLIST_DATA, ChecklistItem } from '../../data/seo-checklist.data';

type CompletionStatus = { [key: string]: boolean };
type GroupedChecklist = { [category: string]: ChecklistItem[] };

@Component({
  selector: 'app-seo-audit-checklist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seo-audit-checklist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoAuditChecklistComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'seo-audit-checklist-progress';

  // State Signals
  completedTasks = signal<CompletionStatus>({});
  filterStatus = signal<'all' | 'completed' | 'incomplete'>('all');
  
  // Data
  totalTasks = SEO_CHECKLIST_DATA.length;
  
  // Computed Signals
  private groupedChecklist = computed<GroupedChecklist>(() => {
    return SEO_CHECKLIST_DATA.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as GroupedChecklist);
  });

  filteredGroupedChecklist = computed<GroupedChecklist>(() => {
    const grouped = this.groupedChecklist();
    const status = this.filterStatus();
    const completed = this.completedTasks();

    if (status === 'all') {
      return grouped;
    }

    const filtered: GroupedChecklist = {};
    for (const category in grouped) {
      if (Object.prototype.hasOwnProperty.call(grouped, category)) {
        const items = grouped[category].filter(item => {
          const isCompleted = !!completed[item.id];
          return status === 'completed' ? isCompleted : !isCompleted;
        });

        if (items.length > 0) {
          filtered[category] = items;
        }
      }
    }
    return filtered;
  });
  
  categories = computed(() => Object.keys(this.filteredGroupedChecklist()));

  completedCount = computed(() => {
    return Object.values(this.completedTasks()).filter(Boolean).length;
  });

  progressPercentage = computed(() => {
    if (this.totalTasks === 0) return 0;
    return Math.round((this.completedCount() / this.totalTasks) * 100);
  });

  constructor() {
    // Effect to save progress to localStorage whenever it changes
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.completedTasks()));
      }
    });
  }

  ngOnInit() {
    this.loadProgressFromLocalStorage();
  }

  private loadProgressFromLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const savedProgress = localStorage.getItem(this.storageKey);
      if (savedProgress) {
        try {
          const parsedProgress = JSON.parse(savedProgress);
          this.completedTasks.set(parsedProgress);
        } catch (e) {
          console.error('Failed to parse checklist progress from localStorage', e);
          this.completedTasks.set({});
        }
      }
    }
  }

  toggleTask(taskId: string) {
    this.completedTasks.update(current => ({
      ...current,
      [taskId]: !current[taskId]
    }));
  }
  
  resetProgress() {
    this.completedTasks.set({});
  }

  setFilter(status: 'all' | 'completed' | 'incomplete') {
    this.filterStatus.set(status);
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CongratulationsService } from './congratulations.service';

export interface ToastData {
  id: number;
  points: number;
  isSuccess: boolean;
  offsetIndex: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<ToastData[]>([]);
  private nextId = 0;
  private activeCount = 0;

  public readonly toastsObservable = this.toasts$.asObservable();

  constructor(private congratulationsService: CongratulationsService) {}

  showToast(points: number, isSuccess: boolean): void {
    const toast: ToastData = {
      id: this.nextId++,
      points,
      isSuccess,
      offsetIndex: this.activeCount,
      message: isSuccess ? this.congratulationsService.getNextPhrase() : undefined
    };

    this.activeCount++;
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    // Auto-fermeture après 3.5 secondes
    setTimeout(() => {
      this.removeToast(toast.id);
    }, 5000);
  }

  private removeToast(id: number): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
    this.activeCount--;
  }
}

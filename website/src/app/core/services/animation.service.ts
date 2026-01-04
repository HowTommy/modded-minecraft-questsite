import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  public triggerConfetti$ = new Subject<void>();

  triggerConfetti(): void {
    this.triggerConfetti$.next();
  }
}
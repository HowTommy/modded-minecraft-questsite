import { Component, Input, ChangeDetectionStrategy, ElementRef, Renderer2 } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quest-toast',
  templateUrl: './quest-toast.component.html',
  styleUrls: ['./quest-toast.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestToastComponent {
  @Input() points: number = 0;
  @Input() isSuccess: boolean = true;
  @Input() offsetIndex: number = 0;

  constructor(
    private modalController: ModalController,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    // Appliquer le décalage si plusieurs toasts
    if (this.offsetIndex > 0) {
      const toastElement = this.elementRef.nativeElement.querySelector('.toast-backdrop');
      if (toastElement) {
        this.renderer.setStyle(toastElement, 'padding-bottom', `${40 + (this.offsetIndex * 80)}px`);
      }
    }

    // Auto-close après 2 secondes
    setTimeout(() => {
      this.close();
    }, 2000);
  }

  close() {
    this.modalController.dismiss();
  }
}
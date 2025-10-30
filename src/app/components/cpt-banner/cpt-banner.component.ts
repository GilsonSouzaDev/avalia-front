import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cpt-banner',
  imports: [CommonModule],
  templateUrl: './cpt-banner.component.html',
  styleUrl: './cpt-banner.component.scss',
})
export class CptBannerComponent {

  @Input() imageSrc: string = '';

  @Input() altText: string = 'Banner';

  @Input() objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' =
    'cover';
}

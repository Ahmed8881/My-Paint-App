import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaintCanvasComponent } from "./paint-canvas/paint-canvas.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PaintCanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'My-Paint-App';
}

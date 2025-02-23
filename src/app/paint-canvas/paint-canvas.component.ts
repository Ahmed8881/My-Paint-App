import { type AfterViewInit, Component, type ElementRef, Inject, PLATFORM_ID, ViewChild } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { trigger, transition, style, animate } from "@angular/animations";
import { isPlatformBrowser } from "@angular/common";

import { CommonModule } from '@angular/common';
@Component({
  selector: "app-paint-canvas",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule,CommonModule],
  templateUrl: "./paint-canvas.component.html",
  styleUrls: ["./paint-canvas.component.scss"],
  animations: [
    trigger("toolbarAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-20px)", opacity: 0 }),
        animate("300ms cubic-bezier(0.4, 0, 0.2, 1)", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
    trigger("fadeIn", [
      transition(":enter", [
        style({ opacity: 0 }),
        animate("200ms cubic-bezier(0.4, 0, 0.2, 1)", style({ opacity: 1 }))
      ]),
    ]),
  ],
})
export class PaintCanvasComponent implements AfterViewInit {
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild("brushPreview") brushPreviewRef!: ElementRef<HTMLCanvasElement>;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private ctx!: CanvasRenderingContext2D;
  private previewCtx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private history: ImageData[] = [];
  private historyIndex = -1;

  public brushColor = "#6366f1"; // New default color
  public brushSize = 5;
  public isDarkMode = false;
  public brushTypes = ["round", "square", "butt", "gradient"];
  public currentBrushType = "round";
  public gradientColors = ["#6366f1", "#ec4899"]; // Default gradient colors
  public opacity = 1;
  public filters = {
    blur: 0,
    brightness: 100,
    contrast: 100
  };

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const canvas = this.canvasRef.nativeElement;
      const previewCanvas = this.brushPreviewRef.nativeElement;

      this.ctx = canvas.getContext("2d")!;
      this.previewCtx = previewCanvas.getContext("2d")!;

      this.resizeCanvas();
      this.updateBrushPreview();

      window.addEventListener("resize", () => this.resizeCanvas());
      this.saveState();
    }
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 200;

    this.ctx.lineCap = this.currentBrushType as CanvasLineCap;
    this.ctx.lineJoin = "round";
  }

  private updateBrushPreview() {
    const preview = this.brushPreviewRef.nativeElement;
    const ctx = this.previewCtx;

    preview.width = 50;
    preview.height = 50;
    ctx.clearRect(0, 0, preview.width, preview.height);

    if (this.currentBrushType === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 25, 50, 25);
      gradient.addColorStop(0, this.gradientColors[0]);
      gradient.addColorStop(1, this.gradientColors[1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = this.brushColor;
    }

    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(25, 25, this.brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(event.offsetX, event.offsetY);

    if (this.currentBrushType === 'gradient') {
      const gradient = this.ctx.createLinearGradient(
        this.lastX, this.lastY,
        event.offsetX, event.offsetY
      );
      gradient.addColorStop(0, this.gradientColors[0]);
      gradient.addColorStop(1, this.gradientColors[1]);
      this.ctx.strokeStyle = gradient;
    } else {
      this.ctx.strokeStyle = this.brushColor;
    }

    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = this.currentBrushType as CanvasLineCap;
    this.ctx.globalAlpha = this.opacity;
    this.ctx.stroke();
    [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    this.saveState();
  }

  private saveState() {
    const canvas = this.canvasRef.nativeElement;
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(imageData);
    this.historyIndex++;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
    }
  }

  saveCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const link = document.createElement("a");
    link.download = "masterpiece.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle("dark-theme");
  }

  onBrushChange(value: any) {
    if (typeof value === 'string') {
      this.currentBrushType = value;
    }
    this.updateBrushPreview();
  }

  applyFilters() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.filter = `blur(${this.filters.blur}px) brightness(${this.filters.brightness}%) contrast(${this.filters.contrast}%)`;
  }

  resetFilters() {
    this.filters = {
      blur: 0,
      brightness: 100,
      contrast: 100
    };
    this.ctx.filter = 'none';
  }
}
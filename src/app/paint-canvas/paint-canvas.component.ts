import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-paint-canvas',
  templateUrl: './paint-canvas.component.html',
  standalone: true,
  styleUrls: ['./paint-canvas.component.scss']
})
export class PaintCanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  
  public brushColor = '#000000';
  public brushSize = 5;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.resizeCanvas();
    
    // Add event listener for window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 200;
    
    // Set default styles
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    [this.lastX, this.lastY] = [
      event.offsetX,
      event.offsetY
    ];
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.stroke();
    
    [this.lastX, this.lastY] = [event.offsetX, event.offsetY];
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
  }
}
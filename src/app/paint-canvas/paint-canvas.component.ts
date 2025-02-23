import { type AfterViewInit, Component, type ElementRef, ViewChild } from "@angular/core"
import { ReactiveFormsModule } from "@angular/forms"
import { FormsModule } from "@angular/forms"
import { trigger, transition, style, animate } from "@angular/animations"

@Component({
  selector: "app-paint-canvas",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: "./paint-canvas.component.html",
  styleUrls: ["./paint-canvas.component.scss"],
  animations: [
    trigger("toolbarAnimation", [
      transition(":enter", [
        style({ transform: "translateY(-20px)", opacity: 0 }),
        animate("200ms ease-out", style({ transform: "translateY(0)", opacity: 1 })),
      ]),
    ]),
    trigger("fadeIn", [
      transition(":enter", [style({ opacity: 0 }), animate("150ms ease-out", style({ opacity: 1 }))]),
    ]),
  ],
})
export class PaintCanvasComponent implements AfterViewInit {
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>
  @ViewChild("brushPreview") brushPreviewRef!: ElementRef<HTMLCanvasElement>

  private ctx!: CanvasRenderingContext2D
  private previewCtx!: CanvasRenderingContext2D
  private isDrawing = false
  private lastX = 0
  private lastY = 0
  private history: ImageData[] = []
  private historyIndex = -1

  public brushColor = "#000000"
  public brushSize = 5
  public isDarkMode = false
  public brushTypes = ["round", "square", "butt"]
  public currentBrushType = "round"

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement
    const previewCanvas = this.brushPreviewRef.nativeElement

    this.ctx = canvas.getContext("2d")!
    this.previewCtx = previewCanvas.getContext("2d")!

    this.resizeCanvas()
    this.updateBrushPreview()

    window.addEventListener("resize", () => this.resizeCanvas())
    this.saveState() // Save initial blank state
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement
    canvas.width = window.innerWidth - 40
    canvas.height = window.innerHeight - 200

    this.ctx.lineCap = this.currentBrushType as CanvasLineCap
    this.ctx.lineJoin = "round"
  }

  private updateBrushPreview() {
    const preview = this.brushPreviewRef.nativeElement
    const ctx = this.previewCtx

    preview.width = 50
    preview.height = 50

    ctx.clearRect(0, 0, preview.width, preview.height)
    ctx.beginPath()
    ctx.arc(25, 25, this.brushSize / 2, 0, Math.PI * 2)
    ctx.fillStyle = this.brushColor
    ctx.fill()
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true
    ;[this.lastX, this.lastY] = [event.offsetX, event.offsetY]
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return

    this.ctx.beginPath()
    this.ctx.moveTo(this.lastX, this.lastY)
    this.ctx.lineTo(event.offsetX, event.offsetY)
    this.ctx.strokeStyle = this.brushColor
    this.ctx.lineWidth = this.brushSize
    this.ctx.lineCap = this.currentBrushType as CanvasLineCap
    this.ctx.stroke()
    ;[this.lastX, this.lastY] = [event.offsetX, event.offsetY]
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false
      this.saveState()
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height)
    this.saveState()
  }

  private saveState() {
    const canvas = this.canvasRef.nativeElement
    const imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height)

    this.history = this.history.slice(0, this.historyIndex + 1)
    this.history.push(imageData)
    this.historyIndex++
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0)
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      this.ctx.putImageData(this.history[this.historyIndex], 0, 0)
    }
  }

  saveCanvas() {
    const canvas = this.canvasRef.nativeElement
    const link = document.createElement("a")
    link.download = "masterpiece.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    document.body.classList.toggle("dark-theme")
  }

  onBrushChange() {
    this.updateBrushPreview()
  }
}


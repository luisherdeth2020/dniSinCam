import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.css'],
})
export class ScannerComponent implements OnInit {
  @ViewChild('video', { static: true }) video!: ElementRef;
  @ViewChild('capturedImage', { static: true }) capturedImage!: ElementRef;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  captureBox = { x: 0, y: 100, width: 200, height: 200 };
  resizing = false;
  resizeHandleSize = 10;

  constructor() {}

  ngOnInit() {
    this.startVideo();
    this.canvas.nativeElement.width = 640; // Ancho fijo del canvas
    this.canvas.nativeElement.height = 480; // Alto fijo del canvas
    this.drawCaptureBox();
  }

  startResizing(event: TouchEvent) {
    const touch = event.touches[0];
    const mouseX =
      touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY =
      touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    // Verificar si el cursor está sobre el borde del cuadro de selección
    const isRightEdge =
      mouseX >
        this.captureBox.x + this.captureBox.width - this.resizeHandleSize &&
      mouseX < this.captureBox.x + this.captureBox.width &&
      mouseY > this.captureBox.y &&
      mouseY < this.captureBox.y + this.captureBox.height;

    const isBottomEdge =
      mouseY >
        this.captureBox.y + this.captureBox.height - this.resizeHandleSize &&
      mouseY < this.captureBox.y + this.captureBox.height &&
      mouseX > this.captureBox.x &&
      mouseX < this.captureBox.x + this.captureBox.width;

    if (isRightEdge || isBottomEdge) {
      this.resizing = true;
    }
  }

  resize(event: TouchEvent) {
    if (!this.resizing) return;
    event.preventDefault();

    const touch = event.touches[0];
    const mouseX =
      touch.clientX - this.canvas.nativeElement.getBoundingClientRect().left;
    const mouseY =
      touch.clientY - this.canvas.nativeElement.getBoundingClientRect().top;

    // Calcular el cambio en el tamaño
    const newWidth = mouseX - this.captureBox.x;
    const newHeight = mouseY - this.captureBox.y;

    // Actualizar el tamaño del cuadro de selección
    this.captureBox.width = Math.max(newWidth, this.resizeHandleSize);
    this.captureBox.height = Math.max(newHeight, this.resizeHandleSize);

    // Volver a dibujar el cuadro de selección
    this.drawCaptureBox();
  }

  stopResizing() {
    // this.resizing = false;
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    this.resizeCanvas();
    // this.startVideo();

  }

  resizeCanvas() {
    const videoElement: HTMLVideoElement = this.video.nativeElement;
    const videoWidth = window.innerWidth; // Ancho de la ventana del navegador
    const videoHeight = window.innerHeight * 0.8; // 80% de la altura de la ventana del navegador
    videoElement.width = videoWidth;
    videoElement.height = videoHeight;
    this.canvas.nativeElement.width = videoWidth;
    this.canvas.nativeElement.height = videoHeight;
    this.drawCaptureBox();
  }
  async startVideo() {
    if (navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        const videoElement: HTMLVideoElement = this.video.nativeElement;
        videoElement.srcObject = stream;
      } catch (error) {
        console.error('Error accessing the camera', error);
      }
    }
  }

  drawCaptureBox() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.strokeStyle = '#FF0000';
      ctx.strokeRect(
        this.captureBox.x,
        this.captureBox.y,
        this.captureBox.width,
        this.captureBox.height
      );

      console.log('x--',this.captureBox.x);
      console.log('y--',this.captureBox.y);
      console.log('width---',this.captureBox.width);
      console.log('height---',this.captureBox.height);

      // Dibujar el asa de redimensionamiento
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(
        this.captureBox.x + this.captureBox.width - this.resizeHandleSize,
        this.captureBox.y + this.captureBox.height - this.resizeHandleSize,
        this.resizeHandleSize,
        this.resizeHandleSize
      );
    }
  }

  captureImage() {
    const ctx = this.canvas.nativeElement.getContext('2d');
    const capturedCanvas = document.createElement('canvas');
    const capturedCtx = capturedCanvas.getContext('2d');

    if (ctx && capturedCtx) {
      // Obtener las dimensiones reales del video original
      const videoWidth = this.video.nativeElement.videoWidth;
      const videoHeight = this.video.nativeElement.videoHeight;

      // Calcular las proporciones entre el cuadro de selección y las dimensiones reales del video
      const widthRatio = videoWidth / this.canvas.nativeElement.width;
      const heightRatio = videoHeight / this.canvas.nativeElement.height;

      // Calcular la posición y el tamaño del cuadro de captura en relación con el video original
      const captureBoxX = this.captureBox.x * widthRatio;
      const captureBoxY = this.captureBox.y * heightRatio;
      const captureBoxWidth = this.captureBox.width * widthRatio;
      const captureBoxHeight = this.captureBox.height * heightRatio;

      // Configurar el tamaño del lienzo capturado para que coincida con las dimensiones del cuadro de captura
      capturedCanvas.width = captureBoxWidth;
      capturedCanvas.height = captureBoxHeight;

      // Dibujar el cuadro de captura en el lienzo capturado, ajustando las proporciones del video original
      capturedCtx.drawImage(
        this.video.nativeElement,
        captureBoxX,
        captureBoxY,
        captureBoxWidth,
        captureBoxHeight,
        0,
        0,
        captureBoxWidth,
        captureBoxHeight
      );

      // Obtener la URL de la imagen del lienzo capturado en base64
      const imageDataUrl = capturedCanvas.toDataURL('image/png');
      console.log('Image data URL:', imageDataUrl);

      // Mostrar la imagen capturada en el elemento img
      this.capturedImage.nativeElement.src = imageDataUrl;
      this.capturedImage.nativeElement.style.display = 'block';
      this.capturedImage.nativeElement.style.position = 'absolute';
    } else {
      console.error('Contexto de canvas no disponible.');
    }
  }












}

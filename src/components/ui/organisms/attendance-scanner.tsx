"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, CameraOff, ScanQrCode } from "lucide-react";

type Action = (formData: FormData) => Promise<void> | void;

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function AttendanceScanner({ action }: { action: Action }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => stopScanner();
  }, []);

  async function startScanner() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador no permite abrir la camara. Usa registro manual.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      setIsScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = window.BarcodeDetector
        ? new window.BarcodeDetector({ formats: ["qr_code"] })
        : null;
      scanFrame(detector);
    } catch {
      setError("No se pudo abrir la camara. Revisa permisos o usa registro manual.");
      stopScanner();
    }
  }

  function scanFrame(detector: InstanceType<BarcodeDetectorConstructor> | null) {
    const video = videoRef.current;

    if (!video || isSubmittingRef.current) {
      return;
    }

    detectQrToken(video, detector)
      .then((codes) => {
        if (codes && inputRef.current && formRef.current) {
          isSubmittingRef.current = true;
          setIsSubmitting(true);
          inputRef.current.value = codes;
          stopScanner();
          formRef.current.requestSubmit();
          return;
        }

        frameRef.current = window.requestAnimationFrame(() => scanFrame(detector));
      })
      .catch(() => {
        frameRef.current = window.requestAnimationFrame(() => scanFrame(detector));
      });
  }

  async function detectQrToken(
    video: HTMLVideoElement,
    detector: InstanceType<BarcodeDetectorConstructor> | null,
  ) {
    if (detector) {
      const codes = await detector.detect(video);

      return codes[0]?.rawValue ?? null;
    }

    return detectQrTokenWithCanvas(video);
  }

  function detectQrTokenWithCanvas(video: HTMLVideoElement) {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return null;
    }

    const canvas = getScannerCanvas(width, height);
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) {
      return null;
    }

    context.drawImage(video, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const result = jsQR(imageData.data, width, height, {
      inversionAttempts: "dontInvert",
    });

    return result?.data ?? null;
  }

  function getScannerCanvas(width: number, height: number) {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    const canvas = canvasRef.current;

    if (canvas.width !== width) {
      canvas.width = width;
    }

    if (canvas.height !== height) {
      canvas.height = height;
    }

    return canvas;
  }

  function stopScanner() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <form ref={formRef} action={action}>
        <input ref={inputRef} name="qrToken" type="hidden" />
      </form>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Camara
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Escanear QR</h2>
        </div>
        <ScanQrCode className="shrink-0 text-[#ff2fa8]" size={26} />
      </div>

      <div className="mt-5 aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={startScanner}
          disabled={isScanning || isSubmitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Camera size={18} />
          {isSubmitting ? "Registrando..." : "Abrir camara"}
        </button>
        <button
          type="button"
          onClick={stopScanner}
          disabled={!isScanning}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-white transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CameraOff size={18} />
          Detener
        </button>
      </div>
    </div>
  );
}

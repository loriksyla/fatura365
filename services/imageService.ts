const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
const TARGET_MAX_BYTES = 180 * 1024;
const MIN_QUALITY = 0.5;

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Imazhi nuk u lexua.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Nuk u lexua file-i.'));
    reader.readAsDataURL(file);
  });

const resizeDimensions = (width: number, height: number) => {
  const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Nuk u krijua imazhi i kompresuar.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Nuk u lexua imazhi i kompresuar.'));
    reader.readAsDataURL(blob);
  });

export const compressImageToDataUrl = async (file: File): Promise<string> => {
  const img = await loadImageFromFile(file);
  const { width, height } = resizeDimensions(img.width, img.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas nuk u inicializua.');
  }

  // JPEG nuk ruan transparencë; pa këtë disa logo PNG dalin me sfond të zi.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let compressed = await canvasToBlob(canvas, quality);

  while (compressed.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.1;
    compressed = await canvasToBlob(canvas, quality);
  }

  return blobToDataUrl(compressed);
};

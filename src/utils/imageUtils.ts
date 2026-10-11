export async function fileToCompressedDataUrl(
  file: File,
  maxDimension = 1024,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Görsel okunamadı.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}

export async function imageUrlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:image/')) {
    return url;
  }
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
  return fileToCompressedDataUrl(file);
}

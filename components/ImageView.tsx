
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';

const STORAGE_KEY = 'benkayrabot_image_history';
const MAX_SAVED_IMAGES = 15;

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [images, setImages] = useState<GeneratedImage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Görsel geçmişi yüklenemedi", e);
      }
    }
    return [];
  });

  useEffect(() => {
    const toSave = images.slice(0, MAX_SAVED_IMAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [images]);

  const applyWatermark = (base64Url: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Url);
          return;
        }

        // Ana görseli çiz
        ctx.drawImage(img, 0, 0);

        const text = "BenKayraBot";
        const fontSize = Math.floor(img.width * 0.035); // Estetik küçüklükte (%3.5)
        ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
        
        // Sağ alt köşe hesaplama
        const metrics = ctx.measureText(text);
        const padding = fontSize * 1.5;
        const x = canvas.width - metrics.width - padding;
        const y = canvas.height - padding;

        // Rengarenk Gradyan (Cyan -> Purple -> Pink)
        const gradient = ctx.createLinearGradient(x, y, x + metrics.width, y);
        gradient.addColorStop(0, "#06b6d4"); // Cyan
        gradient.addColorStop(0.5, "#a855f7"); // Purple
        gradient.addColorStop(1, "#ec4899"); // Pink

        // Okunabilirlik için hafif gölge
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Yazıyı çiz
        ctx.fillStyle = gradient;
        ctx.fillText(text, x, y);

        // Gölgeyi sıfırla (diğer işlemler için)
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Url;
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const rawUrl = await generateImage(prompt, aspectRatio);
      const watermarkedUrl = await applyWatermark(rawUrl);
      
      const newImg: GeneratedImage = {
        id: Date.now().toString(),
        url: watermarkedUrl,
        prompt,
        timestamp: Date.now()
      };
      setImages(prev => [newImg, ...prev]);
      setPrompt('');
    } catch (error) {
      alert("Görsel oluşturulurken bir hata oluştu: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGallery = () => {
    if (confirm("Tüm galeriyi silmek istediğinize emin misiniz?")) {
      setImages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <header className="p-4 border-b border-slate-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Görsel Oluşturma</h2>
          <p className="text-xs text-slate-500">Galeriniz cihazınıza kaydedilir ({images.length}/{MAX_SAVED_IMAGES})</p>
        </div>
        {images.length > 0 && (
          <button 
            onClick={clearGallery}
            className="text-slate-500 hover:text-red-400 transition-colors p-2"
            title="Galeriyi Temizle"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="glass rounded-3xl p-6 shadow-2xl">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Açıklama</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Örn: Siberpunk bir şehirde yağmurda yürüyen neon ışıklı kedi..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Boyut Oranı</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1:1', '4:3', '16:9'].map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 rounded-lg border text-sm transition-all ${
                          aspectRatio === ratio
                            ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end flex-shrink-0">
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/20"
                  >
                    {isGenerating ? (
                      <><i className="fas fa-circle-notch animate-spin"></i> Oluşturuluyor...</>
                    ) : (
                      <><i className="fas fa-wand-magic-sparkles"></i> Oluştur</>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="space-y-4 pb-12">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-images text-slate-400"></i> Galeri
            </h3>
            
            {images.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
                <i className="fas fa-cloud-upload-alt text-4xl mb-4"></i>
                <p>Henüz bir görsel oluşturulmadı.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isGenerating && (
                  <div className="aspect-square bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 animate-pulse">
                     <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                        <i className="fas fa-sparkles text-purple-500 text-xl"></i>
                     </div>
                     <p className="text-sm text-slate-400">Hayal gücü işleniyor...</p>
                  </div>
                )}
                {images.map((img) => (
                  <div key={img.id} className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-purple-500/50 transition-all">
                    <div className="relative overflow-hidden">
                      <img src={img.url} alt={img.prompt} className="w-full h-auto object-cover" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform z-20">
                      <p className="text-xs text-slate-200 line-clamp-2 italic">"{img.prompt}"</p>
                      <div className="flex justify-end gap-2 mt-2">
                        <a 
                          href={img.url} 
                          download={`benkayrabot-${img.id}.png`}
                          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                        >
                          <i className="fas fa-download text-xs"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ImageView;

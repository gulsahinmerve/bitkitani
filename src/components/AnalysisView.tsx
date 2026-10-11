import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Droplets,
  Sun,
  Save,
  RotateCcw,
  X,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Scissors,
  Sprout,
  Compass,
  Edit3,
  CalendarClock,
  ShieldAlert,
  TrendingUp,
  Check,
} from 'lucide-react';
import {
  AIAnalysisResult,
  GardenPlant,
  SamplePlantPhoto,
} from '../types';
import {
  SAMPLE_GARDEN_PHOTOS,
  YILDIZKENT_CAMPUS_ZONES,
  formatTurkishShortDate,
  getStatusFromScore,
  getStatusLabel,
} from '../data/initialGardenData';
import {
  fileToCompressedDataUrl,
  imageUrlToDataUrl,
} from '../utils/imageUtils';
import { ResilientImage } from './ResilientImage';

interface AnalysisViewProps {
  plants: GardenPlant[];
  preselectedPlantId: string | null;
  initialCaptureMode?: 'camera' | 'gallery' | null;
  onClearPreselected: () => void;
  onOpenTimelineForPlant?: (plantId: string) => void;
  onSaveObservation: (payload: {
    targetPlantId: string | 'new';
    confirmedPlantName: string;
    confirmedScientificName: string;
    newPlantLocation: string;
    mapX: number;
    mapY: number;
    studentNote: string;
    observerGroup: string;
    performedCareAction: string;
    nextCheckupDate: string;
    imageUrl: string;
    analysis: AIAnalysisResult;
  }) => string; // returns saved plantId
}

function getOneWeekLaterDateStr(baseDate?: string): string {
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  plants,
  preselectedPlantId,
  initialCaptureMode,
  onClearPreselected,
  onOpenTimelineForPlant,
  onSaveObservation,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [targetPlantId, setTargetPlantId] = useState<string>(
    preselectedPlantId || 'new'
  );
  const [newPlantLocation, setNewPlantLocation] = useState<string>(
    YILDIZKENT_CAMPUS_ZONES[0].name
  );
  const [mapCoords, setMapCoords] = useState<{ x: number; y: number }>({
    x: 24,
    y: 72,
  });
  const [studentNote, setStudentNote] = useState<string>('');
  const [performedCareAction, setPerformedCareAction] = useState<string>(
    'Düzenli kök sulaması yapıldı ve kuruyan yaprak uçları temizlendi.'
  );
  const [observerGroup, setObserverGroup] = useState<string>(
    'Yıldızkent 7-A Fen ve Ekoloji Kulübü'
  );
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(
    null
  );

  // Step 2: Plant Identification Confirmation State
  const [isPlantConfirmed, setIsPlantConfirmed] = useState<boolean>(false);
  const [isEditingPlantIdentity, setIsEditingPlantIdentity] =
    useState<boolean>(false);
  const [confirmedPlantName, setConfirmedPlantName] = useState<string>('');
  const [confirmedScientificName, setConfirmedScientificName] =
    useState<string>('');

  // Step 3: Next Week Checkup Date (1 week later reminder)
  const [nextCheckupDate, setNextCheckupDate] = useState<string>(() =>
    getOneWeekLaterDateStr()
  );

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [lastSavedPlantId, setLastSavedPlantId] = useState<string | null>(null);

  // Interactive Science Simulation state
  const [simWaterLevel, setSimWaterLevel] = useState<number>(70);
  const [simSunlightLevel, setSimSunlightLevel] = useState<number>(80);

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (preselectedPlantId) {
      setTargetPlantId(preselectedPlantId);
      const found = plants.find((p) => p.id === preselectedPlantId);
      if (found) {
        setNewPlantLocation(found.location);
        setMapCoords({ x: found.mapX, y: found.mapY });
      }
    }
  }, [preselectedPlantId, plants]);

  useEffect(() => {
    if (initialCaptureMode === 'camera') {
      startWebCamera();
    } else if (initialCaptureMode === 'gallery') {
      fileInputRef.current?.click();
    }
  }, [initialCaptureMode]);

  useEffect(() => {
    return () => {
      stopWebCamera();
    };
  }, []);

  const handleZoneChange = (zoneName: string) => {
    setNewPlantLocation(zoneName);
    const zoneIndex = YILDIZKENT_CAMPUS_ZONES.findIndex(
      (z) => z.name === zoneName
    );
    const presetCoords = [
      { x: 22, y: 74 },
      { x: 42, y: 40 },
      { x: 76, y: 24 },
      { x: 74, y: 68 },
      { x: 20, y: 42 },
    ];
    if (zoneIndex >= 0 && presetCoords[zoneIndex]) {
      setMapCoords(presetCoords[zoneIndex]);
    }
  };

  const handleMiniMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setMapCoords({
      x: Math.max(8, Math.min(92, x)),
      y: Math.max(10, Math.min(90, y)),
    });
  };

  const startWebCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Tarayıcı kamera erişimi sağlanamadı. Aşağıdaki butondan telefon kamerasını veya galeriyi doğrudan açabilirsiniz.'
      );
    }
  };

  const stopWebCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      setAnalysisResult(null);
      setIsPlantConfirmed(false);
      setSavedSuccess(false);
      stopWebCamera();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setAnalysisResult(null);
    setIsPlantConfirmed(false);
    setSavedSuccess(false);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setSelectedImage(dataUrl);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Fotoğraf yüklenirken hata oluştu.'
      );
    }
  };

  const handleSelectSamplePhoto = async (sample: SamplePlantPhoto) => {
    setErrorMsg(null);
    setAnalysisResult(null);
    setIsPlantConfirmed(false);
    setSavedSuccess(false);
    setTargetPlantId(sample.linkedPlantId);
    setNewPlantLocation(sample.location);
    const linked = plants.find((p) => p.id === sample.linkedPlantId);
    if (linked) {
      setMapCoords({ x: linked.mapX, y: linked.mapY });
    }
    try {
      const dataUrl = await imageUrlToDataUrl(sample.imageUrl);
      setSelectedImage(dataUrl);
    } catch {
      setSelectedImage(sample.imageUrl);
    }
  };

  const runGeminiAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSavedSuccess(false);
    setIsPlantConfirmed(false);
    setIsEditingPlantIdentity(false);

    try {
      let base64Payload = selectedImage;
      if (!selectedImage.startsWith('data:image/')) {
        base64Payload = await imageUrlToDataUrl(selectedImage);
      }

      const linkedPlant =
        targetPlantId !== 'new'
          ? plants.find((p) => p.id === targetPlantId)
          : undefined;

      const previousObservations = linkedPlant
        ? linkedPlant.observations.map((o) => ({
            date: o.date,
            healthScore: o.healthScore,
            performedCareAction: o.performedCareAction,
            summary: o.analysis.similarityStatement,
          }))
        : [];

      const plantContext = linkedPlant
        ? `Yıldızkent Ortaokulu Bitki No: ${linkedPlant.plantNumber}, Kayıtlı Bitki Adı: ${linkedPlant.plantName}, Bahçe Konumu: ${linkedPlant.location}`
        : `Yıldızkent Ortaokulu Yeni Bitki Gözlemi, Seçilen Bahçe Konumu: ${newPlantLocation}`;

      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: 'image/jpeg',
          plantContext,
          previousObservations,
          appliedCareDescription: performedCareAction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analiz sırasında bir hata oluştu.');
      }

      const result = data as AIAnalysisResult;
      setAnalysisResult(result);
      setConfirmedPlantName(result.plantName);
      setConfirmedScientificName(result.scientificName);
      setNextCheckupDate(getOneWeekLaterDateStr());
      setSimWaterLevel(result.healthScoreBreakdown?.drynessControl ?? 75);
      setSimSunlightLevel(result.healthScoreBreakdown?.colorCondition ?? 80);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Yapay zekâ analizi tamamlanamadı. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisResult || !selectedImage) return;

    const updatedAnalysis: AIAnalysisResult = {
      ...analysisResult,
      plantName: confirmedPlantName.trim() || analysisResult.plantName,
      scientificName:
        confirmedScientificName.trim() || analysisResult.scientificName,
    };

    const savedId = onSaveObservation({
      targetPlantId,
      confirmedPlantName: updatedAnalysis.plantName,
      confirmedScientificName: updatedAnalysis.scientificName,
      newPlantLocation,
      mapX: mapCoords.x,
      mapY: mapCoords.y,
      studentNote:
        studentNote.trim() ||
        `Yıldızkent Ortaokulu saha gözlemi: ${updatedAnalysis.plantName} onaylandı ve ${newPlantLocation} konumuna kaydedildi. Tahmini sağlık puanı: ${updatedAnalysis.healthScore}/100.`,
      observerGroup:
        observerGroup.trim() || 'Yıldızkent 7-A Fen ve Ekoloji Kulübü',
      performedCareAction:
        performedCareAction.trim() || 'Haftalık gözlem ve bakım yapıldı.',
      nextCheckupDate,
      imageUrl: selectedImage,
      analysis: updatedAnalysis,
    });
    setLastSavedPlantId(savedId);
    setSavedSuccess(true);
  };

  const targetPlantObj =
    targetPlantId !== 'new'
      ? plants.find((p) => p.id === targetPlantId)
      : undefined;

  const previousObs =
    targetPlantObj && targetPlantObj.observations.length > 0
      ? targetPlantObj.observations[targetPlantObj.observations.length - 1]
      : null;

  const previousScore = previousObs ? previousObs.healthScore : null;
  const scoreDiff =
    analysisResult && previousScore !== null
      ? analysisResult.healthScore - previousScore
      : null;

  // Interactive simulation calculation
  const waterBalanceFactor = 100 - Math.abs(simWaterLevel - 72) * 1.15;
  const lightBalanceFactor = 100 - Math.abs(simSunlightLevel - 78) * 1.05;
  const simulatedPhotosynthesisRate = Math.max(
    15,
    Math.min(
      100,
      Math.round(waterBalanceFactor * 0.5 + lightBalanceFactor * 0.5)
    )
  );

  // Determine current wizard step for clear student guidance
  const currentStep = !selectedImage
    ? 1
    : !analysisResult
    ? 1
    : !isPlantConfirmed
    ? 2
    : !savedSuccess
    ? 3
    : 4;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu · Adım Adım Bitki Tanıma, Hasar Tespiti ve Haftalık Bakım Doğrulama Sistemi
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            🌱 Bitki Fotoğrafı Analizi, Tür Onayı ve Haftalık Takip Kaydı
          </h1>
        </div>
        {selectedImage && (
          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              setAnalysisResult(null);
              setIsPlantConfirmed(false);
              setSavedSuccess(false);
              onClearPreselected();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-900/15 bg-white text-sm font-medium text-[#14241B] hover:bg-emerald-50 transition-colors whitespace-nowrap self-start"
          >
            <RotateCcw className="w-4 h-4" />
            Yeni Fotoğraf Çek / Yükle
          </button>
        )}
      </div>

      {/* 4-Step Interactive Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {[
            {
              step: 1,
              title: '1. Fotoğraf Çek & Analiz Et',
              desc: 'Kamerayla çekin veya haftalık kontrol fotoğrafı yükleyin',
            },
            {
              step: 2,
              title: '2. Bitki Türünü Onayla',
              desc: 'Yapay zekânın bulduğu bitkiyi onaylayın veya düzeltin',
            },
            {
              step: 3,
              title: '3. Yaprak Hasarı & Bahçe Konumu',
              desc: 'Hasar raporunu inceleyin ve Yıldızkent bahçe konumunu seçin',
            },
            {
              step: 4,
              title: '4. 1 Hafta Sonra Kontrol & Gelişim',
              desc: 'Uygulanan bakımın doğruluğunu ve gelişim grafiğini izleyin',
            },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <div
                key={item.step}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-50/90 border-emerald-700 text-[#14241B]'
                    : isDone
                    ? 'bg-[#F6F8F5] border-emerald-600/30 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{item.title}</span>
                  {isDone && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] mt-1 leading-relaxed opacity-85">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-emerald-900/15">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-[#14241B]">
                Kamera ile Bitki Fotoğrafı Çek
              </h2>
              <button
                type="button"
                onClick={stopWebCamera}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-3">
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopWebCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors"
                  >
                    Telefon Kamerasını Aç
                  </button>
                </div>
              ) : (
                <>
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-950 relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={captureFromVideo}
                      className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Fotoğrafı Çek
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopWebCamera();
                        cameraInputRef.current?.click();
                      }}
                      className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cihaz Kamerası
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Target Plant Mode & Photo Capture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/10 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#14241B]">
              1. Gözlem Türünü Seçin ve Fotoğraf Çekin
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Bahçede yeni bir bitki keşfedebilir veya geçen hafta kaydettiğiniz bitkinin <strong>1 hafta sonraki kontrol fotoğrafını</strong> yükleyerek bakımınızın doğru olup olmadığını test edebilirsiniz.
            </p>
          </div>

          {/* Mode Toggle: New Plant vs Weekly Checkup */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setTargetPlantId('new')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                targetPlantId === 'new'
                  ? 'bg-[#0F5338] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#14241B]'
              }`}
            >
              🌱 Yeni Bitki Tanımla & Kaydet
            </button>
            <button
              type="button"
              onClick={() => {
                if (targetPlantId === 'new' && plants[0]) {
                  setTargetPlantId(plants[0].id);
                  setNewPlantLocation(plants[0].location);
                  setMapCoords({ x: plants[0].mapX, y: plants[0].mapY });
                }
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                targetPlantId !== 'new'
                  ? 'bg-[#0F5338] text-white shadow-xs'
                  : 'text-slate-700 hover:text-[#14241B]'
              }`}
            >
              📅 1 Hafta Sonraki Kontrol
            </button>
          </div>

          {/* Plant Selector when in Weekly Checkup Mode */}
          {targetPlantId !== 'new' ? (
            <div className="space-y-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-700/20">
              <div>
                <label
                  htmlFor="plant-select"
                  className="block text-xs font-bold text-emerald-950 mb-1"
                >
                  Haftalık Kontrolü Yapılacak Yıldızkent Bitkisi:
                </label>
                <select
                  id="plant-select"
                  value={targetPlantId}
                  onChange={(e) => {
                    setTargetPlantId(e.target.value);
                    const found = plants.find((p) => p.id === e.target.value);
                    if (found) {
                      setNewPlantLocation(found.location);
                      setMapCoords({ x: found.mapX, y: found.mapY });
                    }
                  }}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-emerald-700/30 bg-white text-xs font-semibold text-[#14241B]"
                >
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.plantNumber} · {p.plantName} ({p.location} — Son Puan: {p.latestHealthScore}/100)
                    </option>
                  ))}
                </select>
              </div>

              {previousObs && (
                <div className="text-[11px] text-slate-700 space-y-1 pt-2 border-t border-emerald-700/15">
                  <p className="font-semibold text-emerald-950">
                    📌 Geçen Haftaki Öneri ({previousObs.date}):
                  </p>
                  <p className="italic">
                    "{previousObs.analysis.advisorReport || previousObs.analysis.similarityStatement}"
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  Bu Hafta Hangi Bakım Uygulamasını Yaptınız? (Yapay Zekâ Doğrulaması İçin)
                </label>
                <input
                  type="text"
                  value={performedCareAction}
                  onChange={(e) => setPerformedCareAction(e.target.value)}
                  placeholder="Örn: Haftada 2 kez suladım, sarı yaprakları budadım..."
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl border border-emerald-700/30 bg-white text-xs text-[#14241B]"
                />
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#F6F8F5] border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#14241B]">
                🔍 Yeni Bitki Keşif ve Kayıt Modu Aktif (#B-0{plants.length + 1})
              </p>
              <p className="leading-relaxed">
                Fotoğrafı çektiğinizde yapay zekâ bitkinin türünü bulacak, sizden <strong>onay isteyecek</strong>, ardından bahçedeki konumunu seçip kaydedebileceksiniz.
              </p>
            </div>
          )}

          {/* Big Touch Buttons for Camera & Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={startWebCamera}
              className="min-h-[56px] px-4 py-3.5 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
            >
              <Camera className="w-5 h-5 shrink-0" />
              <span className="whitespace-nowrap">Kamerayla Çek</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[56px] px-4 py-3.5 rounded-xl bg-emerald-50 border border-emerald-700/25 text-emerald-950 font-semibold text-sm hover:bg-emerald-100/80 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5"
            >
              <Upload className="w-5 h-5 shrink-0 text-emerald-800" />
              <span className="whitespace-nowrap">Galeriden Yükle</span>
            </button>
          </div>

          {/* Photo Shooting Guide: Whole Plant vs Leaf Close-up */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-700/20 space-y-2 text-xs">
            <p className="font-bold text-emerald-950 flex items-center gap-1.5">
              📸 Fotoğrafı Nasıl Çekmeliyiz? (Yaprak mı, Tüm Bitki mi?)
            </p>
            <ul className="space-y-1 text-[11px] text-slate-700 leading-relaxed list-disc list-inside">
              <li>
                <strong>En İdeal Çekim (Orta Mesafe — 30-50 cm):</strong> Hem birkaç dalın/gövdenin hem de <strong>yaprak yüzeylerinin net göründüğü</strong> tek bir kare en yüksek doğruluğu sağlar.
              </li>
              <li>
                <strong>Bitki Türünü Tanıması İçin:</strong> Bitkinin genel dal dizilişi, çiçek/tomurcuk yapısı ve yaprak şekli kadrajda olmalıdır.
              </li>
              <li>
                <strong>Yaprak Hasarı Tespiti İçin:</strong> Sararma, kuruma veya leke olan yaprakların kameraya <strong>net odaklanmış</strong> ve aydınlık olması yeterlidir.
              </li>
            </ul>
          </div>

          {/* Sample School Garden Photos for Immediate Testing */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
            <span className="block text-xs font-semibold text-slate-700">
              Yıldızkent Ortaokulu Örnek Bitki Fotoğrafları (Hızlı Test):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_GARDEN_PHOTOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSamplePhoto(sample)}
                  className="group text-left p-2 rounded-xl border border-slate-200 hover:border-emerald-600 bg-[#F6F8F5]/60 hover:bg-emerald-50/50 transition-all flex items-center gap-2 min-h-[50px]"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <ResilientImage
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#14241B] truncate">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {sample.location}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Preview & Analyze Trigger */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/10 flex flex-col justify-between space-y-5">
          {selectedImage ? (
            <>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-[#14241B]">
                    📸 İncelenecek Bitki Fotoğrafı
                    {targetPlantObj
                      ? ` · #${targetPlantObj.plantNumber} ${targetPlantObj.plantName} (Hafta ${targetPlantObj.observations.length + 1} Kontrolü)`
                      : ` · Yeni Bitki Kaydı (#B-0${plants.length + 1})`}
                  </span>
                  {previousScore !== null && (
                    <span className="font-mono tabular-nums text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Önceki Hafta Puanı: {previousScore}/100
                    </span>
                  )}
                </div>
                <div className="aspect-[16/10] w-full max-h-[340px] rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                  <ResilientImage
                    src={selectedImage}
                    alt="Analiz edilecek bitki fotoğrafı"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Analiz Uyarısı</p>
                    <p className="text-xs mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={runGeminiAnalysis}
                className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-[#0F5338] text-white font-bold text-base hover:bg-[#0B3F2A] disabled:opacity-60 transition-all flex items-center justify-center gap-2.5 shadow-md"
              >
                <Sparkles className="w-5 h-5" />
                <span>
                  {isAnalyzing
                    ? 'Yapay Zekâ Bitki Türünü, Yaprak Hasarını ve Bakım Etkisini İnceliyor...'
                    : '🔍 Bitkiyi Tanı, Yaprak Hasarını Tespit Et ve Bakımı Kontrol Et'}
                </span>
              </button>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-emerald-900/15 rounded-xl bg-[#F6F8F5]/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#14241B]">
                Bitki Fotoğrafını Çekin veya Yükleyin
              </h3>
              <p className="text-xs text-slate-600 max-w-md mt-1.5 leading-relaxed">
                Fotoğraf yüklediğinizde yapay zekâ önce hangi bitki olduğunu bulup <strong>onayınızı isteyecek</strong>, yapraklarda hasar/hastalık belirtisi varsa tespit edecek ve <strong>1 hafta sonraki kontrol</strong> için dijital veri kaydı oluşturacaktır.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
          STEP 2: AI PLANT IDENTIFICATION & USER CONFIRMATION GATE
         ===================================================================== */}
      {analysisResult && (
        <div className="space-y-8 pt-2">
          <div
            className={`rounded-3xl p-6 sm:p-8 border-2 transition-all space-y-5 ${
              isPlantConfirmed
                ? 'bg-emerald-50/70 border-emerald-600'
                : 'bg-amber-50/90 border-amber-500 shadow-lg'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                    isPlantConfirmed
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {isPlantConfirmed
                    ? '✅ 2. ADIM TAMAMLANDI: BİTKİ TÜRÜ ONAYLANDI'
                    : '🤖 2. ADIM: YAPAY ZEKÂ BİTKİ TAHMİNİ — LÜTFEN ONAYLAYIN'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#14241B] pt-1">
                  Yapay Zekâ Bu Bitkiyi{' '}
                  <span className="underline decoration-emerald-600 decoration-2 underline-offset-4">
                    “{confirmedPlantName}”
                  </span>{' '}
                  ({confirmedScientificName}) Olarak Tespit Etti
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Tahmin Güven Oranı:{' '}
                  <strong className="font-mono text-emerald-900">
                    %{analysisResult.identificationConfidence || 94}
                  </strong>{' '}
                  · Bahçe konumunu seçip kaydetmeden önce bu bitki türünün doğru olduğunu onaylıyor musunuz?
                </p>
              </div>

              {isPlantConfirmed && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPlantConfirmed(false);
                    setIsEditingPlantIdentity(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-800/25 bg-white text-xs font-semibold text-emerald-950 hover:bg-emerald-100"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Tür Bilgisini Değiştir
                </button>
              )}
            </div>

            {/* Editable Plant Name if user wants to correct AI prediction */}
            {isEditingPlantIdentity && !isPlantConfirmed && (
              <div className="p-4 rounded-2xl bg-white border border-amber-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doğru Bitki Adı (Türkçe):
                  </label>
                  <input
                    type="text"
                    value={confirmedPlantName}
                    onChange={(e) => setConfirmedPlantName(e.target.value)}
                    placeholder="Örn: Genç Zeytin Ağacı, Bahçe Gülü..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bilimsel Adı (İsteğe Bağlı):
                  </label>
                  <input
                    type="text"
                    value={confirmedScientificName}
                    onChange={(e) => setConfirmedScientificName(e.target.value)}
                    placeholder="Örn: Olea europaea"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-sm italic"
                  />
                </div>
              </div>
            )}

            {!isPlantConfirmed && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlantConfirmed(true);
                    setIsEditingPlantIdentity(false);
                  }}
                  className="min-h-[50px] px-6 py-3 rounded-xl bg-[#0F5338] hover:bg-[#0B3F2A] text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>
                    Evet, “{confirmedPlantName}” Olduğunu Onaylıyorum
                  </span>
                </button>

                {!isEditingPlantIdentity ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingPlantIdentity(true)}
                    className="min-h-[50px] px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm flex items-center gap-2 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Hayır, Bitki Adını Ben Düzelteceğim</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlantConfirmed(true);
                      setIsEditingPlantIdentity(false);
                    }}
                    className="min-h-[50px] px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Düzenlenen Bitki Adını Onayla</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* =====================================================================
              LEAF DAMAGE & DISEASE SIMILARITY DETECTION + WEEKLY CARE VERIFICATION
             ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Leaf Damage & Disease Similarity Detection Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-emerald-900/15 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                  <h3 className="text-lg font-bold text-[#14241B]">
                    🍂 Yaprak Hasarı ve Hastalık Belirtisi Tespiti
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    analysisResult.leafDamageReport?.hasDamage
                      ? 'bg-amber-100 text-amber-950'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  Hasar Seviyesi:{' '}
                  {analysisResult.leafDamageReport?.damageSeverity ||
                    (analysisResult.healthScore >= 80
                      ? 'Yok / Sağlıklı'
                      : 'Hafif')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F6F8F5] border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-[#14241B]">
                  🔍 Tespit Edilen Yaprak ve Doku Bulguları:
                </p>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                  {(
                    analysisResult.leafDamageReport?.detectedIssues ||
                    analysisResult.visualFindings
                  ).map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs">
                <p className="font-bold text-amber-950">
                  🧪 Hastalık / Zararlı / Stres Benzerlik Değerlendirmesi:
                </p>
                <p className="text-slate-800 leading-relaxed">
                  {analysisResult.leafDamageReport?.diseaseOrPestSimilarity ||
                    analysisResult.leafStemColorAnalysis.pestOrDiseaseRisk ||
                    analysisResult.similarityStatement}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-700/25 space-y-1.5 text-xs">
                <p className="font-bold text-emerald-950">
                  💡 Yaprak Hasarına Karşı Hemen Uygulanacak Öneri:
                </p>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {analysisResult.leafDamageReport?.immediateActionPlan ||
                    analysisResult.careRecommendations[0]}
                </p>
              </div>
            </div>

            {/* Right: Care Verification ("Uygulamamız Doğru mu?") & 1-Week Follow-up */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-emerald-900/15 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-lg font-bold text-[#14241B]">
                      ✅ Bakım Doğrulama: “Uygulamamız Doğru mu?”
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-950 text-xs font-bold">
                    {previousObs
                      ? `Hafta ${previousObs.weekNumber || 1} → Hafta ${(previousObs.weekNumber || 1) + 1}`
                      : '1. Hafta Başlangıç Kaydı'}
                  </span>
                </div>

                {/* Comparison Score Banner if Weekly Follow-up */}
                {previousObs && scoreDiff !== null ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-700/25 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950">
                        Haftalık Sağlık Puanı Değişimi:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-mono font-bold ${
                          scoreDiff >= 0
                            ? 'bg-emerald-700 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {scoreDiff >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {previousObs.healthScore}p → {analysisResult.healthScore}p (
                        {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff} Puan)
                      </span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      <strong>Değerlendirme:</strong>{' '}
                      {analysisResult.careVerificationReport
                        ?.verificationSummary ||
                        analysisResult.timeComparisonVerdict}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F6F8F5] border border-slate-200 space-y-1.5 text-xs">
                    <p className="font-bold text-[#14241B]">
                      📌 İlk Gözlem ve Bakım Planı Değerlendirmesi:
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      {analysisResult.careVerificationReport
                        ?.verificationSummary ||
                        'Bu kayıt bitkinin başlangıç referans noktasıdır. Önerilen bakım adımlarını uyguladıktan 1 hafta sonra yeni fotoğraf yüklediğinizde sistem bakımınızın doğru olup olmadığını puan değişimiyle kanıtlayacaktır.'}
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#F6F8F5] border border-slate-200 space-y-1.5 text-xs">
                  <p className="font-bold text-[#14241B]">
                    🔎 Gözlenen Gelişim Detayı:
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.careVerificationReport
                      ?.observedImprovementDetails ||
                      analysisResult.advisorReport}
                  </p>
                </div>
              </div>

              {/* Next Week Photo Request Reminder Box */}
              <div className="p-4 rounded-xl bg-[#0F5338] text-white space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-200 uppercase tracking-wider">
                    📅 1 HAFTA SONRA TEKRAR FOTOĞRAF BEKLENİYOR
                  </span>
                  <span className="font-mono font-bold bg-white/15 px-2.5 py-1 rounded-md">
                    {formatTurkishShortDate(nextCheckupDate)} ({nextCheckupDate})
                  </span>
                </div>
                <p className="text-emerald-50 leading-relaxed">
                  <strong>Gelecek Hafta Kontrol Hedefi:</strong>{' '}
                  {analysisResult.careVerificationReport?.nextWeekGoal ||
                    '1 hafta sonra aynı açıdan yeni fotoğraf yükleyerek sulama ve yaprak bakımının sağlık puanını artırıp artırmadığını test edin.'}
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================================
              STEP 3: SELECT GARDEN LOCATION ON MAP & SAVE DIGITAL RECORD
             ===================================================================== */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-800/25 space-y-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  3. ADIM: BAHÇEDEKİ KONUMUNU SEÇ VE DİJİTAL VERİ KAYDINI TAMAMLA
                </span>
                <h3 className="text-xl font-bold text-[#14241B] mt-0.5">
                  📍 Yıldızkent Ortaokulu Bahçe Konumu Seçimi ve Kayıt Formu
                </h3>
              </div>
              {!isPlantConfirmed && (
                <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl">
                  ⚠️ Kaydetmeden önce yukarıdaki kutudan bitki türünü onaylayabilirsiniz
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Interactive Mini Schoolyard Blueprint to pick exact location */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#14241B]">
                    1) Yıldızkent Bahçe Bölgesini Seçin veya Krokiye Dokunun:
                  </label>
                  <span className="font-mono text-emerald-800 font-semibold">
                    Konum: X:%{mapCoords.x}, Y:%{mapCoords.y}
                  </span>
                </div>

                <select
                  value={newPlantLocation}
                  onChange={(e) => handleZoneChange(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-emerald-700/30 bg-[#F6F8F5] text-sm font-semibold text-[#14241B]"
                >
                  {YILDIZKENT_CAMPUS_ZONES.map((z) => (
                    <option key={z.id} value={z.name}>
                      📍 {z.name} ({z.microclimate})
                    </option>
                  ))}
                </select>

                {/* Clickable Mini Blueprint */}
                <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-emerald-900/20 bg-[#E9F2E6]">
                  <svg
                    viewBox="0 0 800 500"
                    onClick={handleMiniMapClick}
                    className="w-full h-full cursor-crosshair"
                    role="img"
                    aria-label="Bahçe konumu seçme krokisi"
                  >
                    <rect width="800" height="500" fill="#E9F2E6" />
                    {/* School Building */}
                    <rect
                      x="45"
                      y="30"
                      width="460"
                      height="95"
                      rx="10"
                      fill="#CBD5E1"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    <text
                      x="275"
                      y="82"
                      textAnchor="middle"
                      className="fill-slate-900 text-[14px] font-bold"
                    >
                      YILDIZKENT ORTAOKULU ANA BİNASI
                    </text>

                    {/* Zones */}
                    <rect
                      x="35"
                      y="145"
                      width="235"
                      height="115"
                      rx="14"
                      fill="#DDF0D5"
                      stroke="#86B97A"
                      strokeWidth="2"
                    />
                    <text
                      x="152"
                      y="205"
                      textAnchor="middle"
                      className="fill-emerald-950 text-[12px] font-bold"
                    >
                      Kütüphane Bahçesi
                    </text>

                    <rect
                      x="35"
                      y="280"
                      width="245"
                      height="185"
                      rx="16"
                      fill="#D4E8CE"
                      stroke="#9EC594"
                      strokeWidth="2"
                    />
                    <text
                      x="157"
                      y="380"
                      textAnchor="middle"
                      className="fill-emerald-950 text-[12px] font-bold"
                    >
                      Ana Giriş & Atatürk Köşesi
                    </text>

                    <rect
                      x="305"
                      y="150"
                      width="210"
                      height="105"
                      rx="14"
                      fill="#DCECD5"
                      stroke="#8AB87E"
                      strokeWidth="2"
                    />
                    <text
                      x="410"
                      y="208"
                      textAnchor="middle"
                      className="fill-emerald-950 text-[12px] font-bold"
                    >
                      A Blok Fen Lab. Gül Tarhı
                    </text>

                    <rect
                      x="540"
                      y="40"
                      width="225"
                      height="175"
                      rx="14"
                      fill="#CFE8E0"
                      stroke="#6BA896"
                      strokeWidth="2"
                    />
                    <text
                      x="652"
                      y="130"
                      textAnchor="middle"
                      className="fill-teal-950 text-[12px] font-bold"
                    >
                      B Blok Ekoloji & Sera
                    </text>

                    <rect
                      x="540"
                      y="240"
                      width="225"
                      height="225"
                      rx="14"
                      fill="#E2E8F0"
                      stroke="#94A3B8"
                      strokeWidth="2"
                    />
                    <text
                      x="652"
                      y="355"
                      textAnchor="middle"
                      className="fill-slate-700 text-[12px] font-bold"
                    >
                      Spor Sahası Çınar Koridoru
                    </text>

                    {/* Selected Position Marker */}
                    <circle
                      cx={(mapCoords.x / 100) * 800}
                      cy={(mapCoords.y / 100) * 500}
                      r={28}
                      fill="#0F5338"
                      fillOpacity={0.25}
                    />
                    <circle
                      cx={(mapCoords.x / 100) * 800}
                      cy={(mapCoords.y / 100) * 500}
                      r={18}
                      fill="#0F5338"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                    />
                    <text
                      x={(mapCoords.x / 100) * 800}
                      y={(mapCoords.y / 100) * 500 + 4}
                      textAnchor="middle"
                      className="fill-white text-[10px] font-bold font-mono"
                    >
                      SEÇİLDİ
                    </text>
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500">
                  İpucu: Bitkinin Yıldızkent Ortaokulu bahçesindeki tam yerini işaretlemek için kroki üzerine dokunabilirsiniz.
                </p>
              </div>

              {/* Right: Metadata, Care Action, Next Week Reminder Date, Student Notes */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-700/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-600 block">
                      Onaylanan Bitki Kimliği:
                    </span>
                    <strong className="text-sm text-[#14241B]">
                      {confirmedPlantName} ({confirmedScientificName})
                    </strong>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-700/20">
                    🌱 {analysisResult.healthScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Yıldızkent Öğrenci Grubu
                    </label>
                    <input
                      type="text"
                      value={observerGroup}
                      onChange={(e) => setObserverGroup(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      📅 1 Hafta Sonraki Fotoğraf Tarihi
                    </label>
                    <input
                      type="date"
                      value={nextCheckupDate}
                      onChange={(e) => setNextCheckupDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-emerald-700/40 bg-emerald-50/40 text-xs font-mono font-bold text-emerald-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uygulanan / Planlanan Bakım İşlemi (Takvim ve Doğrulama İçin)
                  </label>
                  <input
                    type="text"
                    value={performedCareAction}
                    onChange={(e) => setPerformedCareAction(e.target.value)}
                    placeholder="Örn: Kök sulaması yapıldı, hasarlı yapraklar budandı"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Öğrenci Saha Gözlem ve Yaprak Hasar Notu
                  </label>
                  <textarea
                    rows={3}
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Yapraklarda gördüğünüz lekeleri, toprak nemini ve 1 hafta sonra kontrol edeceğiniz değişimi not edin..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={savedSuccess}
                    onClick={() => {
                      if (!isPlantConfirmed) {
                        setIsPlantConfirmed(true);
                      }
                    }}
                    className="w-full min-h-[52px] px-6 py-3.5 rounded-xl bg-[#0F5338] text-white font-bold text-sm hover:bg-[#0B3F2A] disabled:bg-emerald-800/50 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {savedSuccess
                        ? '✅ Dijital Gözlem ve 1 Hafta Sonraki Kontrol Kaydedildi!'
                        : `Bitkiyi (${confirmedPlantName}) Bahçe Konumuna Kaydet ve 1 Haftalık Takibi Başlat`}
                    </span>
                  </button>

                  {savedSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-600/40 space-y-3">
                      <div className="flex items-start gap-2.5 text-xs text-emerald-950">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            Dijital Veri Kaydı Başarıyla Oluşturuldu!
                          </p>
                          <p className="mt-0.5 text-slate-700">
                            <strong>{confirmedPlantName}</strong> bitkisinin sağlık ve yaprak hasar raporu{' '}
                            <strong>{newPlantLocation}</strong> konumuna kaydedildi. Bir sonraki fotoğraf kontrolü:{' '}
                            <strong>{formatTurkishShortDate(nextCheckupDate)}</strong>.
                          </p>
                        </div>
                      </div>

                      {onOpenTimelineForPlant && lastSavedPlantId && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenTimelineForPlant(lastSavedPlantId)
                          }
                          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            📈 Şimdi Bitkinin Haftalık Gelişim Grafiğini ve Karşılaştırmasını Gör
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* =====================================================================
              DETAILED AI REPORT: HEALTH SCORE BREAKDOWN + 5 SMART RECOMMENDATIONS + SCIENCE
             ===================================================================== */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-900/15 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3.5">
                <div className="text-xs font-medium text-emerald-800">
                  🌱 Onaylanan Bitki Kimliği ·{' '}
                  <span className="italic">{confirmedScientificName}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#14241B]">
                  {confirmedPlantName}
                </h2>

                {analysisResult.advisorReport && (
                  <div className="p-4 rounded-xl bg-[#0F5338] text-white text-sm leading-relaxed space-y-1">
                    <p className="font-bold text-emerald-200 text-xs uppercase tracking-wider">
                      🤖 Haftalık Bitki Bakım Danışmanı Raporu:
                    </p>
                    <p className="font-medium">{analysisResult.advisorReport}</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-800/20 text-[#14241B] text-sm leading-relaxed">
                  <p className="font-semibold text-emerald-950">
                    Bilimsel Ön Değerlendirme Notu:
                  </p>
                  <p className="mt-1 text-slate-800">
                    {analysisResult.similarityStatement.startsWith(
                      'Fotoğraftaki belirtiler'
                    )
                      ? analysisResult.similarityStatement
                      : `Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir: ${analysisResult.similarityStatement}`}
                  </p>
                </div>
              </div>

              {/* Health Score Gauge & Breakdown */}
              <div className="lg:col-span-5 bg-[#F6F8F5] rounded-xl p-5 border border-emerald-900/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">
                      Tahmini Bitki Sağlık Puanı
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-[#14241B] mt-0.5">
                      🌱 Sağlık Puanı: {analysisResult.healthScore}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-800">
                      {
                        getStatusLabel(
                          getStatusFromScore(analysisResult.healthScore)
                        ).badgeText
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    {
                      label: 'Yaprak Canlılığı ve Görünümü',
                      val: analysisResult.healthScoreBreakdown.leafAppearance,
                    },
                    {
                      label: 'Renk Durumu (Klorofil)',
                      val: analysisResult.healthScoreBreakdown.colorCondition,
                    },
                    {
                      label: 'Genel Canlılık ve Duruş',
                      val: analysisResult.healthScoreBreakdown.vitality,
                    },
                    {
                      label: 'Kuruma Belirtileri Kontrolü',
                      val: analysisResult.healthScoreBreakdown.drynessControl,
                    },
                    {
                      label: 'Büyüme ve Stres Direnci',
                      val: analysisResult.healthScoreBreakdown.stressResistance,
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span>{item.label}</span>
                        <span className="font-mono tabular-nums font-semibold">
                          {item.val}/100
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(0, item.val))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed pt-2 border-t border-slate-200">
                  <strong>Puan Açıklaması:</strong>{' '}
                  {analysisResult.healthScoreExplanation}{' '}
                  <em>
                    (Not: Bu puan bilimsel laboratuvar ölçümü değildir; görsel gözleme dayalı tahmini göstergedir.)
                  </em>
                </p>
              </div>
            </div>
          </div>

          {/* AKILLI ÖNERİ SİSTEMİ (5 Kategorili Gözleme Dayalı Tavsiye Kartları) */}
          {analysisResult.smartRecommendations && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-900/15 space-y-5">
              <div>
                <p className="text-xs font-medium text-emerald-800">
                  Kesin Hüküm İçermeyen, Görsel Gözlemlere Dayalı Rehberlik
                </p>
                <h3 className="text-xl font-bold text-[#14241B] mt-0.5">
                  💡 Akıllı Bitki Bakım Öneri Sistemi (5 Temel Alan)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-sky-950 text-sm">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span>Sulama Önerisi</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.smartRecommendations.watering}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>Konum Değiştirme</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.smartRecommendations.locationChange}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-sm">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>Toprak Bakımı</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.smartRecommendations.soilCare}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-950 text-sm">
                    <Scissors className="w-4 h-4 text-rose-600" />
                    <span>Budama Önerisi</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.smartRecommendations.pruning}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-950 text-sm">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>Besin Desteği</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {analysisResult.smartRecommendations.nutrientSupport}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🧪 Fen Bilimleri Bağlantısı + Interactive Xylem/Photosynthesis Sandbox */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-900/15 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium text-emerald-800">
                Yıldızkent Ortaokulu Fen Bilimleri Müfredatı Entegrasyonu
              </p>
              <h3 className="text-xl font-bold text-[#14241B] mt-0.5">
                🧪 Fen Bilimleri Bağlantısı ve Canlı Süreç Simülasyonu
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-900">
                    01. Fotosentez
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.scienceConnections.photosynthesis}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-900">
                    02. Bitkilerde Büyüme ve Gelişme
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.scienceConnections.growthAndDevelopment}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-900">
                    03. Su ve Mineral Taşınması
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.scienceConnections.waterAndMineralTransport}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-900">
                    04. Ekosistem ve Biyoçeşitlilik
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.scienceConnections.ecosystem}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#F6F8F5] rounded-xl p-5 border border-emerald-900/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14241B] flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-emerald-800" />
                    Deneysel Simülasyon: Fotosentez & İletim Hızı
                  </span>
                  <span className="font-mono tabular-nums text-xs font-semibold text-emerald-900">
                    Verim: %{simulatedPhotosynthesisRate}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        Toprak Nemi (Ksilem Su İletimi)
                      </span>
                      <span className="font-mono tabular-nums">
                        %{simWaterLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={simWaterLevel}
                      onChange={(e) => setSimWaterLevel(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        Güneş Işığı Şiddeti (Klorofil Soğurumu)
                      </span>
                      <span className="font-mono tabular-nums">
                        %{simSunlightLevel}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={simSunlightLevel}
                      onChange={(e) =>
                        setSimSunlightLevel(Number(e.target.value))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {simWaterLevel < 40
                    ? '▲ Düşük Nem Uyarısı: Köklerden ksilem borularıyla taşınan su azaldığında stomalar kapanır ve yaprak uçlarında kuruma başlar.'
                    : simWaterLevel > 88
                    ? '▲ Fazla Su Uyarısı: Toprak gözenekleri suyla dolduğunda kökler yeterli oksijen alamaz ve yapraklarda sararma görülebilir.'
                    : '● İdeal Denge: Köklerden yapraklara su-mineral iletimi (ksilem) ve yapraktan besin taşınımı (floem) dengeli çalışmaktadır.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Camera,
  Upload,
  BookOpen,
  Map,
  BarChart3,
  TrendingUp,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Award,
  Calendar,
  Library,
  BellRing,
  Clock,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { AppTab, GardenPlant } from '../types';
import {
  YILDIZKENT_CAMPUS_ZONES,
  getAnalysisReminderStatus,
  getPlantEncyclopedia,
  getStatusLabel,
} from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';
import { DataBackupBar } from './DataBackupBar';

interface HomeViewProps {
  plants: GardenPlant[];
  showGuide: boolean;
  onToggleGuide: (show: boolean) => void;
  onNavigate: (tab: AppTab) => void;
  onQuickAnalyzeMode: (mode: 'camera' | 'gallery' | null) => void;
  onSelectPlantForTimeline: (plantId: string) => void;
  onReanalyzePlant?: (plantId: string) => void;
  onDeletePlant?: (plantId: string) => void;
  onClearAllPlants?: () => void;
  onOpenEncyclopediaForPlant: (plant: GardenPlant) => void;
  onRestoreBackup: (restoredPlants: GardenPlant[]) => void;
  onResetToDefaults: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  plants,
  showGuide,
  onToggleGuide,
  onNavigate,
  onQuickAnalyzeMode,
  onSelectPlantForTimeline,
  onReanalyzePlant,
  onDeletePlant,
  onClearAllPlants,
  onOpenEncyclopediaForPlant,
  onRestoreBackup,
  onResetToDefaults,
}) => {
  const totalObs = plants.reduce((acc, p) => acc + p.observations.length, 0);
  const totalCareActions = plants.reduce(
    (acc, p) => acc + (p.careActions?.length || 0),
    0
  );
  const avgScore =
    plants.length > 0
      ? Math.round(
          plants.reduce((acc, p) => acc + p.latestHealthScore, 0) /
            plants.length
        )
      : 0;

  const [dismissedNotifications, setDismissedNotifications] =
    useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAllHeader, setConfirmClearAllHeader] =
    useState<boolean>(false);

  const plantsWithReminders = plants.map((plant) => ({
    plant,
    reminder: getAnalysisReminderStatus(plant.lastAnalysisDate),
  }));

  const duePlants = plantsWithReminders.filter((item) => item.reminder.isDue);

  return (
    <div className="space-y-8 pb-12">
      {/* 7-Day "Analiz Zamanı" Notification Banner */}
      {duePlants.length > 0 && !dismissedNotifications && (
        <section
          aria-label="Haftalık Bitki Analiz Zamanı Bildirim Sistemi"
          className="bg-amber-50/95 rounded-2xl p-5 sm:p-6 border-2 border-amber-500/80 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                    🔔 HAFTALIK TAKİP BİLDİRİMİ · ANALİZ ZAMANI
                  </span>
                  <span className="text-xs font-semibold text-amber-900">
                    Son analiz tarihinden itibaren 7 gün geçen {duePlants.length} bitki var
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[#14241B] mt-1">
                  Yıldızkent Ortaokulu Bahçesindeki Bitkilerinizin Haftalık Fotoğraf ve Bakım Kontrol Zamanı Geldi!
                </h2>
                <p className="text-xs text-slate-700 mt-0.5">
                  Geçen hafta uyguladığınız sulama ve bakım işlemlerinin işe yarayıp yaramadığını görmek için yeni fotoğraf yükleyin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDismissedNotifications(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-400 bg-white/80 text-amber-950 text-xs font-semibold hover:bg-white transition-colors"
            >
              Bildirimi Gizle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {duePlants.map(({ plant, reminder }) => (
              <div
                key={plant.id}
                className="p-3 rounded-xl bg-white border border-amber-300 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <ResilientImage
                      src={plant.latestImageUrl}
                      alt={plant.plantName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                      {reminder.daysSinceLastAnalysis} Gün Geçti
                    </span>
                    <h3 className="text-xs font-bold text-[#14241B] truncate mt-0.5">
                      #{plant.plantNumber} {plant.plantName}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">
                      Son Analiz: {reminder.lastDateFormatted}
                    </p>
                  </div>
                </div>

                {onReanalyzePlant && (
                  <button
                    type="button"
                    onClick={() => onReanalyzePlant(plant.id)}
                    className="w-full min-h-[36px] px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                    <span>Şimdi Analiz Et</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* First-Time Usage Guide (Non-blocking inline collapsible guide) */}
      {showGuide && (
        <section
          aria-label="Yıldızkent Ortaokulu Kısa Kullanım Rehberi"
          className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-700/25 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-900">
              <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-bold">
                Yıldızkent Ortaokulu · 4 Adımda Bilimsel Bitki Gözlem ve Bakım Rehberi
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onToggleGuide(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Rehberi Anladım, Gizle
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F6F8F5] space-y-1">
              <p className="font-mono font-bold text-emerald-800">01. HAFTALIK FOTOĞRAF</p>
              <p className="font-semibold text-[#14241B]">
                Bahçedeki Bitkiyi Görüntüle
              </p>
              <p className="text-slate-600 leading-relaxed">
                Yıldızkent Ortaokulu bahçesindeki bitkilerin yaprak ve gövdesini her hafta fotoğraflayın.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F6F8F5] space-y-1">
              <p className="font-mono font-bold text-emerald-800">02. YAPAY ZEKÂ DANIŞMANI</p>
              <p className="font-semibold text-[#14241B]">
                Sağlık Puanı ve Akıllı Öneri Al
              </p>
              <p className="text-slate-600 leading-relaxed">
                Yapay zekâ sararma, kuruma ve sulama ihtiyacını inceler; 0-100 arası sağlık puanı ve bakım tavsiyesi üretir.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F6F8F5] space-y-1">
              <p className="font-mono font-bold text-emerald-800">03. BAKIM TAKVİMİ & ANSİKLOPEDİ</p>
              <p className="font-semibold text-[#14241B]">
                Botanik Rehber ve Bakım Eylemleri
              </p>
              <p className="text-slate-600 leading-relaxed">
                Bitki Bilgi Ansiklopedisinden botanik özellikleri öğrenin; sulama, budama ve yer değiştirme eylemlerini takvime kaydedin.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F6F8F5] space-y-1">
              <p className="font-mono font-bold text-emerald-800">04. JSON VERİ KORUMASI</p>
              <p className="font-semibold text-[#14241B]">
                Gelişimi Karşılaştır & Yedekle
              </p>
              <p className="text-slate-600 leading-relaxed">
                Haftalık gelişim eğrisini inceleyin ve tüm proje verilerinizi JSON yedek dosyası olarak indirip koruyun.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Primary Hero Section: 🌱 Bitkimi Analiz Et + Mobile-First Big Touch Buttons */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dominant Focal Anchor Card */}
        <div className="lg:col-span-7 bg-[#0F5338] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200 font-semibold">
              <span>🏫 YILDIZKENT ORTAOKULU</span>
              <span aria-hidden="true">·</span>
              <span>TÜBİTAK 4006-B Bilim Fuarı Araştırma Sistemi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-white">
              Yıldızkent Ortaokulu Yapay Zekâ Destekli Bahçe Bitki Sağlığı ve Bakım Danışmanı
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              Yıldızkent Ortaokulu bahçemizdeki zeytin, gül, lavanta, çınar ve ıhlamur bitkilerini haftalık olarak fotoğraflayın; Bitki Bilgi Ansiklopedisi ve yapay zekâ bakım önerileriyle gelişimlerini bilimsel olarak takip edin.
            </p>
          </div>

          {/* Primary Large CTA: 🌱 Bitkimi Analiz Et */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => onQuickAnalyzeMode(null)}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-white text-[#0F5338] hover:bg-emerald-50 active:scale-[0.99] transition-all font-bold text-lg sm:text-xl flex items-center justify-between shadow-lg"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  🌱
                </span>
                <span>Bitkimi Analiz Et</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-950 px-3.5 py-2 rounded-xl">
                <span>Haftalık Analiz</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Immediate Sub-options: Camera & Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onQuickAnalyzeMode('camera')}
                className="min-h-[54px] px-4 py-3 rounded-xl bg-emerald-800/90 hover:bg-emerald-800 border border-emerald-400/25 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors"
              >
                <Camera className="w-5 h-5 text-emerald-300 shrink-0" />
                <span>Kamera ile Fotoğraf Çek</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickAnalyzeMode('gallery')}
                className="min-h-[54px] px-4 py-3 rounded-xl bg-emerald-800/90 hover:bg-emerald-800 border border-emerald-400/25 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors"
              >
                <Upload className="w-5 h-5 text-emerald-300 shrink-0" />
                <span>Galeriden Yükle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Navigation Action Deck */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('encyclopedia')}
            className="text-left bg-white hover:bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-700/30 transition-all flex items-center justify-between min-h-[76px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#14241B]">
                  📚 Bitki Bilgi Ansiklopedisi
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Botanik özellikler, morfoloji ve Yıldızkent bahçesi özel bakım rehberi
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('calendar')}
            className="text-left bg-white hover:bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-900/10 transition-all flex items-center justify-between min-h-[76px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#14241B]">
                  İnteraktif Bakım Takvimi
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sulama, budama ve yer değiştirme ({totalCareActions} eylem) & haftalık gelişim
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="text-left bg-white hover:bg-emerald-50/60 p-4 sm:p-5 rounded-2xl border border-emerald-900/10 transition-all flex items-center justify-between min-h-[76px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#14241B]">
                  Yıldızkent Okul Bahçesi Haritası
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {YILDIZKENT_CAMPUS_ZONES.length} yerleşim alanı ve {plants.length} kayıtlı bitki noktası
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
          </button>

          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('journal')}
              className="text-left bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-emerald-900/10 transition-all flex flex-col justify-between min-h-[78px]"
            >
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <div className="mt-1.5">
                <h2 className="text-[11px] font-bold text-[#14241B] leading-tight">
                  Gözlem Günlüğü
                </h2>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('timeline')}
              className="text-left bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-emerald-900/10 transition-all flex flex-col justify-between min-h-[78px]"
            >
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <div className="mt-1.5">
                <h2 className="text-[11px] font-bold text-[#14241B] leading-tight">
                  Gelişim Grafiği
                </h2>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="text-left bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-emerald-900/10 transition-all flex flex-col justify-between min-h-[78px]"
            >
              <div className="flex items-center justify-between">
                <BarChart3 className="w-4 h-4 text-emerald-800" />
                <span className="font-mono tabular-nums text-[10px] font-bold text-emerald-800">
                  {avgScore}p
                </span>
              </div>
              <div className="mt-1.5">
                <h2 className="text-[11px] font-bold text-[#14241B] leading-tight">
                  İstatistik
                </h2>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('fair')}
              className="text-left bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-emerald-900/10 transition-all flex flex-col justify-between min-h-[78px]"
            >
              <div className="flex items-center justify-between">
                <Award className="w-4 h-4 text-amber-700" />
                <span className="text-[9px] font-mono font-semibold text-amber-900">
                  4006-B
                </span>
              </div>
              <div className="mt-1.5">
                <h2 className="text-[11px] font-bold text-[#14241B] leading-tight">
                  Bilim Fuarı
                </h2>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Yıldızkent Ortaokulu Tracked Plants Overview with Integrated Plant Encyclopedia */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#14241B]">
              🏫 Yıldızkent Ortaokulu Bahçesinde İzlenen Bitkiler ve Bilgi Ansiklopedisi
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Her bitki kartındaki <strong>📚 Bitki Ansiklopedisi</strong> butonuna dokunarak botanik özelliklerini ve Yıldızkent bahçesine özgü bakım ipuçlarını inceleyebilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onClearAllPlants && plants.length > 0 && (
              !confirmClearAllHeader ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAllHeader(true)}
                  className="text-xs font-semibold text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Örnek Bitkileri Temizle
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-300 px-2.5 py-1 rounded-lg text-xs">
                  <span className="font-semibold text-red-900">
                    Tüm bitkiler silinsin mi?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllPlants();
                      setConfirmClearAllHeader(false);
                    }}
                    className="px-2 py-0.5 rounded bg-red-700 text-white font-bold"
                  >
                    Evet, Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAllHeader(false)}
                    className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300"
                  >
                    İptal
                  </button>
                </div>
              )
            )}
            <button
              type="button"
              onClick={() => onNavigate('encyclopedia')}
              className="text-xs font-semibold text-[#0F5338] hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-4 h-4" />
              Tüm Ansiklopediyi Aç
            </button>
            {!showGuide && (
              <button
                type="button"
                onClick={() => onToggleGuide(true)}
                className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                Rehberi Göster
              </button>
            )}
          </div>
        </div>

        {plants.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-emerald-900/20 space-y-4">
            <p className="text-base font-bold text-[#14241B]">
              🌱 Bahçe Listeniz Şu Anda Boş (Örnek Bitkiler Silindi)
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Artık sadece Yıldızkent Ortaokulu bahçesinde kendi çektiğiniz gerçek bitki fotoğraflarını analiz edip sıfırdan kaydedebilirsiniz.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onQuickAnalyzeMode(null)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F5338] text-white text-xs font-bold hover:bg-[#0B3F2A] transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                İlk Bitki Fotoğrafını Çek ve Kaydet
              </button>
              <button
                type="button"
                onClick={onResetToDefaults}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Örnek Bitkileri Geri Yükle
              </button>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {plantsWithReminders.map(({ plant, reminder }) => {
            const statusInfo = getStatusLabel(plant.status);
            const firstScore =
              plant.observations[0]?.healthScore ?? plant.latestHealthScore;
            const netChange = plant.latestHealthScore - firstScore;
            const enc = getPlantEncyclopedia(plant);

            return (
              <div
                key={plant.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  reminder.isDue
                    ? 'border-amber-500/80 ring-2 ring-amber-400/20'
                    : 'border-emerald-900/10 hover:border-emerald-700/50'
                }`}
              >
                <div
                  onClick={() => onSelectPlantForTimeline(plant.id)}
                  className="cursor-pointer space-y-2.5"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 relative">
                    <ResilientImage
                      src={plant.latestImageUrl}
                      alt={plant.plantName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#14241B]/85 text-white font-mono text-[11px] font-bold">
                      #{plant.plantNumber}
                    </span>

                    {/* 7-Day "Analiz Zamanı" Badge on Plant Card Image */}
                    {reminder.isDue ? (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <BellRing className="w-3 h-3" />
                        <span>Analiz Zamanı ({reminder.daysSinceLastAnalysis}g)</span>
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-800/90 text-white font-mono text-[10px] font-semibold">
                        ✓ Güncel ({reminder.daysSinceLastAnalysis}g önce)
                      </span>
                    )}

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-[#0F5338] font-mono text-[10px] font-semibold">
                      {enc.family.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#14241B] leading-snug">
                      {plant.plantName}
                    </h3>
                    <p className="text-[11px] italic text-emerald-800">
                      {plant.scientificName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {plant.location}
                    </p>
                  </div>
                </div>

                {/* 7-Day Analysis Reminder Status Box inside Card */}
                <div
                  className={`p-2.5 rounded-xl text-[11px] space-y-1 border ${
                    reminder.isDue
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-[#F6F8F5] border-emerald-900/5 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      {reminder.isDue ? 'Analiz Zamanı Geldi!' : 'Haftalık Takip Güncel'}
                    </span>
                    <span className="font-mono text-[10px]">
                      {reminder.lastDateFormatted}
                    </span>
                  </div>
                  <p className="text-[10px] leading-snug">
                    {reminder.isDue
                      ? `Son analizden ${reminder.daysSinceLastAnalysis} gün geçti (7+ gün). Yeni fotoğraf yükleyin.`
                      : `Son analiz ${reminder.daysSinceLastAnalysis} gün önce yapıldı. (${reminder.daysUntilNextAnalysis} gün kaldı)`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {statusInfo.badgeText}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#14241B]">
                      🌱 {plant.latestHealthScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{plant.observations.length} Haftalık Kayıt</span>
                    <span className="font-mono font-semibold text-emerald-800">
                      {netChange >= 0 ? `+${netChange}` : netChange} Puan
                    </span>
                  </div>

                  {/* Integrated Encyclopedia + 1-Week Follow-up Photo Check + Delete Buttons */}
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {onReanalyzePlant && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReanalyzePlant(plant.id);
                        }}
                        className={`w-full min-h-[38px] px-2.5 py-1.5 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors ${
                          reminder.isDue
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-[#0F5338] hover:bg-[#0B3F2A] text-white'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {reminder.isDue
                            ? '🔔 Analiz Zamanı: Fotoğraf Yükle'
                            : '1 Hafta Sonraki Fotoğrafı Yükle'}
                        </span>
                      </button>
                    )}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEncyclopediaForPlant(plant);
                        }}
                        className="flex-1 min-h-[36px] px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-700/25 text-emerald-950 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span className="truncate">Ansiklopedi</span>
                      </button>

                      {onDeletePlant && (
                        confirmDeleteId === plant.id ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePlant(plant.id);
                              setConfirmDeleteId(null);
                            }}
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition-colors shrink-0"
                          >
                            Silmeyi Onayla
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(plant.id);
                            }}
                            title="Bu bitkiyi sil"
                            className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50/70 text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* JSON Backup & Mobile Phone Connection Bar */}
      <DataBackupBar
        plants={plants}
        onRestoreBackup={onRestoreBackup}
        onResetToDefaults={onResetToDefaults}
        onClearAllPlants={onClearAllPlants}
      />
    </div>
  );
};


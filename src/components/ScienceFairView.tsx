import React from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Target,
  BarChart3,
} from 'lucide-react';
import { GardenPlant } from '../types';

interface ScienceFairViewProps {
  plants: GardenPlant[];
  onStartLiveDemo: () => void;
}

export const ScienceFairView: React.FC<ScienceFairViewProps> = ({
  plants,
  onStartLiveDemo,
}) => {
  const allObservations = plants.flatMap((p) => p.observations);
  const avgScore =
    plants.length > 0
      ? Math.round(
          plants.reduce((acc, p) => acc + p.latestHealthScore, 0) /
            plants.length
        )
      : 0;

  const healthyCount = plants.filter((p) => p.status === 'healthy').length;
  const monitorCount = plants.filter((p) => p.status === 'monitor').length;
  const inspectCount = plants.filter((p) => p.status === 'inspect').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Exhibition Banner */}
      <div className="bg-[#14241B] text-white rounded-3xl p-6 sm:p-10 space-y-6 border border-emerald-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-mono tracking-wider text-emerald-300">
            🏫 YILDIZKENT ORTAOKULU · TÜBİTAK 4006-B BİLİM FUARI PROJE SERGİ EKRANI
          </div>
          <button
            type="button"
            onClick={onStartLiveDemo}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[46px] rounded-xl bg-emerald-500 text-[#14241B] font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            Jüri & Ziyaretçi Canlı Analiz Deneyi Başlat
          </button>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
            Yıldızkent Ortaokulu Yapay Zekâ Destekli Okul Bahçesi Bitki Sağlığı İzleme ve Bakım Danışmanı Sistemi
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Yıldızkent Ortaokulu öğrencilerinin okul bahçemizdeki bitkileri haftalık fotoğraflarla gözlemlemesini, yapay zekâ destekli bakım önerileriyle sulama, budama ve yer değiştirme uygulamalarını takip etmesini sağlayan bilimsel araştırma sistemi.
          </p>
        </div>

        {/* Live Collected Data Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/15">
          <div>
            <p className="text-xs text-emerald-200/80">Yıldızkent Bahçe Bitkisi</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1">
              {plants.length} Tür
            </p>
          </div>
          <div>
            <p className="text-xs text-emerald-200/80">Haftalık Gözlem Verisi</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums mt-1">
              {allObservations.length} Kayıt
            </p>
          </div>
          <div>
            <p className="text-xs text-emerald-200/80">Ortalama Sağlık Puanı</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-300 mt-1">
              {avgScore}/100
            </p>
          </div>
          <div>
            <p className="text-xs text-emerald-200/80">Durum Dağılımı</p>
            <p className="text-sm font-mono tabular-nums font-semibold mt-2">
              🟢 {healthyCount} · 🟡 {monitorCount} · 🔴 {inspectCount}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Required Scientific Fair Poster Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Projenin Amacı */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Target className="w-4 h-4" />
            <span>01. PROJENİN AMACI</span>
          </div>
          <h2 className="text-lg font-bold text-[#14241B]">
            Yıldızkent Ortaokulu Bahçesini Yaşayan Bir Fen Laboratuvarına Dönüştürmek
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Yıldızkent Ortaokulu öğrencilerinin okul bahçesindeki bitkileri (Zeytin, Gül, Lavanta, Doğu Çınarı, Ihlamur) düzenli olarak gözlemlemesini, yapay zekâ teknolojisini bilimsel bir bakım danışmanı olarak kullanmasını ve haftalık sağlık değişimlerini veriye dayalı takip etmesini sağlamaktır.
          </p>
        </div>

        {/* 2. Problem Durumu */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <FlaskConical className="w-4 h-4" />
            <span>02. PROBLEM DURUMU</span>
          </div>
          <h2 className="text-lg font-bold text-[#14241B]">
            Bitki Stres Belirtilerinin Geç Fark Edilmesi ve Bakım Takibi Eksikliği
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Okul bahçelerindeki bitkilerde görülen yaprak sararması, kuruma, gölgede kalma veya yanlış sulama gibi çevresel stres belirtileri çoğu zaman geç fark edilmektedir. Öğrencilerin uyguladıkları sulama ve budama işlemlerinin bitki sağlığına etkisini hafta hafta ölçebilecekleri bir sistem bulunmamaktadır.
          </p>
        </div>

        {/* 3. Çözüm Yöntemi */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>03. ÇÖZÜM YÖNTEMİ</span>
          </div>
          <h2 className="text-lg font-bold text-[#14241B]">
            Yıldızkent 5 Basamaklı Dijital Bilimsel Gözlem Döngüsü
          </h2>
          <ol className="space-y-1.5 text-xs sm:text-sm text-slate-700 list-decimal list-inside">
            <li>Yıldızkent Ortaokulu bahçe krokisinde 5 bölgedeki bitkilerin numaralandırılması (#B-01..#B-05).</li>
            <li>Mobil cihaz ile haftalık yaprak ve gövde fotoğraflarının çekilmesi.</li>
            <li>Yapay zekâ ile görsel bulguların, akıllı bakım önerilerinin ve 0-100 sağlık puanının üretilmesi.</li>
            <li>Sulama, budama ve yer değiştirme işlemlerinin İnteraktif Bakım Takvimine kaydedilmesi.</li>
            <li>Haftalık gelişim grafikleriyle bakım öncesi ve sonrası puanların karşılaştırılması.</li>
          </ol>
        </div>

        {/* 4. Yapay Zekânın Rolü */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>04. YAPAY ZEKÂNIN ROLÜ</span>
          </div>
          <h2 className="text-lg font-bold text-[#14241B]">
            Teşhis Değil, Bilimsel Gözlem ve Akıllı Bakım Danışmanlığı
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Sistemde kullanılan çok modlu yapay zekâ modeli kesin laboratuvar teşhisi koymaz; <em>“Fotoğraftaki belirtiler şu durumlarla benzerlik göstermektedir”</em> yaklaşımıyla yapraktaki sararma, leke veya kuruma örüntülerini inceler; sulama, konum değiştirme, toprak bakımı, budama ve besin desteği önerileri sunar.
          </p>
        </div>
      </div>

      {/* 5. Öğrencilerin Topladığı Veriler & 6. Elde Edilen Sonuçlar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <BarChart3 className="w-4 h-4" />
            <span>05. YILDIZKENT ORTAOKULU ÖĞRENCİLERİNİN TOPLADIĞI SAHA VERİLERİ</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-3">Bitki</th>
                  <th className="py-2.5 px-3">Yıldızkent Bahçe Konumu</th>
                  <th className="py-2.5 px-3">Hafta 1</th>
                  <th className="py-2.5 px-3">Son Puan</th>
                  <th className="py-2.5 pl-3">Gelişim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plants.map((plant) => {
                  const first =
                    plant.observations[0]?.healthScore ?? plant.latestHealthScore;
                  const last = plant.latestHealthScore;
                  const diff = last - first;
                  return (
                    <tr key={plant.id}>
                      <td className="py-3 pr-3 font-semibold text-[#14241B]">
                        <span className="font-mono text-emerald-800">
                          #{plant.plantNumber}
                        </span>{' '}
                        {plant.plantName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {plant.location}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums">
                        {first}/100
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums font-bold">
                        {last}/100
                      </td>
                      <td className="py-3 pl-3 font-mono tabular-nums font-bold">
                        <span
                          className={
                            diff > 0
                              ? 'text-emerald-700'
                              : diff < 0
                              ? 'text-red-700'
                              : 'text-slate-600'
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff} Puan
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>06. ELDE EDİLEN BİLİMSEL SONUÇLAR</span>
          </div>
          <h3 className="text-base font-bold text-[#14241B]">
            Yıldızkent Ortaokulu Saha Bulguları
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
            <li>
              <strong>1. Ana Giriş Zeytin Fidanı (#B-01):</strong> Düzenli kök sulaması ve toprak çapalama ile sağlık puanı 3 haftada 60’tan 84’e (+24 puan) yükselmiştir.
            </li>
            <li>
              <strong>2. A Blok Fen Lab. Önü Gül (#B-02):</strong> Lekeli yaprakların budanması ve güneşli güney kenara yer değiştirme ile puan 56’dan 78’e çıkmıştır.
            </li>
            <li>
              <strong>3. B Blok Ekoloji Köşesi Lavanta (#B-03) & Kütüphane Ihlamuru (#B-05):</strong> Doğru konum ve kompost desteğiyle 94 ve 86 sağlık puanına ulaşılmıştır.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Download,
  Camera,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { GardenPlant } from '../types';
import { getStatusFromScore, getStatusLabel } from '../data/initialGardenData';
import { DataBackupBar } from './DataBackupBar';

interface TeacherPanelViewProps {
  plants: GardenPlant[];
  onReanalyzePlant: (plantId: string) => void;
  onOpenTimelineForPlant: (plantId: string) => void;
  onOpenEncyclopediaForPlant?: (plant: GardenPlant) => void;
  onRestoreBackup: (restoredPlants: GardenPlant[]) => void;
  onResetToDefaults: () => void;
}

export const TeacherPanelView: React.FC<TeacherPanelViewProps> = ({
  plants,
  onReanalyzePlant,
  onOpenTimelineForPlant,
  onOpenEncyclopediaForPlant,
  onRestoreBackup,
  onResetToDefaults,
}) => {
  const allObservations = plants
    .flatMap((p) => p.observations)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPlantsCount = plants.length;
  const totalObservationsCount = allObservations.length;
  const avgHealthScore =
    totalPlantsCount > 0
      ? Math.round(
          plants.reduce((acc, p) => acc + p.latestHealthScore, 0) /
            totalPlantsCount
        )
      : 0;

  // Calculate most common problems across observations
  const factorCounts: Record<string, number> = {};
  allObservations.forEach((obs) => {
    obs.analysis.possibleCauses.forEach((cause) => {
      const key = cause.factor;
      factorCounts[key] = (factorCounts[key] || 0) + 1;
    });
  });

  const sortedProblems = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const plantsNeedingAttention = plants.filter(
    (p) => p.latestHealthScore < 80
  );

  const exportScientificDataCsv = () => {
    const headers = [
      'Okul Adi',
      'Bitki No',
      'Bitki Adi',
      'Bilimsel Adi',
      'Tarih',
      'Bahce Konumu',
      'Saglik Puani',
      'Ogrenci Grubu',
      'Yapilan Bakim Islemi',
      'Ogrenci Notu',
    ];
    const rows = allObservations.map((o) => [
      '"Yildizkent Ortaokulu"',
      o.plantNumber,
      `"${o.plantName}"`,
      `"${o.scientificName}"`,
      o.date,
      `"${o.location}"`,
      o.healthScore,
      `"${o.observerGroup}"`,
      `"${(o.performedCareAction || '').replace(/"/g, '""')}"`,
      `"${o.studentNote.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      'yildizkent_ortaokulu_bitki_gozlem_verileri.csv'
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu Fen Bilimleri Zümresi · Danışman Öğretmen Veri Değerlendirme Ekranı
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            👩‍🏫 Yıldızkent Ortaokulu Öğretmen Kontrol Paneli
          </h1>
        </div>

        <button
          type="button"
          onClick={exportScientificDataCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[#14241B] text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap self-start"
        >
          <Download className="w-4 h-4" />
          Yıldızkent Gözlem Verilerini İndir (CSV)
        </button>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10">
          <p className="text-xs font-medium text-slate-600">
            Yıldızkent Bahçesi Kayıtlı Bitki
          </p>
          <p className="text-3xl font-bold font-mono tabular-nums text-[#14241B] mt-2">
            {totalPlantsCount} Bitki
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Toplam {totalObservationsCount} haftalık gözlem kaydı
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10">
          <p className="text-xs font-medium text-slate-600">
            Yıldızkent Bahçe Ortalama Puanı
          </p>
          <p className="text-3xl font-bold font-mono tabular-nums text-emerald-800 mt-2">
            {avgHealthScore}/100
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {getStatusLabel(getStatusFromScore(avgHealthScore)).badgeText} genel ortalama
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10">
          <p className="text-xs font-medium text-slate-600">
            Takip Edilmesi Gereken Bitkiler
          </p>
          <p className="text-3xl font-bold font-mono tabular-nums text-amber-700 mt-2">
            {plantsNeedingAttention.length} Bitki
          </p>
          <p className="text-xs text-slate-500 mt-1">
            80 puan altındaki öncelikli bitkiler
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10">
          <p className="text-xs font-medium text-slate-600">
            En Sık İncelenen Etken
          </p>
          <p className="text-lg font-bold text-[#14241B] mt-2 truncate">
            {sortedProblems[0]?.[0] || 'Su Eksikliği'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Saha gözlemlerinin odaklandığı faktör
          </p>
        </div>
      </div>

      {/* Two-Column: Most Common Problems + Plants Needing Follow-up */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* En Sık Görülen Problemler */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#14241B]">
              📊 Gözlemlenen Çevresel Etkenler ve Bakım Sonuçları
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Yıldızkent Ortaokulu öğrenci gözlemlerinde değerlendirilen faktörlerin dağılımı
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {sortedProblems.map(([factor, count]) => {
              const pct = Math.round((count / totalObservationsCount) * 100);
              return (
                <div key={factor} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-800">
                    <span>{factor}</span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {count} kayıt (%{pct})
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full"
                      style={{ width: `${Math.max(12, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Takip Edilmesi Gereken Bitkiler */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#14241B]">
                ⚠️ Yakın Takip Listesindeki Yıldızkent Bahçe Bitkileri
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Öğrencilerin haftalık bakım takviminde öncelik verdiği bitkiler
              </p>
            </div>
          </div>

          {plantsNeedingAttention.length === 0 ? (
            <p className="text-sm text-emerald-800 py-6">
              Tüm Yıldızkent Ortaokulu bahçe bitkileri 80 ve üzeri sağlıklı puan seviyesindedir.
            </p>
          ) : (
            <div className="space-y-3">
              {plantsNeedingAttention.map((plant) => {
                const latestObs =
                  plant.observations[plant.observations.length - 1];
                return (
                  <div
                    key={plant.id}
                    className="p-4 rounded-xl bg-[#F6F8F5] border border-amber-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#14241B]">
                          #{plant.plantNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold">
                          {getStatusLabel(plant.status).badgeText}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums font-bold">
                          Puan: {plant.latestHealthScore}/100
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#14241B]">
                        {plant.plantName} — {plant.location}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {latestObs?.analysis.advisorReport ||
                          latestObs?.analysis.similarityStatement}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenTimelineForPlant(plant.id)}
                        className="px-3 py-2 min-h-[40px] rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-1 whitespace-nowrap"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        Grafik
                      </button>
                      <button
                        type="button"
                        onClick={() => onReanalyzePlant(plant.id)}
                        className="px-3 py-2 min-h-[40px] rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Analiz Et
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* JSON Backup & Mobile Phone Connection Bar */}
      <DataBackupBar
        plants={plants}
        onRestoreBackup={onRestoreBackup}
        onResetToDefaults={onResetToDefaults}
      />

      {/* Öğrenci Gözlem Kayıtları Tablosu */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#14241B]">
            📋 Yıldızkent Ortaokulu Öğrenci Gözlem ve Bakım Kayıt Çizelgesi
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Kişisel öğrenci verisi içermez; yalnızca Yıldızkent Ortaokulu araştırma grupları ve bilimsel saha gözlem bulguları kaydedilir.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 pr-4">Tarih</th>
                <th className="py-3 px-4">Bitki No & Adı</th>
                <th className="py-3 px-4">Yıldızkent Bahçe Konumu</th>
                <th className="py-3 px-4">Araştırma Grubu</th>
                <th className="py-3 px-4">Sağlık Puanı</th>
                <th className="py-3 pl-4">Öğrenci Saha Notu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {allObservations.map((obs) => (
                <tr key={obs.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 pr-4 font-mono tabular-nums whitespace-nowrap">
                    {obs.date}
                  </td>
                  <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                    <span className="font-mono text-emerald-800">
                      #{obs.plantNumber}
                    </span>{' '}
                    · {obs.plantName}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {obs.location}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {obs.observerGroup}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums font-bold whitespace-nowrap">
                    {obs.healthScore}/100 (
                    {getStatusLabel(getStatusFromScore(obs.healthScore)).dot})
                  </td>
                  <td className="py-3.5 pl-4 max-w-md text-slate-600">
                    {obs.studentNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

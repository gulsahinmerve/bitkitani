import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Camera,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { GardenPlant } from '../types';
import { formatTurkishShortDate } from '../data/initialGardenData';
import { ResilientImage } from './ResilientImage';

interface TimeTrackingViewProps {
  plants: GardenPlant[];
  initialSelectedPlantId?: string | null;
  onReanalyzePlant: (plantId: string) => void;
  onOpenCalendar?: () => void;
}

export const TimeTrackingView: React.FC<TimeTrackingViewProps> = ({
  plants,
  initialSelectedPlantId,
  onReanalyzePlant,
  onOpenCalendar,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    initialSelectedPlantId || plants[0]?.id || ''
  );

  const activePlant =
    plants.find((p) => p.id === selectedPlantId) || plants[0];

  if (!activePlant) {
    return null;
  }

  const sortedObs = [...activePlant.observations].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const firstObs = sortedObs[0];
  const latestObs = sortedObs[sortedObs.length - 1];
  const previousObs =
    sortedObs.length > 1 ? sortedObs[sortedObs.length - 2] : sortedObs[0];

  const scoreDelta = latestObs.healthScore - previousObs.healthScore;
  const totalDelta = latestObs.healthScore - firstObs.healthScore;

  const isImproving =
    scoreDelta > 0 || (sortedObs.length === 1 && latestObs.healthScore >= 80);

  // SVG Line Chart coordinates calculation
  const chartWidth = 640;
  const chartHeight = 220;
  const padLeft = 44;
  const padRight = 32;
  const padTop = 24;
  const padBottom = 36;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const points = sortedObs.map((obs, index) => {
    const x =
      sortedObs.length === 1
        ? padLeft + plotW / 2
        : padLeft + (index / (sortedObs.length - 1)) * plotW;
    const y = padTop + plotH - (obs.healthScore / 100) * plotH;
    return { x, y, obs };
  });

  const polylinePoints = points.map((pt) => `${pt.x},${pt.y}`).join(' ');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-800">
            Yıldızkent Ortaokulu · Haftalık Gelişim Eğrisi ve Önceki-Yeni Hafta Karşılaştırması
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14241B] mt-1">
            📈 Haftalık Gelişim Grafiği ve Zaman Takibi
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenCalendar && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl border border-emerald-800/25 bg-white text-[#14241B] text-xs font-semibold hover:bg-emerald-50 transition-colors whitespace-nowrap"
            >
              <Calendar className="w-4 h-4 text-emerald-700" />
              Bakım Takvimiyle Yan Yana Gör
            </button>
          )}
          <button
            type="button"
            onClick={() => onReanalyzePlant(activePlant.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            <Camera className="w-4 h-4" />
            #{activePlant.plantNumber} İçin Yeni Haftalık Fotoğraf Yükle
          </button>
        </div>
      </div>

      {/* Plant Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {plants.map((plant) => {
          const isSelected = plant.id === activePlant.id;
          return (
            <button
              key={plant.id}
              type="button"
              onClick={() => setSelectedPlantId(plant.id)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#14241B] text-white border-[#14241B]'
                  : 'bg-white text-slate-700 border-emerald-900/15 hover:bg-emerald-50/50'
              }`}
            >
              <span className="font-mono">#{plant.plantNumber}</span>
              <span>{plant.plantName}</span>
              <span className="font-mono tabular-nums opacity-80">
                ({plant.observations.length} Hafta)
              </span>
            </button>
          );
        })}
      </div>

      {/* Scientific Verdict & Line Graph Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#14241B]">
                #{activePlant.plantNumber} {activePlant.plantName} — Haftalık Sağlık Puanı Eğrisi
              </h2>
              <p className="text-xs text-slate-500">
                Yıldızkent Bahçe Konumu: {activePlant.location} ·{' '}
                {sortedObs
                  .map(
                    (o, i) =>
                      `Hafta ${o.weekNumber || i + 1}: ${o.healthScore} puan`
                  )
                  .join(' → ')}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums text-sm font-bold">
              {scoreDelta > 0 ? (
                <span className="text-emerald-800 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />+{scoreDelta} Puan (Son Hafta)
                </span>
              ) : scoreDelta < 0 ? (
                <span className="text-red-700 flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  {scoreDelta} Puan (Son Hafta)
                </span>
              ) : (
                <span className="text-slate-600 flex items-center gap-1">
                  <Minus className="w-4 h-4" /> Değişim Yok
                </span>
              )}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[460px]"
              role="img"
              aria-label="Bitki sağlık puanı haftalık gelişim grafiği"
            >
              {/* Horizontal reference lines */}
              {[100, 80, 60, 40, 20].map((val) => {
                const y = padTop + plotH - (val / 100) * plotH;
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={val === 80 || val === 60 ? '4 4' : undefined}
                      strokeWidth={1}
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[11px] font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Line connecting observations */}
              {points.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#047857"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              )}

              {/* Data nodes */}
              {points.map((pt, idx) => (
                <g key={pt.obs.id}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={6}
                    className="fill-white stroke-emerald-700"
                    strokeWidth={3}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    className="fill-[#14241B] text-xs font-bold font-mono"
                  >
                    {pt.obs.healthScore} Puan
                  </text>
                  <text
                    x={pt.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-600 text-[11px] font-mono"
                  >
                    Hafta {pt.obs.weekNumber || idx + 1} ({formatTurkishShortDate(pt.obs.date)})
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Student-Level Scientific Interpretation Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-emerald-900/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Haftalık Gelişim Değerlendirmesi
            </span>

            <div
              className={`p-4 rounded-xl border ${
                isImproving
                  ? 'bg-emerald-50/80 border-emerald-700/25 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-700/25 text-amber-950'
              } space-y-2`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {isImproving ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                )}
                <span>
                  {isImproving
                    ? 'Bitkinin durumunda iyileşme gözlenmektedir.'
                    : 'Bitki takip edilmeye devam edilmelidir.'}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {latestObs.analysis.timeComparisonVerdict}
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-700">
              {sortedObs.map((obs, idx) => (
                <div
                  key={obs.id}
                  className="flex justify-between py-1.5 border-b border-slate-100"
                >
                  <span>
                    Hafta {obs.weekNumber || idx + 1} ({formatTurkishShortDate(obs.date)}):
                  </span>
                  <span className="font-mono tabular-nums font-bold">
                    {obs.healthScore} Puan
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1.5">
                <span>Toplam Net Gelişim:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-800">
                  {totalDelta >= 0 ? `+${totalDelta}` : totalDelta} Puan
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            Yıldızkent Ortaokulu Araştırma İpucu: Aynı bitkiyi her hafta aynı açıdan fotoğraflayarak sulama ve budama işlemlerinin etkisini ölçebilirsiniz.
          </p>
        </div>
      </div>

      {/* Previous vs Latest Analysis Comparison */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-[#14241B]">
            🔍 Haftalık Karşılaştırma: Önceki Durum ve Yeni Durum
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {previousObs.date} tarihli gözlem ile {latestObs.date} tarihli son gözlem arasındaki yaprak ve sağlık puanı farkı
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previous Record */}
          <div className="p-4 rounded-xl bg-[#F6F8F5] border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Önceki Durum ({previousObs.date})
              </span>
              <span className="font-mono tabular-nums text-xs font-bold text-slate-900">
                🌱 Sağlık Puanı: {previousObs.healthScore}/100
              </span>
            </div>
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
              <ResilientImage
                src={previousObs.imageUrl}
                alt="Önceki gözlem fotoğrafı"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                <strong>Görsel Durum:</strong>{' '}
                {previousObs.analysis.leafStemColorAnalysis.leafCondition}
              </p>
              <p>
                <strong>Renk Durumu:</strong>{' '}
                {previousObs.analysis.leafStemColorAnalysis.colorChanges}
              </p>
              <p>
                <strong>Öğrenci Notu:</strong> {previousObs.studentNote}
              </p>
            </div>
          </div>

          {/* Latest Record */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-700/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">
                Yeni Durum ({latestObs.date})
              </span>
              <span className="font-mono tabular-nums text-xs font-bold text-emerald-900">
                🌱 Sağlık Puanı: {latestObs.healthScore}/100 (
                {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta})
              </span>
            </div>
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
              <ResilientImage
                src={latestObs.imageUrl}
                alt="Son gözlem fotoğrafı"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>
                <strong>Görsel Durum:</strong>{' '}
                {latestObs.analysis.leafStemColorAnalysis.leafCondition}
              </p>
              <p>
                <strong>Renk Durumu:</strong>{' '}
                {latestObs.analysis.leafStemColorAnalysis.colorChanges}
              </p>
              <p>
                <strong>Öğrenci Notu:</strong> {latestObs.studentNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

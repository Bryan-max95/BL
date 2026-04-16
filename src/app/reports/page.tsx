'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';

interface ReportMetricSummary {
  totalIncome: number;
  totalPersonalExpenses: number;
  totalJointExpenses: number;
  totalWeddingExpenses: number;
  totalExpenses: number;
  availableToSave: number;
  netBalance: number;
  savingsRate: number;
}

interface TrendItem {
  month: string;
  income: number;
  personalExpenses: number;
  jointExpenses: number;
  weddingExpenses: number;
  expenses: number;
  net: number;
}

interface CategoryExpenseItem {
  category: string;
  source: string;
  amount: number;
}

interface InsightItem {
  title: string;
  description: string;
}

interface ReportData {
  period: string;
  periodLabel: string;
  generatedAt: string;
  range: {
    startDate: string;
    endDate: string;
  };
  summary: ReportMetricSummary;
  monthlyTrend: TrendItem[];
  expensesByCategory: CategoryExpenseItem[];
  incomeByCategory: Array<{ category: string; amount: number }>;
  insights: InsightItem[];
}

const PERIOD_OPTIONS = [
  { value: '1month', label: '1M' },
  { value: '3months', label: '3M' },
  { value: '6months', label: '6M' },
  { value: '1year', label: '1A' },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      if (!res.ok) {
        throw new Error('No se pudo cargar el reporte');
      }
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToPdf = async () => {
    if (!reportData) return;

    try {
      setExportingPdf(true);
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

      const pdfDoc = await PDFDocument.create();
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([595, 842]);
      let { width, height } = page.getSize();
      let cursorY = height - 48;
      const marginX = 42;

      const addPage = () => {
        page = pdfDoc.addPage([595, 842]);
        ({ width, height } = page.getSize());
        cursorY = height - 48;
      };

      const ensureSpace = (required: number) => {
        if (cursorY - required < 48) {
          addPage();
        }
      };

      const writeText = (text: string, x: number, y: number, size = 11, font = regularFont, color = rgb(0.15, 0.18, 0.22)) => {
        page.drawText(text, { x, y, size, font, color });
      };

      const wrapText = (text: string, maxWidth: number, size = 11, font = regularFont) => {
        const words = text.split(' ');
        const lines: string[] = [];
        let current = '';

        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(test, size);
          if (testWidth <= maxWidth) {
            current = test;
          } else {
            if (current) lines.push(current);
            current = word;
          }
        }

        if (current) lines.push(current);
        return lines;
      };

      const sectionTitle = (title: string) => {
        ensureSpace(32);
        writeText(title, marginX, cursorY, 15, boldFont, rgb(0.42, 0.14, 0.19));
        cursorY -= 20;
        page.drawLine({
          start: { x: marginX, y: cursorY },
          end: { x: width - marginX, y: cursorY },
          thickness: 1,
          color: rgb(0.85, 0.85, 0.88),
        });
        cursorY -= 18;
      };

      const metricRow = (label: string, value: string, color = rgb(0.15, 0.18, 0.22)) => {
        ensureSpace(18);
        writeText(label, marginX, cursorY, 11, regularFont);
        writeText(value, width - marginX - boldFont.widthOfTextAtSize(value, 11), cursorY, 11, boldFont, color);
        cursorY -= 18;
      };

      writeText('Reporte Financiero Profesional', marginX, cursorY, 22, boldFont, rgb(0.12, 0.16, 0.23));
      cursorY -= 24;
      writeText(`Usuario: ${user?.username || 'Usuario'}`, marginX, cursorY, 11);
      cursorY -= 16;
      writeText(`Periodo: ${reportData.periodLabel} (${reportData.range.startDate} a ${reportData.range.endDate})`, marginX, cursorY, 11);
      cursorY -= 16;
      writeText(`Generado: ${new Date(reportData.generatedAt).toLocaleString('es-ES')}`, marginX, cursorY, 11);
      cursorY -= 28;

      sectionTitle('Resumen ejecutivo');
      metricRow('Ingresos totales', formatCurrency(reportData.summary.totalIncome), rgb(0.18, 0.31, 0.09));
      metricRow('Gastos personales', formatCurrency(reportData.summary.totalPersonalExpenses), rgb(0.55, 0.18, 0.24));
      metricRow('Gastos conjuntos', formatCurrency(reportData.summary.totalJointExpenses), rgb(0.10, 0.23, 0.32));
      metricRow('Gastos de boda', formatCurrency(reportData.summary.totalWeddingExpenses), rgb(0.44, 0.17, 0.31));
      metricRow('Dinero disponible antes de boda', formatCurrency(reportData.summary.availableToSave), rgb(0.12, 0.34, 0.28));
      metricRow('Ahorro neto del periodo', formatCurrency(reportData.summary.netBalance), reportData.summary.netBalance >= 0 ? rgb(0.18, 0.31, 0.09) : rgb(0.55, 0.18, 0.24));
      metricRow('Tasa de ahorro', formatPercentage(reportData.summary.savingsRate), rgb(0.42, 0.14, 0.19));

      sectionTitle('Hallazgos');
      reportData.insights.forEach((insight) => {
        const lines = wrapText(`${insight.title}: ${insight.description}`, width - marginX * 2, 11, regularFont);
        ensureSpace(lines.length * 15 + 4);
        lines.forEach((line) => {
          writeText(line, marginX, cursorY, 11);
          cursorY -= 15;
        });
        cursorY -= 2;
      });

      sectionTitle('Top gastos por categoria');
      reportData.expensesByCategory.slice(0, 8).forEach((item) => {
        metricRow(`${item.category} (${item.source})`, formatCurrency(item.amount));
      });

      sectionTitle('Ingresos por categoria');
      reportData.incomeByCategory.slice(0, 8).forEach((item) => {
        metricRow(item.category, formatCurrency(item.amount), rgb(0.18, 0.31, 0.09));
      });

      sectionTitle('Tendencia mensual');
      reportData.monthlyTrend.forEach((item) => {
        ensureSpace(48);
        writeText(item.month, marginX, cursorY, 12, boldFont);
        cursorY -= 15;
        writeText(`Ingresos: ${formatCurrency(item.income)}`, marginX, cursorY, 10);
        cursorY -= 13;
        writeText(`Gastos: ${formatCurrency(item.expenses)} | Neto: ${formatCurrency(item.net)}`, marginX, cursorY, 10);
        cursorY -= 20;
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = pdfBytes.buffer.slice(
        pdfBytes.byteOffset,
        pdfBytes.byteOffset + pdfBytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-financiero-${reportData.period}-${reportData.range.endDate}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Cargando reportes...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-600">Error cargando reportes</p>
      </div>
    );
  }

  const topExpenseBase = reportData.expensesByCategory[0]?.amount || 1;

  return (
    <div className="w-full min-h-screen bg-[radial-gradient(circle_at_top,_#f6ecef_0%,_#f8fafc_45%,_#edf3f8_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1d2838] via-[#243447] to-[#6B2430] text-white p-8 shadow-2xl">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">Analitica financiera</p>
              <h1 className="text-4xl font-bold mt-3">Reportes Financieros</h1>
              <p className="text-white/80 mt-4 text-lg leading-8">
                Consolidacion profesional de ingresos, gastos personales, finanzas conjuntas y capacidad real de ahorro.
              </p>
              <p className="text-white/60 mt-4 text-sm">
                Periodo: {reportData.periodLabel} | Rango: {reportData.range.startDate} a {reportData.range.endDate}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    period === option.value
                      ? 'bg-white text-[#6B2430] shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={exportToPdf}
                disabled={exportingPdf}
                className="px-5 py-2 rounded-xl bg-[#f4d6a0] text-[#3a2b10] font-semibold hover:bg-[#f0c77b] transition-all disabled:opacity-60"
              >
                {exportingPdf ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          <MetricCard title="Ingresos del Periodo" value={formatCurrency(reportData.summary.totalIncome)} tone="green" helper="Base para medir ahorro" />
          <MetricCard title="Gastos Personales" value={formatCurrency(reportData.summary.totalPersonalExpenses)} tone="red" helper="Modulo de finanzas personales" />
          <MetricCard title="Gastos Conjuntos" value={formatCurrency(reportData.summary.totalJointExpenses)} tone="blue" helper="Modulo de finanzas conjuntas" />
          <MetricCard title="Ahorro Neto" value={formatCurrency(reportData.summary.netBalance)} tone={reportData.summary.netBalance >= 0 ? 'emerald' : 'red'} helper={`${formatPercentage(reportData.summary.savingsRate)} del ingreso`} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-8 mt-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Motor de ahorro</h2>
                <p className="text-gray-600 mt-2">
                  El reporte calcula lo que realmente puedes conservar despues de personales, conjuntos y boda.
                </p>
              </div>
              <div className={`px-5 py-3 rounded-2xl font-semibold ${
                reportData.summary.availableToSave >= 0 ? 'bg-[#ecf7f1] text-[#2d5016]' : 'bg-[#fff1f1] text-[#8B2E3C]'
              }`}>
                Disponible: {formatCurrency(reportData.summary.availableToSave)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
              <FormulaCard
                title="Finanzas personales + conjuntas"
                formula={`${formatCurrency(reportData.summary.totalIncome)} - ${formatCurrency(reportData.summary.totalPersonalExpenses)} - ${formatCurrency(reportData.summary.totalJointExpenses)}`}
                result={formatCurrency(reportData.summary.availableToSave)}
                tone={reportData.summary.availableToSave >= 0 ? 'green' : 'red'}
              />
              <FormulaCard
                title="Ahorro neto final"
                formula={`${formatCurrency(reportData.summary.availableToSave)} - ${formatCurrency(reportData.summary.totalWeddingExpenses)}`}
                result={formatCurrency(reportData.summary.netBalance)}
                tone={reportData.summary.netBalance >= 0 ? 'green' : 'red'}
              />
            </div>

            <div className="mt-8 space-y-4">
              {reportData.insights.map((insight, index) => (
                <div key={index} className="rounded-2xl border border-gray-100 bg-[#faf7f8] p-5">
                  <p className="text-sm font-semibold text-[#8B2E3C] uppercase tracking-wide">{insight.title}</p>
                  <p className="text-gray-700 mt-2 leading-7">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Distribucion del gasto</h2>
            <p className="text-gray-600 mt-2">Categorias con mayor impacto dentro del periodo seleccionado.</p>

            <div className="space-y-4 mt-8">
              {reportData.expensesByCategory.slice(0, 8).map((cat, idx) => (
                <div key={`${cat.category}-${cat.source}-${idx}`}>
                  <div className="flex justify-between gap-4 mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{cat.category}</p>
                      <p className="text-xs text-gray-500">{cat.source}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#8B2E3C] to-[#d07a6d] h-2.5 rounded-full"
                      style={{ width: `${Math.max((cat.amount / topExpenseBase) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Tendencia mensual avanzada</h2>
            <p className="text-gray-600 mt-2">Comparacion entre ingreso, gasto total y saldo neto por mes.</p>

            <div className="space-y-5 mt-8">
              {reportData.monthlyTrend.map((month, idx) => {
                const reference = Math.max(month.income, month.expenses, 1);
                return (
                  <div key={`${month.month}-${idx}`} className="rounded-2xl border border-gray-100 p-5 bg-[#fcfcfd]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <p className="text-lg font-semibold text-gray-900">{month.month}</p>
                      <div className={`text-sm font-bold ${month.net >= 0 ? 'text-[#2d5016]' : 'text-[#8B2E3C]'}`}>
                        Neto: {formatCurrency(month.net)}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <BarRow label="Ingresos" value={month.income} maxValue={reference} color="from-[#2d5016] to-[#5da447]" />
                      <BarRow label="Gastos totales" value={month.expenses} maxValue={reference} color="from-[#8B2E3C] to-[#d07a6d]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                      <DetailPill label="Personales" value={formatCurrency(month.personalExpenses)} />
                      <DetailPill label="Conjuntos" value={formatCurrency(month.jointExpenses)} />
                      <DetailPill label="Boda" value={formatCurrency(month.weddingExpenses)} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Ingresos por categoria</h2>
            <p className="text-gray-600 mt-2">Origenes que mas alimentan tu capacidad de ahorro.</p>

            <div className="space-y-4 mt-8">
              {reportData.incomeByCategory.length === 0 && (
                <p className="text-gray-500">No hay ingresos registrados en el periodo seleccionado.</p>
              )}
              {reportData.incomeByCategory.map((item, idx) => {
                const base = reportData.incomeByCategory[0]?.amount || 1;
                return (
                  <div key={`${item.category}-${idx}`}>
                    <div className="flex justify-between gap-4 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{item.category}</span>
                      <span className="text-sm font-bold text-[#2d5016]">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#2d5016] to-[#8fd06d] h-2.5 rounded-full"
                        style={{ width: `${Math.max((item.amount / base) * 100, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: 'green' | 'red' | 'blue' | 'emerald';
}) {
  const tones = {
    green: 'border-[#2d5016] text-[#2d5016]',
    red: 'border-[#8B2E3C] text-[#8B2E3C]',
    blue: 'border-[#1a3a52] text-[#1a3a52]',
    emerald: 'border-[#1a4d3e] text-[#1a4d3e]',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-3">{helper}</p>
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  result,
  tone,
}: {
  title: string;
  formula: string;
  result: string;
  tone: 'green' | 'red';
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-[#fcfcfd] p-6">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="text-lg font-bold text-gray-900 mt-3 leading-8">{formula}</p>
      <p className={`text-2xl font-bold mt-4 ${tone === 'green' ? 'text-[#2d5016]' : 'text-[#8B2E3C]'}`}>
        = {result}
      </p>
    </div>
  );
}

function BarRow({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between gap-4 mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(value)}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`bg-gradient-to-r ${color} h-3 rounded-full`}
          style={{ width: `${Math.max((value / maxValue) * 100, 4)}%` }}
        />
      </div>
    </div>
  );
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f6f7fb] border border-gray-100 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/formatters';

interface Transaction {
  id: number;
  amount: number;
  category_name: string;
  description: string;
  date: string;
  username: string;
}

export default function PersonalPage() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    user_id: user?.id
  });

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    const [incomesRes, expensesRes] = await Promise.all([
      fetch('/api/personal/incomes'),
      fetch('/api/personal/expenses')
    ]);
    setIncomes(await incomesRes.json());
    setExpenses(await expensesRes.json());
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = modalType === 'income' ? '/api/personal/incomes' : '/api/personal/expenses';
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      toast.success(`${modalType === 'income' ? 'Ingreso' : 'Gasto'} registrado`);
      setShowModal(false);
      fetchData();
      setFormData({
        amount: '',
        category_id: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        user_id: user?.id
      });
    } else {
      toast.error('Error al registrar');
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string>('');

  const extractLabelValue = (text: string) => {
    const amountRegex = /([0-9]+(?:[.,][0-9]{2}))/g;
    const matches = [...text.matchAll(amountRegex)];
    return matches.map((m) => parseFloat(m[1].replace(/\./g, '').replace(/,/g, '.'))).filter((v) => !isNaN(v));
  };

  const handlePdfUpload = async (file: File) => {
    try {
      setPdfStatus('Procesando PDF...');
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let textContent = '';

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        textContent += content.items.map((item: any) => item.str).join(' ') + '\n';
      }

      const amounts = extractLabelValue(textContent);
      if (amounts.length === 0) {
        setPdfStatus('No se encontraron montos válidos en el PDF.');
        return;
      }

      const newExpenses = amounts.slice(0, 10).map((amount, index) => ({
        user_id: user?.id,
        amount,
        category_id: categories.find((c) => c.name.toLowerCase().includes('factura'))?.id || categories[0]?.id || 1,
        description: `Factura importada ${index + 1}`,
        date: new Date().toISOString().split('T')[0]
      }));

      for (const expense of newExpenses) {
        await fetch('/api/personal/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expense)
        });
      }

      setPdfStatus(`Se importaron ${newExpenses.length} gastos desde el PDF.`);
      fetchData();
    } catch (err) {
      console.error(err);
      setPdfStatus('Error al procesar PDF.');
    }
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handlePdfUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncomes - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Finanzas Personales</h1>
            <p className="text-gray-600 mt-2">Gestiona tus ingresos y gastos individuales</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => {
                setModalType('income');
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Ingreso
            </button>
            <button
              onClick={() => {
                setModalType('expense');
                setShowModal(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              + Gasto
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf"
              onChange={onFileSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
               Escanear factura / subir PDF
            </button>
          </div>
          {pdfStatus && <p className="mt-2 text-sm text-gray-600">{pdfStatus}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Ingresos</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncomes, 'HNL')}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Gastos</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, 'HNL')}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Balance Personal</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(balance, 'HNL')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b">
              <h2 className="text-lg font-semibold text-green-800">Ingresos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs">Descripción</th>
                    <th className="px-4 py-3 text-right text-xs">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map(income => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{new Date(income.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{income.category_name}</td>
                      <td className="px-4 py-2 text-sm">{income.description}</td>
                      <td className="px-4 py-2 text-sm text-right text-green-600">
                        {formatCurrency(income.amount, 'HNL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-6 py-4 bg-red-50 border-b">
              <h2 className="text-lg font-semibold text-red-800">Gastos</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs">Descripción</th>
                    <th className="px-4 py-3 text-right text-xs">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-sm">{expense.category_name}</td>
                      <td className="px-4 py-2 text-sm">{expense.description}</td>
                      <td className="px-4 py-2 text-sm text-right text-red-600">
                        {formatCurrency(expense.amount, 'HNL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {modalType === 'income' ? 'Registrar Ingreso' : 'Registrar Gasto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    {categories.filter(c => c.type === (modalType === 'income' ? 'income' : 'expense')).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    Guardar
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

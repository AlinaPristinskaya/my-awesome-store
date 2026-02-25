'use client';

import { useState, useMemo } from 'react';
import { Trash2, Plus, Loader2, Settings, Sparkles, Filter, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubCategoryManager({ 
  categoryTree, 
  subCategories 
}: any) {
  const router = useRouter();
  
  // 1. ПЕРЕТВОРЮЄМО ОБ'ЄКТ КАТЕГОРІЙ У МАСИВ (щоб дістати ID)
  const mainCategories = useMemo(() => {
    return Object.entries(categoryTree).map(([name, data]: [string, any]) => ({
      id: data.id,
      name: name,
      children: data.children || []
    }));
  }, [categoryTree]);

  // 2. СТАН (Працюємо через ID обраної категорії)
  const [selectedParentId, setSelectedParentId] = useState(mainCategories[0]?.id || '');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // 3. ФІЛЬТРАЦІЯ (Що показувати в таблиці праворуч)
  const currentParent = useMemo(() => 
    mainCategories.find(cat => cat.id === selectedParentId),
  [mainCategories, selectedParentId]);

  const manualSubs = useMemo(() => 
    subCategories.filter((sub: any) => sub.categoryId === selectedParentId),
  [subCategories, selectedParentId]);

  // 4. ФУНКЦІЇ

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newName.trim() || !selectedParentId) {
    alert("Оберіть категорію!");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch('/api/subcategories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify({ 
        name: newName.trim(), 
        categoryId: String(selectedParentId) 
      }),
    });

    const data = await response.json();
    console.log("🔍 Повна відповідь сервера:", data);

    if (response.ok) {
      setNewName('');
      router.refresh();
      alert("✅ Категорію створено!");
    } else {
      // Тепер ми точно побачимо текст помилки
      alert(`Помилка: ${data.error || 'Сервер відхилив запит (400)'}`);
    }
  } catch (error) {
    console.error("🔥 Помилка клієнта:", error);
    alert("Критична помилка мережі");
  } finally {
    setLoading(false);
  }
};

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    setLoading(true);
    try {
     const response = await fetch(`/api/subcategories/${id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: editValue }),
});

      if (response.ok) {
        setEditingId(null);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цю підкатегорію?')) return;
    try {
      const response = await fetch(`/api/subcategories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        alert(`❌ ${data.error}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Помилка при видаленні");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* ФОРМА (ЗЛІВА) */}
      <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit text-black">
        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 italic">
          <Plus className="w-5 h-5 text-indigo-600" /> Нова підкатегорія
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Батьківська категорія</label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm cursor-pointer"
            >
              {mainCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Назва для сайту</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
              placeholder="Введіть назву..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Створити'}
          </button>
        </form>
      </div>

      {/* СПИСОК (СПРАВА) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-black">
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Налаштування для: {currentParent?.name}
             </span>
          </div>
          
          <table className="w-full text-left">
            <tbody className="divide-y divide-gray-50">
              {manualSubs.length === 0 && (
                <tr>
                  <td className="p-10 text-center text-gray-300 text-xs font-bold uppercase italic">
                    Тут ще немає створених підкатегорій
                  </td>
                </tr>
              )}
              
              {manualSubs.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      {editingId === sub.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input 
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(sub.id)}
                            className="bg-white border-2 border-indigo-500 rounded-lg px-3 py-1 font-black text-sm uppercase outline-none w-full"
                          />
                          <button onClick={() => saveEdit(sub.id)} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-red-400"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className="font-black text-sm uppercase">{sub.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    {!editingId && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingId(sub.id); setEditValue(sub.name); }} className="p-2 text-gray-300 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
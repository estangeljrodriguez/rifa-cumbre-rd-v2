import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle, Shuffle } from 'lucide-react';

export default function App() {
  const [boletas, setBoletas] = useState(1);
  const [selectedNums, setSelectedNums] = useState<string[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastBuyer, setLastBuyer] = useState<any>(null);

  // Formulario
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalNumbersRequired = boletas * 3;
  const missingNumbers = totalNumbersRequired - selectedNums.length;
  const totalPrice = boletas * 10000;

  // Generar todos los números del 000 al 999
  const allNumbers = Array.from({ length: 1000 }, (_, i) => i.toString().padStart(3, '0'));

  const getStatus = (num: string) => {
    if (selectedNums.includes(num)) return 'selected';
    if (buyers.some(b => b.numbers.includes(num))) return 'sold';
    return 'available';
  };

  const handleSelect = (num: string) => {
    const status = getStatus(num);
    if (status === 'sold') return;
    
    if (status === 'selected') {
      setSelectedNums(selectedNums.filter(n => n !== num));
    } else {
      if (selectedNums.length < totalNumbersRequired) {
        setSelectedNums([...selectedNums, num].sort());
      } else {
        alert(`Ya elegiste tus ${totalNumbersRequired} números. Aumenta las boletas si quieres más.`);
      }
    }
  };

  const fillRandom = () => {
    if (missingNumbers <= 0) return;
    const available = allNumbers.filter(n => getStatus(n) === 'available');
    if (available.length < missingNumbers) {
      alert('No hay suficientes números libres.');
      return;
    }
    
    const shuffled = available.sort(() => 0.5 - Math.random());
    const newPicks = shuffled.slice(0, missingNumbers);
    setSelectedNums([...selectedNums, ...newPicks].sort());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNums.length < totalNumbersRequired) {
      alert(`Te faltan ${missingNumbers} números por elegir.`);
      return;
    }

    const receiptId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const dateStr = new Date().toLocaleString('es-CO', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: '2-digit' 
    });

    const newBuyer = {
      id: editingId || receiptId,
      name: formName,
      phone: formPhone,
      vendor: formVendor,
      numbers: selectedNums,
      boletas,
      totalPrice,
      dateStr,
      receiptId
    };

    if (editingId) {
      setBuyers(buyers.map(b => b.id === editingId ? newBuyer : b));
      setEditingId(null);
    } else {
      setBuyers([...buyers, newBuyer]);
    }

    setLastBuyer(newBuyer);
    setShowSuccess(true);
    
    // Limpiar formulario
    setSelectedNums([]);
    setFormName('');
    setFormPhone('');
    setBoletas(1);
  };

  const sendWhatsApp = (buyer: any) => {
    const text = `🎟️ *Comprobante – APOYO ECONOMICO CUMBRE RD*\n\nHola ${buyer.name}, gracias por tu compra.\n\nTus números: *${buyer.numbers.join(' · ')}*\nValor: $${buyer.totalPrice.toLocaleString('es-CO')}\nPremio: 500000\nSorteo: 23 noviembre lotería Cundinamarca\n\nComprobante N° ${buyer.receiptId} · ${buyer.dateStr}\n¡Mucha suerte! 🍀`;
    
    const phoneCode = buyer.phone.startsWith('57') ? buyer.phone : `57${buyer.phone}`;
    const url = `https://wa.me/${phoneCode}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setShowSuccess(false);
  };

  const deleteBuyer = (id: string) => {
    if(window.confirm('¿Seguro que deseas eliminar esta compra y liberar los números?')) {
      setBuyers(buyers.filter(b => b.id !== id));
    }
  };

  const editBuyer = (b: any) => {
    setFormName(b.name);
    setFormPhone(b.phone);
    setFormVendor(b.vendor);
    setBoletas(b.boletas);
    setSelectedNums(b.numbers);
    setEditingId(b.id);
    setShowSuccess(false);
  };

  if (showSuccess && lastBuyer) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
        <h2 className="text-2xl font-bold mb-1">¡Compra Guardada!</h2>
        <p className="text-zinc-400 text-sm mb-6">Los números de {lastBuyer.name} han sido reservados.</p>
        
        <button 
          onClick={() => sendWhatsApp(lastBuyer)}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full mb-3 w-full max-w-md text-base transition-colors"
        >
          Enviar Comprobante por WhatsApp
        </button>
        <button 
          onClick={() => setShowSuccess(false)}
          className="text-zinc-400 hover:text-white py-2 text-sm"
        >
          Volver a la Rifa
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-white flex flex-col max-w-2xl mx-auto">
      {/* 1. Header fijo arriba */}
      <header className="px-3 pt-2 pb-1.5 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <h1 className="text-base font-bold">Rifa Cumbre RD</h1>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="font-bold text-white mr-1">{buyers.length}</span>
              <span className="text-zinc-400">Vendidas</span>
            </div>
            <div>
              <span className="font-bold text-green-400 mr-1">
                ${buyers.reduce((acc, b) => acc + b.totalPrice, 0).toLocaleString('es-CO')}
              </span>
              <span className="text-zinc-400">Recaudado</span>
            </div>
          </div>
        </div>

        {/* Pestañas de centenas compactas */}
        <div className="flex overflow-x-auto gap-1.5 pb-1">
          {Array.from({length: 10}).map((_, i) => {
            const start = i * 100;
            const end = start + 99;
            const label = `${start.toString().padStart(3, '0')}-${end.toString().padStart(3, '0')}`;
            const libres = 100 - allNumbers.slice(start, end + 1).filter(n => getStatus(n) === 'sold').length;
            
            return (
              <button 
                key={i}
                onClick={() => setCurrentTab(i)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs transition-colors ${currentTab === i ? 'bg-zinc-100 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
              >
                <div>{label}</div>
                <div className="text-[10px] opacity-75">{libres} libres</div>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. Cuadrícula 10x10 ESTÁTICA (siempre visible sin scroll) */}
      <div className="px-2 py-1.5 shrink-0 bg-zinc-950">
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1">
          {allNumbers.slice(currentTab * 100, (currentTab + 1) * 100).map(num => {
            const status = getStatus(num);
            return (
              <button
                key={num}
                onClick={() => handleSelect(num)}
                disabled={status === 'sold'}
                className={`
                  h-6 sm:h-8 rounded text-[10px] sm:text-xs flex items-center justify-center font-mono border transition-all
                  ${status === 'available' ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : ''}
                  ${status === 'selected' ? 'bg-emerald-500 border-emerald-400 text-black font-bold' : ''}
                  ${status === 'sold' ? 'bg-zinc-900 border-zinc-900 text-zinc-700 opacity-40' : ''}
                `}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Formulario fijo en el centro */}
      <div className="bg-zinc-900 border-y border-zinc-800 px-3 py-2 shrink-0">
        <form onSubmit={handleSave} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
              <span className="text-xs text-zinc-400">Boletas:</span>
              <button type="button" onClick={() => setBoletas(Math.max(1, boletas - 1))} className="w-6 h-6 bg-zinc-800 rounded-full font-bold text-xs">-</button>
              <span className="font-bold text-sm">{boletas}</span>
              <button type="button" onClick={() => setBoletas(boletas + 1)} className="w-6 h-6 bg-zinc-800 rounded-full font-bold text-xs">+</button>
            </div>

            <button 
              type="button" 
              onClick={fillRandom}
              disabled={missingNumbers <= 0}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${missingNumbers > 0 ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-950 text-zinc-600'}`}
            >
              <Shuffle size={14} />
              {missingNumbers > 0 ? `Azar (${missingNumbers})` : 'Completos'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <input required type="text" placeholder="Nombre" value={formName} onChange={e => setFormName(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs w-full text-white" />
            <input required type="tel" placeholder="Celular" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs w-full text-white" />
            <input type="text" placeholder="Vendedor" value={formVendor} onChange={e => setFormVendor(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs w-full text-white" />
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-lg text-sm flex items-center justify-center"
          >
            {editingId ? 'Guardar Cambios' : `Reservar por $${totalPrice.toLocaleString('es-CO')}`}
          </button>
        </form>
      </div>

      {/* 4. Lista de Compradores (única sección con desplazamiento interno si crece) */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Compradores ({buyers.length})</h3>
        <div className="space-y-1.5">
          {buyers.map(b => (
            <div key={b.id} className="bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-bold text-xs">{b.name} <span className="text-zinc-500 font-normal">({b.phone})</span></p>
                <p className="text-[11px] text-emerald-400 font-mono">{b.numbers.join(', ')}</p>
                {b.vendor && <p className="text-[10px] text-zinc-500">Vend: {b.vendor}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => editBuyer(b)} className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 rounded"><Edit2 size={14}/></button>
                <button onClick={() => deleteBuyer(b.id)} className="p-1.5 text-red-400 hover:text-red-300 bg-zinc-800 rounded"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
          {buyers.length === 0 && <p className="text-zinc-600 text-center text-xs py-2">No hay compras registradas aún.</p>}
        </div>
      </div>
    </div>
  );
}
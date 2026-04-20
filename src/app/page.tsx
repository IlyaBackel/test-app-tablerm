'use client';

import { useState } from 'react';
import { TokenAuth } from "@/components/forms/TokenAuth";
import { ClientSearch } from '@/components/forms/ClientSearch';
import { SaleParams } from '@/components/forms/SaleParams';
import { ProductPicker } from '@/components/forms/ProductPicker';
import { ItemCard } from '@/components/forms/ItemCard';
import { Button } from '@/components/ui/button';
import type { Contragent, CartItem } from '@/lib/types';

const safeNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface SaleGoodsItem {
  nomenclature: number;
  price: number;
  quantity: number;
  unit: number;
  discount: number;
  sum_discounted: number;
}
interface SalePayload {
  priority: number;
  dated: number;
  operation: string;
  tax_included: boolean;
  tax_active: boolean;
  goods: SaleGoodsItem[];
  settings: Record<string, unknown>;
  loyalty_card_id: number | null;
  warehouse: number;
  contragent: number;
  paybox: number;
  organization: number;
  status: boolean;
  paid_rubles: string;
  paid_lt: number;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [client, setClient] = useState<Contragent | null>(null);
  
  const [params, setParams] = useState({
    paybox: undefined as number | undefined,
    organization: undefined as number | undefined,
    warehouse: undefined as number | undefined,
    priceType: undefined as number | undefined, 
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const updateParam = (field: keyof typeof params, val: number) => {
    setParams(prev => ({ ...prev, [field]: val }));
  };

  const handleAuthorize = (validToken: string) => {
    setToken(validToken);
    localStorage.setItem('tablecrm_token', validToken);
  };

  const submitSale = async (post: boolean) => {
    if (!client) { alert('⚠️ Выберите клиента'); return; }
    if (cart.length === 0) { alert('⚠️ Добавьте товары в корзину'); return; }
    if (!params.warehouse || !params.organization || !params.paybox) {
      alert('⚠️ Заполните все параметры: счёт, организация, склад');
      return;
    }

    setLoading(true);
    try {
      const goods: SaleGoodsItem[] = cart.map(c => {
        const price = safeNum(c.price);
        const qty = safeNum(c.quantity);
        const discount = safeNum(c.discount);
        const sum = price * qty;
        const sumDiscounted = sum - discount;
        
        return {
          nomenclature: c.id,
          price: parseFloat(price.toFixed(2)),
          quantity: parseFloat(qty.toFixed(3)),
          unit: c.unit || 1,
          discount: parseFloat(discount.toFixed(2)),
          sum_discounted: parseFloat(sumDiscounted.toFixed(2)),
        };
      });

      const total = goods.reduce((s, g) => s + g.sum_discounted, 0);

      const payload: SalePayload = {
        priority: 0,
        dated: Math.floor(Date.now() / 1000),
        operation: 'Заказ',
        tax_included: true,
        tax_active: true,
        goods,
        settings: {},
        loyalty_card_id: client.loyalty_card_id || null,
        warehouse: params.warehouse,
        contragent: client.id,
        paybox: params.paybox,
        organization: params.organization,
        status: post,
        paid_rubles: total.toFixed(2),
        paid_lt: 0,
      };

      const res = await fetch(`/api/sales?token=${token}&post=${post}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([payload])
      });

      const responseText = await res.text();

      if (res.ok) {
        alert(post ? 'Продажа проведена!' : 'Черновик создан!');
        setCart([]);
        setClient(null);
      } else {
        try {
          const err = JSON.parse(responseText);
          const msg = err.detail?.[0]?.msg || err.message || JSON.stringify(err);
          alert(`Ошибка ${res.status}: ${msg}`);
        } catch {
          alert(`Ошибка ${res.status}: ${responseText.slice(0, 200)}`);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Ошибка сети: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <TokenAuth onAuthorize={handleAuthorize} />;

  return (
    <main className="min-h-screen bg-background p-4 pb-24 flex flex-col items-center">
      <header className="mb-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">TableCRM Заказ</h1>
        <p className="text-xs text-muted-foreground">
          Токен: {token ? token.slice(0, 8) + '...' : 'Не авторизован'}
        </p>
      </header>

      <div className="w-full max-w-md space-y-4">
        
        <ClientSearch token={token} selectedClient={client} onSelect={setClient} />
        <SaleParams token={token} value={params} onChange={updateParam} />
        <ProductPicker 
          token={token} 
          onAdd={(item) => setCart(prev => {
            const existing = prev.find(p => p.id === item.id);
            if (existing) {
              return prev.map(p => p.id === item.id 
                ? { ...p, quantity: p.quantity + 1, sum_discounted: p.price * (p.quantity + 1) - p.discount } 
                : p);
            }
            return [...prev, item];
          })} 
        />
        <ItemCard items={cart} onUpdate={setCart} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" className="flex-1 h-12" disabled={loading} onClick={() => submitSale(false)}>
            Создать
          </Button>
          <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700" disabled={loading} onClick={() => submitSale(true)}>
            {loading ? '...' : 'Создать и провести'}
          </Button>
        </div>
      </div>
    </main>
  );
}
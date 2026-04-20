'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Minus, Plus } from 'lucide-react';
import type { CartItem } from '@/lib/types';

interface ItemCardProps {
  items: CartItem[];
  onUpdate: (items: CartItem[]) => void;
}

const safeNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function ItemCard({ items, onUpdate }: ItemCardProps) {
  const total = items.reduce((sum, item) => {
    return sum + (safeNum(item.price) * safeNum(item.quantity)) - safeNum(item.discount);
  }, 0);

  const handlePriceChange = (id: number, newPrice: number) => {
    const price = safeNum(newPrice);
    onUpdate(
      items.map((item) =>
        item.id === id
          ? { 
              ...item, 
              price: price,
              sum_discounted: price * safeNum(item.quantity) - safeNum(item.discount) 
            }
          : item
      )
    );
  };

  const handleQuantityChange = (id: number, newQty: number) => {
    const qty = safeNum(newQty);
    if (qty <= 0) {
      handleRemove(id);
      return;
    }
    onUpdate(
      items.map((item) =>
        item.id === id
          ? { 
              ...item, 
              quantity: qty, 
              sum_discounted: safeNum(item.price) * qty - safeNum(item.discount) 
            }
          : item
      )
    );
  };

  const handleRemove = (id: number) => {
    onUpdate(items.filter((item) => item.id !== id));
  };

  if (items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <p>Корзина пуста</p>
          <p className="text-xs">Добавьте товары из каталога выше</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Корзина</span>
          <span className="text-sm font-normal text-muted-foreground">{items.length} поз.</span>
        </CardTitle>
        <CardDescription>Количество, цена и сумма по позициям</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full px-4">
          <div className="space-y-3 py-2">
            {items.map((item) => {
              const price = safeNum(item.price);
              const qty = safeNum(item.quantity);
              const disc = safeNum(item.discount);
              const lineSum = (price * qty) - disc;

              return (
                <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
                  <div className="flex justify-between items-start">
                    <div className="font-medium leading-none">{item.name}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive/90" 
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        className="h-7 w-20 text-right px-1"
                        value={price}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          handlePriceChange(item.id, val);
                        }}
                        step="0.01"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">₽ / шт.</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleQuantityChange(item.id, qty - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <Input 
                        type="number" 
                        className="h-7 w-16 text-center px-1" 
                        value={qty} 
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          handleQuantityChange(item.id, val);
                        }} 
                        step="0.1" 
                      />
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleQuantityChange(item.id, qty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-right font-bold text-sm pt-1 border-t">
                    {lineSum.toFixed(2)} ₽
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-muted/30 border-t flex justify-between items-center font-bold text-lg">
          <span>Итого:</span>
          <span>{total.toFixed(2)} ₽</span>
        </div>
      </CardContent>
    </Card>
  );
}
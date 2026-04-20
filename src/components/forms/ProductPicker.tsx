'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Nomenclature, CartItem } from '@/lib/types';
import { Loader2, PlusCircle, Search } from 'lucide-react';

interface ProductPickerProps {
    token: string;
    onAdd: (item: CartItem) => void;
}

export function ProductPicker({ token, onAdd }: ProductPickerProps) {
    const [query, setQuery] = useState('');
    const [allProducts, setAllProducts] = useState<Nomenclature[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                const data = await api.getNomenclature(token, '');
                if (isMounted) {
                    setAllProducts(data);
                }
            } catch (error: unknown) {
                console.error('Failed to fetch products', error);
                if (isMounted) {
                    setAllProducts([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAllProducts();
        return () => { isMounted = false; };
    }, [token]);

    const displayedProducts = useMemo(() => {
        if (!query.trim()) return allProducts;

        const lowerQuery = query.toLowerCase();
        return allProducts.filter(p => {
            const nameMatch = p.name?.toLowerCase().includes(lowerQuery);
            const barcodeMatch = p.barcode?.includes(query);
            const articleMatch = (p as { article?: string }).article?.includes(query);
            return nameMatch || barcodeMatch || articleMatch;
        });
    }, [query, allProducts]);

    const handleAdd = (product: Nomenclature) => {
        const price = product.price != null && typeof product.price === 'number'
            ? product.price
            : 0;

        onAdd({
            id: product.id,
            name: product.name || 'Без названия',
            price: price,
            quantity: 1,
            unit: product.unit || 1,
            discount: 0,
            sum_discounted: price,
        });
    };

    return (
        <Card className=" w-full max-w-md mx-auto mt-5 gap-5 p-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Каталог товаров</CardTitle>
                <CardDescription>Поиск и добавление товара</CardDescription>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                    {query && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                            onClick={() => setQuery('')}
                        >
                            ×
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Card className='p-1'>
                    <ScrollArea className="h-[250px] w-full px-4">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Загрузка товаров...</p>
                            </div>
                        )}

                        {!loading && displayedProducts.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                {query ? (
                                    <>
                                        <p>Ничего не найдено по запросу &quot;{query}&quot;</p>
                                        <Button variant="link" size="sm" onClick={() => setQuery('')}>
                                            Показать все товары
                                        </Button>
                                    </>
                                ) : (
                                    <p>Товары не найдены</p>
                                )}
                            </div>
                        )}

                        {!loading && displayedProducts.length > 0 && (
                            <>
                                {query && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                        Найдено: {displayedProducts.length} из {allProducts.length}
                                    </p>
                                )}
                                <div className="space-y-2 py-2">
                                    {displayedProducts.map((product) => {
                                        const hasPrice = product.price != null && typeof product.price === 'number';
                                        const displayPrice = hasPrice ? (product.price as number).toFixed(2) : null;

                                        return (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer"
                                                onClick={() => handleAdd(product)}
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="font-medium truncate">{product.name || `Товар #${product.id}`}</div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                                        {displayPrice ? (
                                                            <Badge variant="secondary" className="text-xs font-mono">
                                                                {displayPrice} ₽
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                                                Цена не указана
                                                            </Badge>
                                                        )}
                                                        {product.barcode && <span className="text-xs opacity-70">{product.barcode}</span>}
                                                    </div>
                                                </div>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shrink-0 gap-1 bg-blue-500 "
                                                    onClick={(e) => { e.stopPropagation(); handleAdd(product); }}
                                                >
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Добавить</span>
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                    </ScrollArea>
                </Card>
            </CardContent>
        </Card>
    );
}
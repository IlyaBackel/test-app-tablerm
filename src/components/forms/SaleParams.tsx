'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { BaseRef } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface SaleParamsValues {
    paybox?: number;
    organization?: number;
    warehouse?: number;
    priceType?: number;
}

interface SaleParamsProps {
    token: string;
    value: SaleParamsValues;
    onChange: (field: keyof SaleParamsValues, val: number) => void;
}

export function SaleParams({ token, value, onChange }: SaleParamsProps) {
    const [lists, setLists] = useState<{
        payboxes: BaseRef[];
        orgs: BaseRef[];
        warehouses: BaseRef[];
        priceTypes: BaseRef[];
    }>({
        payboxes: [],
        orgs: [],
        warehouses: [],
        priceTypes: [],
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        let isMounted = true;

        const fetchData = async () => {
            try {
                const [pb, org, wh, pt] = await Promise.all([
                    api.getPayboxes(token),
                    api.getOrganizations(token),
                    api.getWarehouses(token),
                    api.getPriceTypes(token),
                ]);

                if (isMounted) {
                    setLists({
                        payboxes: pb,
                        orgs: org,
                        warehouses: wh,
                        priceTypes: pt,
                    });
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load params:', err);
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const renderSelect = (
        label: string,
        field: keyof SaleParamsValues,
        items: BaseRef[]
    ) => (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
            </label>
            <Select
                value={value[field]?.toString() || ''}
                onValueChange={(val) => onChange(field, Number(val))}
                disabled={isLoading || items.length === 0}
            >
                <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder={isLoading ? "Загрузка..." : `Выберите ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className='w-full max-h-[70px] overflow-y-auto z-50' >
                    {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name || item.work_name || `Элемент #${item.id}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {items.length === 0 && !isLoading && (
                <p className="text-[10px] text-destructive">Нет доступных данных</p>
            )}
        </div>
    );

    return (
        <Card className="grid grid-cols-1 gap-5 p-4 ">
            <CardHeader>
                <CardTitle className="text-xl">Параметры продажи</CardTitle>
                <CardDescription>Счёт, организация, склад и тип цены</CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-2">
                {renderSelect('Счёт (Касса)', 'paybox', lists.payboxes)}
                {renderSelect('Организация', 'organization', lists.orgs)}
                {renderSelect('Склад', 'warehouse', lists.warehouses)}
                {renderSelect('Тип цен', 'priceType', lists.priceTypes)}
            </div>
        </Card>
    );
}
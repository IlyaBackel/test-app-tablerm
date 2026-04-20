'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { Contragent } from '@/lib/types';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ClientSearchProps {
    token: string;
    onSelect: (client: Contragent | null) => void;
    selectedClient?: Contragent | null;
}

export function ClientSearch({ token, onSelect, selectedClient }: ClientSearchProps) {
    const [phone, setPhone] = useState('');
    const [results, setResults] = useState<Contragent[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) return;

        setLoading(true);
        try {
            const data = await api.getContragents(token, cleaned);
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (clientId: string) => {
        const client = results.find(c => c.id.toString() === clientId) || null;
        onSelect(client);
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-5 gap-5 p-4">
            <CardHeader>
                <CardTitle className="text-xl">Клиент</CardTitle>
                <CardDescription>Введите номер телефона</CardDescription>
            </CardHeader>
            <div className="flex gap-2">
                <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="+79991234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                />
                <Button onClick={handleSearch} disabled={loading || !phone}>
                    {loading ? '⏳' : '🔍'}
                </Button>
            </div>
            <Select
                onValueChange={handleSelect}
                value={selectedClient?.id.toString() || ''}
            >
                <SelectTrigger>
                    <SelectValue placeholder={results.length > 0 ? 'Выберите клиента' : 'Клиент не найден'} />
                </SelectTrigger>
                <SelectContent className='relative z-10' position="popper" sideOffset={4}>
                    {results.length > 0 ? (
                        results.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name} ({client.phone})
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="not-found" disabled>
                            Клиент не найден
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>

        </Card>
    );
}
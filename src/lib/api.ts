import type { 
    Contragent, 
    BaseRef, 
    Nomenclature 
} from './types';

const BASE_URL = 'https://app.tablecrm.com/api/v1';

const parseTableCRMResponse = <T>(data: unknown): T[] => {
    if (!data) return [];
    
    if (typeof data === 'object' && data !== null && 'result' in data) {
        const result = (data as { result: unknown }).result;
        if (Array.isArray(result)) {
            return result as T[];
        }
    }
    
    if (Array.isArray(data)) {
        return data as T[];
    }
    
    console.warn('Unexpected API response format:', data);
    return [];
};

const get = async <T>(endpoint: string, token: string, params?: Record<string, string>): Promise<T[]> => {
    const url = new URL(`${BASE_URL}/${endpoint}`);
    url.searchParams.set('token', token);
    
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
        });
    }

    try {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const json: unknown = await res.json(); 
        return parseTableCRMResponse<T>(json);
    } catch (err) {
        console.error(`[API] Failed to fetch ${endpoint}:`, err);
        return [];
    }
};

export const api = {
    getContragents: (token: string, phone?: string) =>
        get<Contragent>('contragents', token, phone ? { phone } : undefined),

    getWarehouses: (token: string) => get<BaseRef>('warehouses', token),
    getPayboxes: (token: string) => get<BaseRef>('payboxes', token),
    getOrganizations: (token: string) => get<BaseRef>('organizations', token),
    getPriceTypes: (token: string) => get<BaseRef>('price_types', token),
    
    getNomenclature: (token: string, search?: string) =>
        get<Nomenclature>('nomenclature', token, search ? { search } : undefined),
};


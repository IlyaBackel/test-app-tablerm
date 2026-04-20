export interface Contragent {
    id: number;
    name: string;
    phone: string;
    loyalty_card_id?: number;
    external_id?: string;
    inn?: string;
    email?: string;
}

export interface BaseRef {
    id: number;
    name: string;
    title?: string;
    full_name?: string;
    short_name?: string;
    work_name?: string;
}

export type Warehouse = BaseRef;
export type Paybox = BaseRef;
export type Organization = BaseRef;
export type PriceType = BaseRef;

export interface Nomenclature extends BaseRef {
    price: number;
    unit: number;
    barcode?: string;
    article?: string;
}

export interface CartItem {
    id: number; 
    name: string
    price: number;
    quantity: number;
    unit: number;
    discount: number;
    sum_discounted: number;
}

export interface SalePayload {
    priority: number;
    dated: number;
    operation: string;
    tax_included: boolean;
    tax_active: boolean;
    goods: CartItem[];
    settings: Record<string, unknown>; 
    loyalty_card_id?: number;
    warehouse: number;
    contragent: number;
    paybox: number;
    organization: number;
    status: boolean;
    paid_rubles: number | string;
    paid_lt: number;
}
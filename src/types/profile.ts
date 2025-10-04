export interface Money {
  amount: string;
  currencyCode: string;
}

export interface OrderItem {
  title: string;
  quantity: number;
  variant: {
    image?: {
      url: string;
    };
    price: Money;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: Money;
  lineItems: {
    edges: Array<{
      node: OrderItem;
    }>;
  };
}

export interface CustomerOrders {
  orders: {
    edges: Array<{
      node: Order;
    }>;
  };
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  defaultAddress?: Address;
  addresses: {
    edges: Array<{
      node: Address;
    }>;
  };
  orders: CustomerOrders['orders'];
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}
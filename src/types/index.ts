import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface CustomerCreateResponse {
  customerCreate: {
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    } | null;
    customerUserErrors: {
      code: string;
      field: string[];
      message: string;
    }[];
  };
}

export interface CustomerUpdateResponse {
  customerUpdate: {
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
    } | null;
    customerUserErrors: {
      code: string;
      field: string[];
      message: string;
    }[];
  };
}

export interface CustomerResponse {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface ImageNode {
  node: {
    url: string | StaticImport;
    altText: string | null;
  };
}

export interface ImageEdges {
  edges: ImageNode[];
}

export type ShopifyData<T> = {
  data: T;
  extensions?: Record<string, unknown>;
};

export type GraphQLError = {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
};

export type ShopifyResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export type UnknownObject = Record<string, unknown>;

import { gql } from "graphql-tag";

// Raw type straight from Shopify (items not children)
export type RawMenuItem = {
  id: string;
  title: string;
  url?: string;
  type?: string;
  handle?: string;
  items?: RawMenuItem[];
};

// Clean type we’ll actually use in app
export type MenuItem = {
  id: string;
  title: string;
  url?: string;
  children?: MenuItem[];
};

export const GET_MENU_QUERY = gql`
  query getMenu($handle: String!) {
    menu(handle: $handle) {
      id
      handle
      title
      items {
        id
        title
        type
        url
        items {
          id
          title
          type
          url
          items {
            id
            title
            type
            url
          }
        }
      }
    }
  }
`;

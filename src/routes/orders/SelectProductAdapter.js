import React from 'react';

import {SelectProductField} from './SelectProductField';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const PRODUCTS_LIST_QUERY = gql`
  query ProductsListList {
    productsList {
      items {
        id
        name
        price
      }
    }
  }
`;

const getProducts = (items = []) => items.map(item => { return({ value: item.id, label: item.name })}   )

export const SelectProductAdapter = ({ input: { onChange, value }, label, ...rest }) => (
  <Query query={PRODUCTS_LIST_QUERY}>
    {({ data, loading }) => (
      <SelectProductField
        label={label}
        value={value || []}
        onChange={onChange}
        productsLoading={loading}
        {...rest}
        productOptions={loading ? [] : getProducts(data.productsList.items)}
      />
    )}
  </Query>
)




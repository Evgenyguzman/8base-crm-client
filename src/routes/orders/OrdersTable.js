import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { pathOr } from 'ramda';
import { DateTime } from 'luxon';
import { TableBuilder, Dropdown, Icon, Menu, Link, Tag, Row, withModal, Heading } from '@8base/boost';
import { FIELD_TYPE, DATE_FORMATS, SWITCH_FORMATS, SWITCH_VALUES } from '@8base/utils';

import { NavLink } from 'react-router-dom';

const ORDER_LIST_QUERY = gql`
  query OrdersTableContent(
    $filter: OrderFilter
    $orderBy: [OrderOrderBy]
    $after: String
    $before: String
    $first: Int
    $last: Int
    $skip: Int
  ) {
    ordersList(
      filter: $filter
      orderBy: $orderBy
      after: $after
      before: $before
      first: $first
      last: $last
      skip: $skip
    ) {
      items {
        id
        client {
          id
          _description
        }
        address
        deliveryDt
        comment
        orderItems {
          items {
            id
            _description
            product{
              id
              price
            }
          }
          count
        }
        status
        _description
      }
      count
    }
  }
`;

const TABLE_COLUMNS = [
  {
    name: 'client',
    title: 'Client',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.RELATION,
      fieldTypeAttributes: {
        format: '',
      },
    },
  },
  {
    name: 'address',
    title: 'Address',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'deliveryDt',
    title: 'DeliveryDt',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.DATE,
      fieldTypeAttributes: {
        format: 'DATETIME',
      },
    },
  },
  {
    name: 'comment',
    title: 'Comment',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'orderItems',
    title: 'OrderItems',
    meta: {
      isList: true,
      fieldType: FIELD_TYPE.RELATION,
      fieldTypeAttributes: {
        format: '',
      },
    },
  },
  {
    name: 'status',
    title: 'Status',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.SWITCH,
      fieldTypeAttributes: {
        format: 'CUSTOM',
      },
    },
  },
  {
    name: 'total',
    title: 'Total',
    width: '80px',
  },
  {
    name: 'edit',
    title: '',
    width: '80px',
  },
];

const enhancer = compose(
  withModal,
  graphql(ORDER_LIST_QUERY, { name: 'orders' })
);

const OrderTable = enhancer(
  class OrderTable extends React.PureComponent {
    renderEdit = rowData => (
      <Dropdown defaultOpen={false}>
        <Dropdown.Head>
          <Icon name="More" size="sm" color="LIGHT_GRAY2" />
        </Dropdown.Head>
        <Dropdown.Body pin="right">
          {({ closeDropdown }) => (
            <Menu>
              <Menu.Item
                onClick={() => {
                  this.props.openModal('ORDER_EDIT_DIALOG_ID', { initialValues: rowData });
                  closeDropdown();
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  this.props.openModal('ORDER_DELETE_DIALOG_ID', { id: rowData.id });
                  closeDropdown();
                }}
              >
                Delete
              </Menu.Item>
              <Menu.Item>
                <Link tagName={NavLink} to={"/order/" + rowData.id} underline="false">Open</Link>
              </Menu.Item>
            </Menu>
          )}
        </Dropdown.Body>
      </Dropdown>
    );

    renderTotal = rowData => {
      const {items} = rowData.orderItems
      const total = items.reduce(function(sum, current) {
        return sum + current.product.price;
      }, 0).toFixed(2);
      return <Heading type="h6" text={total} />
    }

    renderItems = (column, rowData, handler) => {
      const dataPath = column.name.split('.');
      const cellData = pathOr('', dataPath, rowData);

      if (column.meta.isList) {
        const itemsArray = cellData.items ? cellData.items : cellData;

        return (
          <Row style={{ flexWrap: 'wrap' }}>
            {itemsArray && itemsArray.map(item => !!item && <Tag color="LIGHT_GRAY2">{handler(item)}</Tag>)}
          </Row>
        );
      } else {
        return cellData && <div>{handler(cellData)}</div>;
      }
    };

    renderScalar = (column, rowData) => {
      return this.renderItems(column, rowData, item => item);
    };

    renderDate = (column, rowData) => {
      const dateFormat =
        column.meta.fieldTypeAttributes.format === DATE_FORMATS.DATE ? DateTime.DATE_SHORT : DateTime.DATETIME_SHORT;

      return this.renderItems(column, rowData, item => DateTime.fromISO(item).toLocaleString(dateFormat));
    };

    renderSwitch = (column, rowData) => {
      if (column.meta.fieldTypeAttributes.format === SWITCH_FORMATS.CUSTOM) {
        return this.renderItems(column, rowData, item => item);
      } else {
        return this.renderItems(column, rowData, item => SWITCH_VALUES[column.meta.fieldTypeAttributes.format][item]);
      }
    };

    renderRelation = (column, rowData) => {
      const dataPath = column.name.split('.');

      if (column.meta.isList) {
        return pathOr('', [...dataPath, 'count'], rowData);
      } else {
        return pathOr('', [...dataPath, '_description'], rowData);
      }
    };

    renderCell = (column, rowData) => {
      if (column.name === 'edit') {
        return this.renderEdit(rowData);
      }
      if (column.name === 'total') {
        return this.renderTotal(rowData);
      }

      switch (column.meta.fieldType) {
        case FIELD_TYPE.TEXT:
        case FIELD_TYPE.NUMBER:
          return this.renderScalar(column, rowData);

        case FIELD_TYPE.DATE:
          return this.renderDate(column, rowData);

        case FIELD_TYPE.SWITCH:
          return this.renderSwitch(column, rowData);

        case FIELD_TYPE.RELATION:
          return this.renderRelation(column, rowData);

        default:
          return null;
      }
    };

    openCreateModal = () => {
      const { openModal } = this.props;

      openModal('ORDER_CREATE_DIALOG_ID');
    };

    render() {
      const { orders } = this.props;
      const tableData = pathOr([], ['ordersList', 'items'], orders);

      return (
        <TableBuilder
          loading={orders.loading}
          data={tableData}
          columns={TABLE_COLUMNS}
          action="Create Order"
          renderCell={this.renderCell}
          onActionClick={this.openCreateModal}
        />
      );
    }
  }
);

export { OrderTable };

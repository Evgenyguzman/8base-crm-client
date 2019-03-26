import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { pathOr } from 'ramda';
import { DateTime } from 'luxon';
import { TableBuilder, Dropdown, Icon, Menu, Link, Tag, Row, withModal } from '@8base/boost';
import { FIELD_TYPE, DATE_FORMATS } from '@8base/utils';

import { NavLink } from 'react-router-dom';

const CLIENT_LIST_QUERY = gql`
  query ClientsTableContent(
    $filter: ClientFilter
    $orderBy: [ClientOrderBy]
    $after: String
    $before: String
    $first: Int
    $last: Int
    $skip: Int
  ) {
    clientsList(
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
        firstName
        lastName
        email
        phone
        birthday
        orders {
          items {
            id
            _description
          }
          count
        }
        _description
      }
      count
    }
  }
`;

const TABLE_COLUMNS = [
  {
    name: 'firstName',
    title: 'FirstName',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'lastName',
    title: 'LastName',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'email',
    title: 'Email',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'phone',
    title: 'Phone',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'birthday',
    title: 'Birthday',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.DATE,
      fieldTypeAttributes: {
        format: 'DATE',
      },
    },
  },
  {
    name: 'orders',
    title: 'Orders',
    meta: {
      isList: true,
      fieldType: FIELD_TYPE.RELATION,
      fieldTypeAttributes: {
        format: '',
      },
    },
  },
  {
    name: 'edit',
    title: '',
    width: '60px',
  },
];

const enhancer = compose(
  withModal,
  graphql(CLIENT_LIST_QUERY, { name: 'clients' })
);

const ClientTable = enhancer(
  class ClientTable extends React.PureComponent {
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
                  this.props.openModal('CLIENT_EDIT_DIALOG_ID', { initialValues: rowData });
                  closeDropdown();
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  this.props.openModal('CLIENT_DELETE_DIALOG_ID', { id: rowData.id });
                  closeDropdown();
                }}
              >
                Delete
              </Menu.Item>
              <Menu.Item>
                <Link tagName={NavLink} to={"/client/" + rowData.id} underline="false">Open</Link>
              </Menu.Item>
            </Menu>
          )}
        </Dropdown.Body>
      </Dropdown>
    );

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

      switch (column.meta.fieldType) {
        case FIELD_TYPE.TEXT:
        case FIELD_TYPE.NUMBER:
          return this.renderScalar(column, rowData);

        case FIELD_TYPE.DATE:
          return this.renderDate(column, rowData);

        case FIELD_TYPE.RELATION:
          return this.renderRelation(column, rowData);

        default:
          return null;
      }
    };

    openCreateModal = () => {
      const { openModal } = this.props;

      openModal('CLIENT_CREATE_DIALOG_ID');
    };

    render() {
      const { clients } = this.props;
      const tableData = pathOr([], ['clientsList', 'items'], clients);

      return (
        <TableBuilder
          loading={clients.loading}
          data={tableData}
          columns={TABLE_COLUMNS}
          action="Create Client"
          renderCell={this.renderCell}
          onActionClick={this.openCreateModal}
        />
      );
    }
  }
);

export { ClientTable };

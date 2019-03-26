import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { pathOr } from 'ramda';
import { DateTime } from 'luxon';
import { TableBuilder, Dropdown, Icon, Menu, Link, Tag, Row, withModal } from '@8base/boost';
import { FIELD_TYPE, FILE_FORMATS, DATE_FORMATS } from '@8base/utils';

const PRODUCT_LIST_QUERY = gql`
  query ProductsTableContent(
    $filter: ProductFilter
    $orderBy: [ProductOrderBy]
    $after: String
    $before: String
    $first: Int
    $last: Int
    $skip: Int
  ) {
    productsList(
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
        picture {
          id
          fileId
          filename
          downloadUrl
          shareUrl
          meta
        }
        name
        description
        price
        orderItems {
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
    name: 'picture',
    title: 'Picture',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.FILE,
      fieldTypeAttributes: {
        format: 'IMAGE',
      },
    },
  },
  {
    name: 'name',
    title: 'Name',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'description',
    title: 'Description',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.TEXT,
      fieldTypeAttributes: {
        format: 'UNFORMATTED',
      },
    },
  },
  {
    name: 'price',
    title: 'Price',
    meta: {
      isList: false,
      fieldType: FIELD_TYPE.NUMBER,
      fieldTypeAttributes: {
        format: 'NUMBER',
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
    name: 'edit',
    title: '',
    width: '60px',
  },
];

const enhancer = compose(
  withModal,
  graphql(PRODUCT_LIST_QUERY, { name: 'products' })
);

const ProductTable = enhancer(
  class ProductTable extends React.PureComponent {
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
                  this.props.openModal('PRODUCT_EDIT_DIALOG_ID', { initialValues: rowData });
                  closeDropdown();
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  this.props.openModal('PRODUCT_DELETE_DIALOG_ID', { id: rowData.id });
                  closeDropdown();
                }}
              >
                Delete
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

    renderFile = (column, rowData) => {
      if (column.meta.fieldTypeAttributes.format === FILE_FORMATS.IMAGE && !column.meta.isList) {
        const cellData = pathOr('', column.name.split('.'), rowData);

        return cellData && <img src={cellData.downloadUrl} alt="filename" style={{ width: '5rem' }} />;
      } else {
        return this.renderItems(column, rowData, item => (
          <div>
            <Link key={item.downloadUrl} target="_blank" href={item.downloadUrl} size="sm">
              {item.filename}
            </Link>
          </div>
        ));
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

        case FIELD_TYPE.FILE:
          return this.renderFile(column, rowData);

        case FIELD_TYPE.RELATION:
          return this.renderRelation(column, rowData);

        default:
          return null;
      }
    };

    openCreateModal = () => {
      const { openModal } = this.props;

      openModal('PRODUCT_CREATE_DIALOG_ID');
    };

    render() {
      const { products } = this.props;
      const tableData = pathOr([], ['productsList', 'items'], products);

      return (
        <TableBuilder
          loading={products.loading}
          data={tableData}
          columns={TABLE_COLUMNS}
          action="Create Product"
          renderCell={this.renderCell}
          onActionClick={this.openCreateModal}
        />
      );
    }
  }
);

export { ProductTable };

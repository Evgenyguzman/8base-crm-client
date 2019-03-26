import React from 'react';
import { memoizeWith, identity } from 'ramda';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { Form as FormLogic, Field } from '@8base/forms';
import {
  Dialog,
  Grid,
  Button,
  Form,
  Row,
  Text,
  SelectField,
  InputField,
  ModalContext,
} from '@8base/boost';
import { FileInput } from '@8base/file-input';

const PRODUCT_UPDATE_MUTATION = gql`
  mutation ProductUpdate($data: ProductUpdateInput!) {
    productUpdate(data: $data) {
      id
    }
  }
`;
const ORDERITEMS_LIST_QUERY = gql`
  query OrderItemsListList {
    orderItemsList {
      items {
        id
        _description
      }
    }
  }
`;

const getRelationOptions = (items = []) => items.map(item => ({ value: item.id, label: item._description }));

const FileInputField = ({ input, meta, maxFiles, label, ...rest }) => (
  <Form.Field label={label} input={input} meta={meta}>
    <FileInput onChange={input.onChange} value={input.value} maxFiles={maxFiles} public={rest.public}>
      {({ pick, value }) => (
        <Row stretch alignItems="center">
          <Button type="button" onClick={() => pick()} stretch color="neutral">
            Choose Files
          </Button>
          <Text size="sm">
            {value ? (Array.isArray(value) ? `${value.length} files selected` : value.filename) : 'No files selected'}
          </Text>
        </Row>
      )}
    </FileInput>
  </Form.Field>
);

const ehnhancer = graphql(PRODUCT_UPDATE_MUTATION, {
  name: 'productUpdate',
  options: {
    refetchQueries: ['ProductsTableContent'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'Product successfuly updated',
    },
  },
});

const ProductEditDialog = ehnhancer(
  class ProductEditDialog extends React.PureComponent {
    static contextType = ModalContext;

    updateOnSubmit = memoizeWith(identity, id => async data => {
      await this.props.productUpdate({ variables: { data: { ...data, id } } });

      this.context.closeModal('PRODUCT_EDIT_DIALOG_ID');
    });

    onClose = () => {
      this.context.closeModal('PRODUCT_EDIT_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="Edit Product" onClose={this.onClose} />
        <Dialog.Body scrollable>
          <Grid.Layout gap="md" stretch>
            <Grid.Box>
              <Field name="picture" label="Picture" component={FileInputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="name" label="Name" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="description" label="Description" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="price" label="Price" type="number" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Query query={ORDERITEMS_LIST_QUERY}>
                {({ data, loading }) => (
                  <Field
                    name="orderItems"
                    label="Order Items"
                    multiple={true}
                    component={SelectField}
                    placeholder="Select a orderitem"
                    loading={loading}
                    options={loading ? [] : getRelationOptions(data.orderItemsList.items)}
                    stretch
                  />
                )}
              </Query>
            </Grid.Box>
          </Grid.Layout>
        </Dialog.Body>
        <Dialog.Footer>
          <Button color="neutral" type="button" variant="outlined" disabled={submitting} onClick={this.onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={pristine || invalid} loading={submitting}>
            Update Product
          </Button>
        </Dialog.Footer>
      </form>
    );

    renderForm = ({ args }) => {
      return (
        <FormLogic
          type="UPDATE"
          tableSchemaName="Products"
          onSubmit={this.updateOnSubmit(args.initialValues.id)}
          initialValues={args.initialValues}
        >
          {this.renderFormContent}
        </FormLogic>
      );
    };

    render() {
      return (
        <Dialog id={'PRODUCT_EDIT_DIALOG_ID'} size="sm">
          {this.renderForm}
        </Dialog>
      );
    }
  }
);

export { ProductEditDialog };

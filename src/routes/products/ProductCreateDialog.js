import React from 'react';
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

const PROPERTY_CREATE_MUTATION = gql`
  mutation ProductCreate($data: ProductCreateInput!) {
    productCreate(data: $data) {
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

const enhancer = graphql(PROPERTY_CREATE_MUTATION, {
  name: 'productCreate',
  options: {
    refetchQueries: ['ProductsTableContent'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'Product successfuly created',
    },
  },
});

const ProductCreateDialog = enhancer(
  class ProductCreateDialog extends React.PureComponent {
    static contextType = ModalContext;

    onSubmit = async data => {
      await this.props.productCreate({ variables: { data } });

      this.context.closeModal('PRODUCT_CREATE_DIALOG_ID');
    };

    onClose = () => {
      this.context.closeModal('PRODUCT_CREATE_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="New Product" onClose={this.onClose} />
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
          <Button color="primary" type="submit" loading={submitting}>
            Create Product
          </Button>
        </Dialog.Footer>
      </form>
    );

    render() {
      return (
        <Dialog id={'PRODUCT_CREATE_DIALOG_ID'} size="sm">
          <FormLogic type="CREATE" tableSchemaName="Products" onSubmit={this.onSubmit}>
            {this.renderFormContent}
          </FormLogic>
        </Dialog>
      );
    }
  }
);

export { ProductCreateDialog };

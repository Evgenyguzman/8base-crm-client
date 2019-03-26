import React from 'react';
import gql from 'graphql-tag';
import { Query, graphql } from 'react-apollo';
import { Form as FormLogic, Field } from '@8base/forms';
import {
  Dialog,
  Grid,
  Button,
  SelectField,
  InputField,
  DateInputField,
  ModalContext,
} from '@8base/boost';
import { SelectProductAdapter } from './SelectProductAdapter';

const PROPERTY_CREATE_MUTATION = gql`
  mutation OrderCreate($data: OrderCreateInput!) {
    orderCreate(data: $data) {
      id
    }
  }
`;

const CLIENT_LIST_QUERY = gql`
  query ClientsListList {
    clientsList {
      items {
        id
        _description
      }
    }
  }
`;
const ORDERITEMS_LIST_QUERY = gql`
  query OrderItemsListList {
    orderItemsList {
      items {
        id
        _description
        product{
          id
          name
        }
      }
    }
  }
`;

const getRelationOptions = (items = []) => items.map(item => ({ value: item.id, label: item._description }))
const getOrderItems = (items = []) => items.map(item => { return { id: item.id, label: (item.product) ? item.product.name : undefined, quantity: item._description, productId: (item.product) ? item.product.id : undefined } });

const enhancer = graphql(PROPERTY_CREATE_MUTATION, {
  name: 'orderCreate',
  options: {
    refetchQueries: ['OrdersTableContent'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'Order successfuly created',
    },
  },
});

const OrderCreateDialog = enhancer(
  class OrderCreateDialog extends React.PureComponent {
    
    static contextType = ModalContext;

    onSubmit = async data => {
      console.log(data)
      await this.props.orderCreate({ variables: { data } });
      this.context.closeModal('ORDER_CREATE_DIALOG_ID');
    };

    onClose = () => {
      this.context.closeModal('ORDER_CREATE_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, submitting}) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="New Order" onClose={this.onClose} />
        <Dialog.Body scrollable>
          <Grid.Layout gap="md" stretch="true">
            <Grid.Box>
              <Query query={CLIENT_LIST_QUERY}>
                {({ data, loading }) => (
                  <Field
                    name="client"
                    label="Client"
                    multiple={false}
                    component={SelectField}
                    placeholder="Select a client"
                    loading={loading}
                    options={loading ? [] : getRelationOptions(data.clientsList.items)}
                    stretch="true"
                  />
                )}
              </Query>
            </Grid.Box>
            <Grid.Box>
              <Field name="address" label="Address" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="deliveryDt" label="Delivery Dt" withTime={true} component={DateInputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="comment" label="Comment" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Query query={ORDERITEMS_LIST_QUERY}>
                {({ data, loading }) => (
                  <Field
                    name="orderItems"
                    label="Products"
                    component={SelectProductAdapter}
                    placeholder="Select products"
                    loading={loading}
                    options={loading ? [] : getOrderItems(data.orderItemsList.items)}
                  />
                )}
              </Query>
            </Grid.Box>
            <Grid.Box>
              <Field
                name="status"
                label="Status"
                multiple={false}
                component={SelectField}
                options={[
                  { label: 'Opened', value: 'Opened' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'ReadyToDelivery', value: 'ReadyToDelivery' },
                  { label: 'Delivering', value: 'Delivering' },
                  { label: 'Closed', value: 'Closed' },
                  { label: 'Canceled', value: 'Canceled' },
                ]}
              />
            </Grid.Box>
          </Grid.Layout>
        </Dialog.Body>
        <Dialog.Footer>
          <Button color="neutral" type="button" variant="outlined" disabled={submitting} onClick={this.onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" loading={submitting}>
            Create Order
          </Button>
        </Dialog.Footer>
      </form>
    );

    render() {
      return (
        <Dialog id={'ORDER_CREATE_DIALOG_ID'} size="sm">
          <FormLogic type="CREATE" tableSchemaName="Orders" onSubmit={this.onSubmit}>
            {this.renderFormContent}
          </FormLogic>
        </Dialog>
      );
    }
  }
);

export { OrderCreateDialog };

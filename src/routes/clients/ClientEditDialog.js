import React from 'react';
import { memoizeWith, identity } from 'ramda';
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

const CLIENT_UPDATE_MUTATION = gql`
  mutation ClientUpdate($data: ClientUpdateInput!) {
    clientUpdate(data: $data) {
      id
    }
  }
`;
const ORDERS_LIST_QUERY = gql`
  query OrdersListList {
    ordersList {
      items {
        id
        _description
      }
    }
  }
`;

const getRelationOptions = (items = []) => items.map(item => ({ value: item.id, label: item._description }));

const ehnhancer = graphql(CLIENT_UPDATE_MUTATION, {
  name: 'clientUpdate',
  options: {
    refetchQueries: ['ClientsTableContent'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'Client successfuly updated',
    },
  },
});

const ClientEditDialog = ehnhancer(
  class ClientEditDialog extends React.PureComponent {
    static contextType = ModalContext;

    updateOnSubmit = memoizeWith(identity, id => async data => {
      await this.props.clientUpdate({ variables: { data: { ...data, id } } });

      this.context.closeModal('CLIENT_EDIT_DIALOG_ID');
    });

    onClose = () => {
      this.context.closeModal('CLIENT_EDIT_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting, pristine }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="Edit Client" onClose={this.onClose} />
        <Dialog.Body scrollable>
          <Grid.Layout gap="md" stretch="true">
            <Grid.Box>
              <Field name="firstName" label="First Name" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="lastName" label="Last Name" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="email" label="Email" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="phone" label="Phone" component={InputField} />
            </Grid.Box>
            <Grid.Box>
              <Field name="birthday" label="Birthday" withTime={false} component={DateInputField} />
            </Grid.Box>
            <Grid.Box>
              <Query query={ORDERS_LIST_QUERY}>
                {({ data, loading }) => (
                  <Field
                    name="orders"
                    label="Orders"
                    multiple={true}
                    component={SelectField}
                    placeholder="Select a order"
                    loading={loading}
                    options={loading ? [] : getRelationOptions(data.ordersList.items)}
                    stretch="true"
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
            Update Client
          </Button>
        </Dialog.Footer>
      </form>
    );

    renderForm = ({ args }) => {
      return (
        <FormLogic
          type="UPDATE"
          tableSchemaName="Clients"
          onSubmit={this.updateOnSubmit(args.initialValues.id)}
          initialValues={args.initialValues}
        >
          {this.renderFormContent}
        </FormLogic>
      );
    };

    render() {
      return (
        <Dialog id={'CLIENT_EDIT_DIALOG_ID'} size="sm">
          {this.renderForm}
        </Dialog>
      );
    }
  }
);

export { ClientEditDialog };

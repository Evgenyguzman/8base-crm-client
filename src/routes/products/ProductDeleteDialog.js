import React from 'react';
import gql from 'graphql-tag';
import { memoizeWith, identity } from 'ramda';
import { Form as FormLogic } from '@8base/forms';
import { Dialog, Button, ModalContext } from '@8base/boost';
import { graphql } from 'react-apollo';

const PRODUCT_DELETE_MUTATION = gql`
  mutation ProductDelete($id: ID!) {
    productDelete(data: { id: $id }) {
      success
    }
  }
`;

const enhancer = graphql(PRODUCT_DELETE_MUTATION, {
  name: 'productDelete',
  options: {
    refetchQueries: ['ProductsTableContent'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'Product successfuly deleted',
    },
  },
});

const ProductDeleteDialog = enhancer(
  class ProductDeleteDialog extends React.Component {
    static contextType = ModalContext;

    createOnSubmit = memoizeWith(identity, id => async () => {
      await this.props.productDelete({ variables: { id } });

      this.context.closeModal('PRODUCT_DELETE_DIALOG_ID');
    });

    onClose = () => {
      this.context.closeModal('PRODUCT_DELETE_DIALOG_ID');
    };

    renderFormContent = ({ handleSubmit, invalid, submitting }) => (
      <form onSubmit={handleSubmit}>
        <Dialog.Header title="Delete Product" onClose={this.onClose} />
        <Dialog.Body scrollable>Are you really want to delete listing?</Dialog.Body>
        <Dialog.Footer>
          <Button color="neutral" variant="outlined" disabled={submitting} onClick={this.onClose}>
            Cancel
          </Button>
          <Button color="danger" type="submit" disabled={invalid} loading={submitting}>
            Delete Product
          </Button>
        </Dialog.Footer>
      </form>
    );

    renderContent = ({ args }) => {
      return <FormLogic onSubmit={this.createOnSubmit(args.id)}>{this.renderFormContent}</FormLogic>;
    };

    render() {
      return (
        <Dialog id={'PRODUCT_DELETE_DIALOG_ID'} size="sm">
          {this.renderContent}
        </Dialog>
      );
    }
  }
);

export { ProductDeleteDialog };

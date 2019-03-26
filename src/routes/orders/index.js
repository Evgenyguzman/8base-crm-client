import React from 'react';
import { Card, Heading } from '@8base/boost';

import { OrderCreateDialog } from './OrderCreateDialog';
import { OrderEditDialog } from './OrderEditDialog';
import { OrderDeleteDialog } from './OrderDeleteDialog';
import { OrderTable } from './OrdersTable';

const Orders = () => (
  <Card padding="md" stretch>
    <Card.Header>
      <Heading type="h4" text=" Orders" />
    </Card.Header>

    <OrderCreateDialog />
    <OrderEditDialog />
    <OrderDeleteDialog />
    <Card.Body padding="none" stretch scrollable>
      <OrderTable />
    </Card.Body>
  </Card>
);

export { Orders };

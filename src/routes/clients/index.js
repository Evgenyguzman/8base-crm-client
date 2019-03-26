import React from 'react';
import { Card, Heading } from '@8base/boost';

import { ClientCreateDialog } from './ClientCreateDialog';
import { ClientEditDialog } from './ClientEditDialog';
import { ClientDeleteDialog } from './ClientDeleteDialog';
import { ClientTable } from './ClientsTable';

const Clients = () => (
  <Card padding="md" stretch>
    <Card.Header>
      <Heading type="h4" text=" Clients" />
    </Card.Header>

    <ClientCreateDialog />
    <ClientEditDialog />
    <ClientDeleteDialog />
    <Card.Body padding="none" stretch scrollable>
      <ClientTable />
    </Card.Body>
  </Card>
);

export { Clients };

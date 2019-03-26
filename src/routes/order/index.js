import React from 'react';
import { Card, Heading, Link, Column, Row } from '@8base/boost';
import { NavLink } from 'react-router-dom';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const query = gql`
  query Order($id: ID) {
    order(id: $id){
      id
      address
      deliveryDt
      status
      comment
      client{
        id
        firstName
        lastName
      }
      orderItems{
        items{
          id
          quantity
          product{
            id
            name
            description
            picture {
              id
              fileId
              filename
              downloadUrl
              shareUrl
              meta
            }
            price
          }
        }
      }
    } 
  }
`;

class Order extends React.Component {

  render(){

    return(
      <div>
        <Link tagName={NavLink} to={"/orders"} underline="false">Go to orders</Link>
        <Card padding="md" stretch>
          <Card.Header>
            <Heading type="h4" text=" Order" />
          </Card.Header>

          <Card.Body padding="none" stretch scrollable>
            <Query query={query} variables={{ id: this.props.computedMatch.params.id }}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading...';
                if (error) return `Error! ${error.message}`;
                console.log(data)
                if (data.order === null) return '' // редирект на список
                const { id, address, deliveryDt, status, client, comment, orderItems } = data.order
                return (
                  <div style={{padding: '30px'}}>
                    <Column gap="sm" alignItems="stretch">
                      <Row gap="sm" alignItems="center">
                        <label>ID</label><Heading type="h4" text={id} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Client</label>
                        <Heading type="h4" text={client.firstName + " " + client.lastName} />
                        <Link tagName={NavLink} to={"/client/" + client.id} underline="false">Open Client</Link>
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Address</label><Heading type="h4" text={address} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Delivery date</label><Heading type="h4" text={deliveryDt} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Status</label><Heading type="h4" text={status} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Comment</label><Heading type="h4" text={comment} />
                      </Row>
                      <Row gap="sm" alignItems="start">
                        <label>Products</label>
                        <Column gap="sm" alignItems="stretch">
                          <table>
                            <thead>
                              <tr>
                                <th></th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                            {orderItems.items.map((item)=>(
                                <tr key={item.id}>
                                  <td><img src={item.product.picture.downloadUrl} alt={item.product.name} style={{maxHeight: '60px'}}/></td>
                                  <td>{item.product.name}</td>
                                  <td>{item.product.price}</td>
                                  <td>{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Column>
                      </Row>
                    </Column>
                  </div>
                );
              }}
            </Query>
          </Card.Body>
        </Card>
      </div>
    )
  }

};

export { Order };
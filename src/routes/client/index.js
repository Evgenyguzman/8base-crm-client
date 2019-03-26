import React from 'react';
import { Card, Heading, Row, Column, Link } from '@8base/boost';
import { NavLink } from 'react-router-dom';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const query = gql`
  query Client($id: ID) {
    client(id: $id) {
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
          deliveryDt
          address
          status
          comment
          orderItems{
            items{
              id
              product{
                id
                price
              }
            }
          }
        }
        count
      }
    }
  }
`;

class Client extends React.Component {

  render(){ 

    return(

      <div>
        <Link tagName={NavLink} to={"/clients"} underline="false">Go to clients</Link>
        <Card padding="md" stretch>
          <Card.Header>
            <Heading type="h4" text=" Client" />
          </Card.Header>

          <Card.Body padding="none" stretch scrollable>
            <Query query={query} variables={{ id: this.props.computedMatch.params.id }}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading...';
                if (error) return `Error! ${error.message}`;
                console.log(data)
                if (data.client === null) return '' // редирект на список
                const { firstName, lastName, email, phone, birthday, orders } = data.client
                return (
                  <div style={{padding: '30px'}}>
                    <Column gap="sm" alignItems="stretch">
                      <Row gap="sm" alignItems="center">
                        <label>Name</label><Heading type="h4" text={firstName + " " + lastName} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Email</label><Heading type="h4" text={email} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Phone</label><Heading type="h4" text={phone} />
                      </Row>
                      <Row gap="sm" alignItems="center">
                        <label>Birthday</label><Heading type="h4" text={birthday} />
                      </Row>
                      <Row gap="sm" alignItems="start">
                        <label>Orders</label>
                        <Column gap="sm" alignItems="stretch">
                          <table>
                            <thead>
                              <tr>
                                <th>Address</th>
                                <th>Delivery Date</th>
                                <th>Status</th>
                                <th>Comment</th>
                                <th>Link</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.items.map((item)=>(
                                <tr key={item.id}>
                                  <td>{item.address}</td>
                                  <td>{item.deliveryDt}</td>
                                  <td>{item.status}</td>
                                  <td>{item.comment}</td>
                                  <td><Link tagName={NavLink} to={"/order/" + item.id} underline="false">Open Order</Link></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </Column>
                      </Row>
                    </Column>
                    {/* нужно отобразить список заказов со ссылками */}
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

export { Client };

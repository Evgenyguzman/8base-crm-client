import React from 'react';
import { Select } from '@8base/boost/es/components/Select';
import {
  Row,
  Column,
  Icon,
  Input,
  Heading
} from '@8base/boost';

import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';

const PROPERTY_CREATE_MUTATION = gql`
  mutation OrderItemCreate($data: OrderItemCreateInput!){
    orderItemCreate(data: $data) {
      id
    }
  }
`;
const PROPERTY_UPDATE_MUTATION = gql`
  mutation OrderItemUpdate($data: OrderItemUpdateInput!){
    orderItemUpdate(data: $data) {
      id
    }
  }
`;
const PROPERTY_DELETE_MUTATION = gql`
  mutation OrderItemDelete($id: ID!){
    orderItemDelete(data: { id: $id }) {
      success
    }
  }
`;

const createMutation = graphql(PROPERTY_CREATE_MUTATION, {
  name: 'orderItemCreate',
  options: {
    refetchQueries: ['OrderItemsListList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfuly created',
    },
  },
});
const updateMutation = graphql(PROPERTY_UPDATE_MUTATION, {
  name: 'orderItemUpdate',
  options: {
    refetchQueries: ['OrderItemsListList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfuly updated',
    },
  },
});
const deleteMutation = graphql(PROPERTY_DELETE_MUTATION, {
  name: 'orderItemDelete',
  options: {
    refetchQueries: ['OrderItemsListList'],
    context: {
      TOAST_SUCCESS_MESSAGE: 'OrderItem successfuly deleted',
    },
  },
});

const enhancer = compose(createMutation, updateMutation, deleteMutation)

export const SelectProductRow = ({ value, index, options, onCreate=f=>f, onUpdate=f=>f, onDelete=f=>f }) => (
  <Row gap="sm" alignItems="center">
    <Select 
      value={value.productId}
      options={options}
      multiple={false}
      onChange={(productId)=>{
        (value.id) 
          ? onUpdate({
            value: {
              productId,
              quantity: value.quantity || 1
            }
          }) 
          : onCreate({
            value: {
              productId,
              quantity: value.quantity || 1
            }
          })
      }}
    />
    {
      (value.id) 
      ? 
        <Input 
          value={value.quantity || 1} 
          onChange={(quantity)=>{
            (value.id)
              ? onUpdate({
                value: {
                  productId: value.productId,
                  quantity
                }
              }) 
              : onCreate({
                value: {
                  productId: value.productId,
                  quantity
                }
              })
          }} 
        />
      : 
        ''
    }
    {
      (value.id) 
      ? 
        <Icon color="GRAY1" name="Delete" cursor="pointer" onClick={() => onDelete()} /> 
      : 
        ''
    }
  </Row>
)

export const SelectProductField = enhancer( 
  class SelectProductField extends React.Component{
    constructor(props){
      super(props)

      this.state = {
        isUpdating: false
      }

      this.onCreate = this.onCreate.bind(this)
      this.onDelete = this.onDelete.bind(this)
      this.onDelete = this.onDelete.bind(this)
    }

    async onCreate({index, value}){
      console.log('create', index, value)
      this.setState({isUpdating: true})
      const data = {
        quantity: value.quantity,
        product: {
          connect: {
            id: value.productId
          }
        }
      }
      const res = await this.props.orderItemCreate({ variables: { data } })
      setTimeout(()=>{
        this.setState({isUpdating: false})
      }, 500)
      if(res.data.orderItemCreate.id){
        const id = res.data.orderItemCreate.id
        let values = JSON.parse(JSON.stringify(this.props.value)) 
        values[index] = id
        this.props.onChange(values)
      }
    }
    async onUpdate({index, id, value}){
      console.log('update', index, id, value)
      this.setState({isUpdating: true})
      const data = {
        id: id,
        quantity: value.quantity,
        product: {
          reconnect: {
            id: value.productId
          }
        }
      }
      await this.props.orderItemUpdate({ variables: { data } })
      setTimeout(()=>{
        this.setState({isUpdating: false})
      }, 500)
    }
    async onDelete({index, id}){
      console.log('delete', index, id)
      this.setState({isUpdating: true})
      const res = await this.props.orderItemDelete({ variables: { id } })
      setTimeout(()=>{
        this.setState({isUpdating: false})
      }, 500)
      if(res.data.orderItemDelete.success){
        let values = JSON.parse(JSON.stringify(this.props.value)) 
        values.splice(index, 1);
        this.props.onChange(values)
      } 
    }

    render(){
      const { options, productOptions, value, label, loading, productsLoading } = this.props
      // console.log(this.props)
      
      let className = 'updating-overlay'
      if(loading || productsLoading || this.state.isUpdating){
        className += ' updating'
      }

      let values = value.map((id)=>{
        return options.find((option)=>{
          return (option.id === id)
        })
      }).filter((cur)=>{
        return cur !== undefined
      })

      return(
        <React.Fragment>
          <label>{label}</label>
          <Column gap="sm" alignItems="stretch">
            {values.map((value, index) => (
              <SelectProductRow 
                key={index}
                value={value} 
                index={index} 
                options={productOptions}
                onUpdate={(data)=>this.onUpdate({index, id: value.id, ...data})}
                onDelete={()=>this.onDelete({index, id: value.id})} 
              />
            ))}
            <SelectProductRow 
              value={{id: undefined, quantity: 1, productId: undefined, label: '' }} 
              index={values.length} 
              options={productOptions}
              onCreate={(data)=>this.onCreate({index: values.length, ...data})}
            />
          </Column>
          <div className={className}>
            <Heading type="h4" text="Loading..." />
          </div>
        </React.Fragment>
      )
    }

  }
)

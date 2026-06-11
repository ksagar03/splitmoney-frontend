import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_GROUPS = gql`
  query GetGroups {
    groups {
      id
      name
      createdBy { 
        id 
        }
      members {
        id
        name
      }
      expenses {
        amount
      }
    }
  }
`;

export const GENERATE_GROUP_INVITE = gql`
  mutation GenerateGroupInvite($groupId: ID!) {
    generateGroupInvite(groupId: $groupId)
  }
`;

export const JOIN_GROUP = gql`
  mutation JoinGroup($token: String!) {
    joinGroup(token: $token) {
      id
      name
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      name
      members {
        id
        name
      }
    }
  }
`;

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      amount
      description
      group {
        id
        name
      }
    }
  }
`;

export const UPDATE_EXPENSE = gql`
mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!){
  UpdateExpense(id: $id, input: $input){
    id
    amount
    description
    group {
      id
      name
    }
  }
}
`;

export const DELETE_EXPENSE = gql`
mutation DeleteExpense($id: ID!){
  DeleteExpense(id: $id)
}
`;

export const UPDATE_GROUP = gql`
mutation UpdateGroup($groupId: ID!, $input: UpdateGroupInput!){
updateGroup(groupId: $groupId, input: $input){
  id
  name
  members {
    id
    name
  }
}
}
`;
export const DELETE_GROUP = gql`
mutation DeleteGroup($groupId: ID!){
  deleteGroup(groupId: $groupId)
}
`;
export const LEAVE_GROUP = gql`
mutation LeaveGroup($groupId: ID!){
  leaveGroup(groupId: $groupId)
}
`;
export const REMOVE_MEMBER = gql`
mutation RemoveMember($groupId: ID!, $memberId: ID!){
  removeMember(groupId: $groupId, memberId: $memberId)
}
`;
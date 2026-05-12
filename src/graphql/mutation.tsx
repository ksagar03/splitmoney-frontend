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
      members {
        id
        name
      }
    }
  }
`;

export const CREATE_GROUP = gql`
mutation CreateGroup($name: String!, $members: [ID!]!){
  createGroup(name: $name, members: $members) {
    id
    name
    members {
      id
      name
    }
  }
}
`;

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

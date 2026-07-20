import { gql } from "@apollo/client";

export const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: ID!) {
    group(id: $groupId) {
      id
      name
      members {
        id
        name
        email
      }
    }
  }
`;
export const GET_GROUP_DETAILS = gql`
  query GetGroupDetails($id: ID!) {
    group(id: $id) {
      id
      name
      totalExpense
      createdBy {
        id
      }
      members {
        id
        name
      }
      expenses {
        id
        description
        amount
        payer {
          id
          name
        }
        createdBy {
          id
        }
        createdAt
      }
    }
  }
`;

export const GET_GROUP_BALANCE = gql`
  query GetGroupBalance($groupId: ID!) {
    getGroupBalance(groupId: $groupId) {
      user {
        id
        name
      }
      amount
      settlements {
        from {
          id
          name
        }
        to {
          id
          name
        }
        amount
      }
    }
  }
`;

import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Business: a
    .model({
      name: a.string().required(),
      nuis: a.string().required(),
      address: a.string().required(),
      bank: a.string(),
      email: a.email(),
      logo: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
  Client: a
    .model({
      name: a.string().required(),
      nuis: a.string(),
      address: a.string(),
      email: a.email(),
    })
    .authorization((allow) => [allow.owner()]),
  Invoice: a
    .model({
      number: a.string().required(),
      client: a.string().required(),
      date: a.date().required(),
      amount: a.float().required(),
      currency: a.enum(['EUR', 'ALL', 'USD']),
      snapshot: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});

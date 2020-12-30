### Auth0 integration
#### [Detail for hasura integration](https://hasura.io/docs/1.0/graphql/core/guides/integrations/auth0-jwt.html#guides-auth0-jwt)

### Hasura apply for production
```
hasura migrate apply --endpoint https://avepha-platform-prod.hasura.app --admin-secret raspberry

hasura metadata apply --endpoint https://avepha-platform-prod.hasura.app --admin-secret raspberry
```
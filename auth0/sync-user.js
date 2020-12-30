async function (user, context, callback) {
    async function requestExternalApi({ url, body }) {
        return new Promise((resolve, reject) => {
            request.post({
                headers: { 'content-type': 'application/json', 'x-hasura-admin-secret': configuration.HASURA_ADMIN_SECRET },
                url,
                body,
            }, (err, _response, body) => {
                console.log(body);
                if (err) reject(err)
                resolve(body)
            })
        })

    }

    const userId = user.user_id;
    const email = user.email;
    const name = user.name;
    const picture = user.picture;
    const url = "https://avepha-platform.hasura.app/v1/graphql";

    const syncUserRequest = {
        "query": `
            mutation($userId: String!, $email: String!){
                insert_users_one(
                    object: {
                        email: $email, 
                        id: $userId,
                    },
                    on_conflict: {constraint: user_pkey, update_columns: updated_at}
                )
                {
                    id
                    email
                }
            }
        `,
        "variables": { "userId": userId, "email": email }
    };

    const syncProfileRequest = {
        "query": `
            mutation insert_profile($userId: String!, $name:String!, $picture:String!) {
                insert_user_profiles_one(object:{user_id: $userId, name:$name, picture: $picture}, on_conflict:{constraint: user_profile_user_id_key update_columns:[]}) {
                    id
                }
            }
        `,
        "variables": { "userId": userId, "name": name, "picture": picture }
    };

    await requestExternalApi({ url, body: JSON.stringify(syncUserRequest) })
    await requestExternalApi({ url, body: JSON.stringify(syncProfileRequest) })
    callback(null, user, context)
}
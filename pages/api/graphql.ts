import { ApolloServer } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { NextApiHandler } from "next";
import { db } from "../../backend/db";

import { schema } from "../../backend/schema";

const apolloServer = new ApolloServer({
	schema,
	context: { db },

	plugins: [
		...(process.env.NODE_ENV === "development"
			? [ApolloServerPluginLandingPageGraphQLPlayground]
			: []),
	],
});

export const config = {
	api: {
		bodyParser: false,
	},
};

const serverStartPromise = apolloServer.start();
let graphqlHandler: NextApiHandler | undefined;

const handler: NextApiHandler = async (req, res) => {
	if (!graphqlHandler) {
		await serverStartPromise;
		graphqlHandler = apolloServer.createHandler({ path: "/api/graphql" });
	}

	return graphqlHandler(req, res);
};

export default handler;

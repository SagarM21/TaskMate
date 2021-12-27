import { ApolloServer, gql } from "apollo-server-micro";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { NextApiHandler } from "next";
import mysql from "serverless-mysql";
import { OkPacket } from "mysql";
import { Resolvers, TaskStatus } from "../../generated/graphql-backend";

const typeDefs = gql`
	enum TaskStatus {
		active
		completed
	}

	type Task {
		id: Int!
		title: String!
		status: TaskStatus!
	}

	input CreateTaskInput {
		title: String!
	}

	input UpdateTaskInput {
		id: Int!
		title: String
		status: TaskStatus
	}

	type Query {
		tasks(status: TaskStatus): [Task!]!
		task(id: Int!): Task
	}

	type Mutation {
		createTask(input: CreateTaskInput!): Task
		updateTask(input: UpdateTaskInput!): Task
		deleteTask(id: Int!): Task
	}
`;

interface ApolloContext {
	db: mysql.ServerlessMysql;
}

interface TaskDbRow {
	id: number;
	title: string;
	task_status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];

const resolvers: Resolvers<ApolloContext> = {
	Query: {
		async tasks(parent, args, context) {
			const { status } = args;
			let query = "SELECT id, title , task_status FROM tasks";
			const queryParams: string[] = [];
			if (status) {
				query += " WHERE task_status = ?";
				queryParams.push(status);
			}
			const tasks = await context.db.query<TasksDbQueryResult>(
				query,
				queryParams
			);
			await db.end();

			return tasks.map(({ id, title, task_status }) => ({
				id,
				title,
				status: task_status,
			}));
		},
		task(parent, args, context) {
			return null;
		},
	},
	Mutation: {
		async createTask(parent, args, context) {
			const result = await context.db.query<OkPacket>(
				"INSERT INTO tasks (title,task_status) VALUES(?,?)",
				[args.input.title, TaskStatus.Active]
			);
			return {
				id: result.insertId,
				title: args.input.title,
				status: TaskStatus.Active,
			};
		},
		updateTask(parent, args, context) {
			return null;
		},
		deleteTask(parent, args, context) {
			return null;
		},
	},
};

const db = mysql({
	config: {
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
		port: 3366,
	},
});

const apolloServer = new ApolloServer({
	typeDefs,
	resolvers,
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

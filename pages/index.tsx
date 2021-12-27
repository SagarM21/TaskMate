import { useQuery } from "@apollo/client";
import { gql } from "apollo-server-micro";
import Head from "next/head";
import Image from "next/image";
import { initializeApollo } from "../lib/client";
import styles from "../styles/Home.module.css";

const TasksQueryDocument = gql`
	query Tasks {
		tasks {
			id
			title
			status
		}
	}
`;

interface TasksQuery {
	tasks: { id: number; title: string; status: string }[];
}

export default function Home() {
	const result = useQuery<TasksQuery>(TasksQueryDocument);
	const tasks = result.data?.tasks;
	return (
		<div className={styles.container}>
			<Head>
				<title>Tasks</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			{tasks &&
				tasks.length > 0 &&
				tasks.map((task) => {
					return (
						<div key={task.id}>
							{task.title} ({task.status})
						</div>
					);
				})}
		</div>
	);
}

export const getStaticProps = async () => {
	const apolloClient = initializeApollo();

	await apolloClient.query<TasksQuery>({
		query: TasksQueryDocument,
	});

	return {
		props: {
			initialApolloState: apolloClient.cache.extract(),
		},
	};
};

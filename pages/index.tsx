import Head from "next/head";
import Image from "next/image";
import {
	TasksDocument,
	TasksQuery,
	useTasksQuery,
} from "../generated/graphql-frontend";
import { initializeApollo } from "../lib/client";
import styles from "../styles/Home.module.css";

export default function Home() {
	const result = useTasksQuery();
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
		query: TasksDocument,
	});

	return {
		props: {
			initialApolloState: apolloClient.cache.extract(),
		},
	};
};

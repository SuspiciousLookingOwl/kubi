export default (ms: number): [Promise<unknown>, () => void] => {
	let resolver: (v: unknown) => void;
	let timeout: NodeJS.Timeout;
	const promise = new Promise((resolve) => {
		resolver = resolve;
		timeout = setTimeout(resolve, ms);
		return timeout;
	});
	const cancel = () => {
		clearTimeout(timeout);
		resolver(0);
	};

	return [promise, cancel];
};

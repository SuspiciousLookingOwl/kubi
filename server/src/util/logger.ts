import { transports, createLogger, format } from "winston";

const debugFormatter = format.printf((info) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { message, level, ...data } = info;

	let log = info.message;
	if (Object.keys(data).length > 0) log += "\r\n" + JSON.stringify(data, null, 2);
	return log;
});

const logger = createLogger({
	transports: [
		new transports.File({ filename: "error.log", level: "error" }),
		new transports.Console({
			level: "silly",
			format: format.combine(debugFormatter),
		}),
	],
});

export default logger;

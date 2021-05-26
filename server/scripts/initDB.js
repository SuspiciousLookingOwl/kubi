const { createSchema } = require("../dist/database");

(async () => {
	await createSchema(true);
})();

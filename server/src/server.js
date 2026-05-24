import app from "./app.js";
import { ENV } from "./config/env.js";
import { startScheduler } from "./services/schedulerService.js";

app.listen(ENV.PORT, () => {
  console.log(`Server running on http://localhost:${ENV.PORT}`);
  startScheduler();
});

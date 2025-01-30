import App from "./app";
import IndexRouter from "./routes";
import AuthRouter from "./routes/auth.route";

const app = new App([new IndexRouter(), new AuthRouter()]);

app.listen();

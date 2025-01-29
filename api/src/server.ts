import App from "./app";
import IndexRouter from "./routes";

const app = new App([new IndexRouter()]);

app.listen();

import express from "express";
import ViteExpress from "vite-express";
import nunjucks from "nunjucks";

const app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(express.static('public'))

app.get("/", (req, res) => {
    res.render("example.html")
})

ViteExpress.listen(app, 5173, () => {
    console.log("Server is listening...")
    console.log("Launch http://localhost:5173/")
});
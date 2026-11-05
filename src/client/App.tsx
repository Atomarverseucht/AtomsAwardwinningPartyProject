import { Routes, Route} from "react-router-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";

export function App() {
    return (
        <>
            <section className="header">
                <h1>Atoms Party</h1>
            </section>

            <Routes>
                { <Route path="/" element={<HomePage />} /> }
            </Routes>
        </>
    );
}

createRoot(document.getElementById("app")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
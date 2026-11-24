import { Routes, Route} from "react-router-dom";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import HomePage from "./HomePage";
import Test3Fiber from "./test/Test3Fiber";

export function App() {
    return (
        <>
            <section className="header">
                <h1>Atoms Party</h1>
            </section>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/test" element={<Test3Fiber />}/>
            </Routes>
        </>
    );
}

createRoot(document.getElementById("app")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MssvProvider } from "./contexts/MssvContext";
import HomePage from "./pages/HomePage";
import EventDetailPage from "./pages/EventDetailPage";
import MainLayout from "./layouts/MainLayout";
import "./App.css";

function App() {
  return (
    <MssvProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="event/:eventId" element={<EventDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </MssvProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
// import ResultsDashboard from "./ResultsDashboard"; // Uncomment when ready
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/results" element={<ResultsDashboard />} /> */}
      </Routes>
    </Router>
  );
}
 
export default App;
 
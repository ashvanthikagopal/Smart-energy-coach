import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Predictions from "./pages/Predictions";
import Recommendations from "./pages/Recommendations";

import Navbar from "./components/Navbar";


function App() {

    const path =
        window.location.pathname;


    let page;


    if (path === "/analytics") {

        page = <Analytics />;

    } else if (path === "/predictions") {

        page = <Predictions />;

    } else if (path === "/recommendations") {

        page = <Recommendations />;

    } else {

        page = <Dashboard />;

    }


    return (
        <>
            <Navbar />

            {page}
        </>
    );

}


export default App;
function Navbar() {

    const currentPath =
        window.location.pathname;


    const navigate = (path) => {
        window.location.href = path;
    };


    return (
        <nav className="navbar">

            <div
                className="navbar-brand"
                onClick={() =>
                    navigate("/")
                }
            >
                <div className="navbar-logo">
                    ⚡
                </div>

                <div>
                    <h2>
                        Smart Energy Coach
                    </h2>

                    <span>
                        Smart Home Energy
                    </span>
                </div>
            </div>


            <div className="navbar-links">

                <button
                    className={
                        currentPath === "/"
                            ? "nav-link active"
                            : "nav-link"
                    }
                    onClick={() =>
                        navigate("/")
                    }
                >
                    <span>
                        📊
                    </span>

                    Dashboard
                </button>


                <button
                    className={
                        currentPath === "/analytics"
                            ? "nav-link active"
                            : "nav-link"
                    }
                    onClick={() =>
                        navigate("/analytics")
                    }
                >
                    <span>
                        📈
                    </span>

                    Analytics
                </button>


                <button
                    className={
                        currentPath === "/predictions"
                            ? "nav-link active"
                            : "nav-link"
                    }
                    onClick={() =>
                        navigate("/predictions")
                    }
                >
                    <span>
                        🔮
                    </span>

                    Predictions
                </button>


                <button
                    className={
                        currentPath === "/recommendations"
                            ? "nav-link active"
                            : "nav-link"
                    }
                    onClick={() =>
                        navigate("/recommendations")
                    }
                >
                    <span>
                        💡
                    </span>

                    Recommendations
                </button>

            </div>

        </nav>
    );
}


export default Navbar;
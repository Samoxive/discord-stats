const environment =
    process.env.NODE_ENV === "production"
        ? {
              apiUrl: window.location.href + "api",
          }
        : {
              apiUrl: "http://localhost:8080",
          };

export default environment;

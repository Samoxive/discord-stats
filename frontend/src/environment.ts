const environment =
    process.env.NODE_ENV === "production"
        ? {
              apiUrl: "http://localhost/api",
          }
        : {
              apiUrl: "http://localhost:8080",
          };

export default environment;

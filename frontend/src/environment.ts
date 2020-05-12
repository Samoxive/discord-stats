const environment = process.env.NODE_ENV === "production" ? {
    apiUrl: "http://localhost:8080"
} : {
    apiUrl: "http://localhost/api"
};

export default environment;
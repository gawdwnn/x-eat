module.exports = {
  client: {
    includes: ["./src/**/*.tsx"],
    tagName: "gql",
    service: {
      name: "eats-backend",
      url: "http://localhost:3000/graphql",
    },
  },
};
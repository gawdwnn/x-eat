describe("Log In", () => {
  const user = cy;
  it("should see login page", () => {
    user.visit("/").title().should("eq", "Login | Eats");
  });

  it("can see email / password validation errors", () => {
    user.visit("/");
    user.findByPlaceholderText(/email/i).type("until@gmail");
    user.findByRole("alert").should("have.text", "Please enter a valid email");
    user.findByPlaceholderText(/email/i).clear();
    user.findByRole("alert").should("have.text", "Email is required");
    user.findByPlaceholderText(/email/i).type("until@gmail.com");
    user
      .findByPlaceholderText(/password/i)
      .type("a")
      .clear();
    user.findByRole("alert").should("have.text", "Password is required");
  });

  it("can fill out the form and log in", () => {
    user.visit("/");
    user.findByPlaceholderText(/email/i).type("until@gmail.com");
    user.findByPlaceholderText(/password/i).type("121212");
    user.findByRole("button").should("not.have.class", "pointer-events-none").click();
    user.window().its("localStorage.eats-token").should("be.a", "string");
  });
});

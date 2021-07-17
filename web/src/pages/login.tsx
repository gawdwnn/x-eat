import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import Helmet from "react-helmet";
import { FormError } from "../components/form-error";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import { LoginMutation, LoginMutationVariables } from "../__generated__/LoginMutation";
import nuberLogo from "../images/logo.svg";
import { EmailPattern, LOCALSTORAGE_TOKEN } from "../utils/constants";
import { authTokenVar, isLoggedInVar } from "../apollo";

const LOGIN_MUTATION = gql`
  mutation LoginMutation($loginInput: LoginInput!) {
    login(input: $loginInput) {
      ok
      token
      error
    }
  }
`;

interface ILoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { register, formState, getValues, handleSubmit } = useForm<ILoginForm>({
    mode: "onChange",
  });
  const { errors, isValid } = formState;

  const onCompleted = (data: LoginMutation) => {
    const {
      login: { ok, token },
    } = data;
    if (ok && token) {
      localStorage.setItem(LOCALSTORAGE_TOKEN, token);
      authTokenVar(token);
      isLoggedInVar(true);
    }
  };

  const [loginMutation, { data: loginMutationResult, loading }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN_MUTATION, {
    onCompleted,
  });

  const onSubmit = () => {
    if (!loading) {
      const { email, password } = getValues();
      loginMutation({
        variables: {
          loginInput: {
            email,
            password,
          },
        },
      });
    }
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Login | Eats</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <img src={nuberLogo} alt="title" className="w-52 mb-10" />
        <h4 className="w-full font-medium text-left text-3xl mb-5">Welcome back</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 mt-5 w-full mb-5">
          <input
            {...register("email", {
              required: "Email is required",
              pattern: EmailPattern,
            })}
            placeholder="Email"
            required
            className="input mb-3 w-full"
          />
          {errors.email?.message && <FormError errorMessage={errors.email?.message} />}
          {errors.email?.type === "pattern" && (
            <FormError errorMessage={"Please enter a valid email"} />
          )}
          <input
            {...register("password", { required: "Password is required", minLength: 5 })}
            placeholder="Password"
            required
            className="input"
          />
          {errors.password?.message && (
            <FormError errorMessage={errors.password?.message} />
          )}
          {errors.password?.type === "minLength" && (
            <FormError errorMessage="Password must be more than 5 chars." />
          )}
          <Button canClick={isValid} loading={loading} actionText={"Log in"} />
          {loginMutationResult?.login.error && (
            <FormError errorMessage={loginMutationResult.login.error} />
          )}
        </form>
        <div>
          New to Nuber?{" "}
          <Link to="/create-account" className="text-lime-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

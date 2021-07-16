import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { FormError } from "../components/form-error";
import { LoginMutation, LoginMutationVariables } from "../__generated__/LoginMutation";

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
  const { register, formState, getValues, handleSubmit } = useForm<ILoginForm>();
  const { errors } = formState;

  const onCompleted = (data: LoginMutation) => {
    const {
      login: { ok, token },
    } = data;
    if (ok) {
      console.log(token);
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
    <div className="h-screen flex items-center justify-center bg-gray-800">
      <div className="bg-white w-full max-w-lg pt-10 pb-7 rounded-lg text-center">
        <h3 className="text-2xl text-gray-800">Log In</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 mt-5 px-5">
          <input
            {...register("email", { required: "Email is required" })}
            placeholder="Email"
            required
            className="input mb-3"
          />
          {errors.email?.message && <FormError errorMessage={errors.email?.message} />}
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
          <button disabled={loading} className="mt-3 btn">{loading ? "Loading..." : "Log In"}</button>
          {loginMutationResult?.login.error && (
            <FormError errorMessage={loginMutationResult.login.error} />
          )}
        </form>
      </div>
    </div>
  );
};

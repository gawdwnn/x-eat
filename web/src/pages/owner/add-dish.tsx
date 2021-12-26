import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useHistory, useParams } from "react-router-dom";
import { Button } from "../../components/button";
import { createDish, createDishVariables } from "../../__generated__/createDish";
import { MY_RESTAURANT_QUERY } from "./my-restaurant";

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input) {
      ok
      error
    }
  }
`;

interface IParams {
  restaurantId: string;
}

interface IForm {
  name: string;
  price: string;
  description: string;
  [key: string]: string;
}

export const AddDish = () => {
  const { restaurantId } = useParams<IParams>();
  const history = useHistory();
  const [createDishMutation, { loading }] = useMutation<createDish, createDishVariables>(
    CREATE_DISH_MUTATION,
    {
      refetchQueries: [
        {
          query: MY_RESTAURANT_QUERY,
          variables: {
            input: {
              id: +restaurantId,
            },
          },
        },
      ],
    }
  );
  const { register, handleSubmit, formState, getValues, setValue } = useForm<IForm>({
    mode: "onChange",
  });

  const [optionsNumber, setOptionsNumber] = useState<number[]>([]);
  const onAddOptionClick = () => setOptionsNumber((current) => [Date.now(), ...current]);
  const onDeleteClick = (idToDelete: number) => {
    setOptionsNumber((current) => current.filter((id) => id !== idToDelete));
    setValue(`${idToDelete}-optionName`, "");
    setValue(`${idToDelete}-optionExtra`, "");
  };

  const onSubmit = () => {
    const { name, price, description, ...rest } = getValues();
    // console.log({ rest });
    const optionObjects = optionsNumber.map((id) => ({
      name: rest[`${id}-optionName`],
      extra: +rest[`${id}-optionExtra`],
    }));
    console.log(optionObjects);
    createDishMutation({
      variables: {
        input: {
          name,
          price: +price,
          description,
          restaurantId: +restaurantId,
          options: optionObjects,
        },
      },
    });
    history.goBack();
  };

  return (
    <div className="container flex flex-col items-center mt-28">
      <Helmet>
        <title>Add Dish | Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Dish</h4>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
      >
        <input
          className="input"
          type="text"
          placeholder="Name"
          {...register("name", { required: "Name is required." })}
        />
        <input
          className="input"
          type="number"
          min={0}
          placeholder="Price"
          {...register("price", { required: "Price is required." })}
        />
        <input
          className="input"
          type="text"
          placeholder="Description"
          {...register("description", { required: "Description is required." })}
        />
        <div className="my-10">
          <h4 className="font-medium  mb-3 text-lg">Dish Options</h4>
          <span
            onClick={onAddOptionClick}
            className="cursor-pointer text-white bg-gray-900 py-1 px-2 mt-5"
          >
            Add Dish Option
          </span>
          {optionsNumber.length !== 0 &&
            optionsNumber.map((id) => (
              <div key={id} className="mt-5">
                <input
                  {...register(`${id}-optionName`)}
                  className="py-2 px-3 focus:outline-none mr-3 focus:border-gray-600 border-2"
                  type="text"
                  placeholder="Option Name"
                />
                <input
                  {...register(`${id}-optionExtra`)}
                  className="py-2 px-3 focus:outline-none focus:border-gray-600 border-2"
                  type="number"
                  min={0}
                  placeholder="Option Extra"
                />
                <span
                  className="cursor-pointer text-white bg-red-500 ml-3 py-3 px-4 mt-5"
                  onClick={() => onDeleteClick(id)}
                >
                  Delete Option
                </span>
              </div>
            ))}
        </div>
        <Button loading={loading} canClick={formState.isValid} actionText="Create Dish" />
      </form>
    </div>
  );
};

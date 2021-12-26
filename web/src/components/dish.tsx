import React from "react";
import { myRestaurant_myRestaurant_restaurant_menu_options } from "../__generated__/myRestaurant";

interface IDishProps {
  id?: number;
  description: string;
  name: string;
  price: number;
  isCustomer?: boolean;
  isSelected?: boolean;
  orderStarted?: boolean;
  options?: myRestaurant_myRestaurant_restaurant_menu_options[] | null;
  addItemToOrder?: (dishId: number) => void;
  removeFromOrder?: (dishId: number) => void;
  addOptionToItem?: (dishId: number, option: any) => void;
}

export const Dish: React.FC<IDishProps> = ({
  id = 0,
  description,
  name,
  price,
  isCustomer = false,
  orderStarted = false,
  options,
  addItemToOrder,
  isSelected,
  removeFromOrder,
  addOptionToItem,
  children: dishOptions,
}) => {
  const onClick = () => {
    if (orderStarted) {
      if (!isSelected && addItemToOrder) {
        return addItemToOrder(id);
      }
      if (isSelected && removeFromOrder) {
        return removeFromOrder(id);
      }
    }
  };
  return (
    <div
      className={` px-8 py-4 border cursor-pointer  transition-all ${
        isSelected ? "border-gray-800" : " hover:border-gray-800"
      }`}
    >
      <div className="mb-5">
        <h3 className="text-lg font-medium flex items-center">
          {name}{" "}
          {orderStarted && (
            <button
              className={`ml-3 py-1 px-3 focus:outline-none text-sm  text-white ${
                isSelected ? "bg-red-500" : " bg-lime-600"
              }`}
              onClick={onClick}
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          )}
        </h3>
        <h4 className="font-medium">{description}</h4>
      </div>
      <span>${price}</span>
      {isCustomer && options && options?.length !== 0 && (
        <div>
          <h5 className="mt-4 mb-2 font-medium">Dish Options:</h5>
          <div className="grid gap-2 justify-start">{dishOptions}</div>
        </div>
      )}
    </div>
  );
};

import { gql, useQuery } from "@apollo/client";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { Dish } from "../../components/dish";
import { DISH_FRAGMENT, ORDERS_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";
import { myRestaurant, myRestaurantVariables } from "../../__generated__/myRestaurant";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";

export const MY_RESTAURANT_QUERY = gql`
  query myRestaurant($input: MyRestaurantInput!) {
    myRestaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
        orders {
          ...OrderParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
  ${ORDERS_FRAGMENT}
`;

interface IParams {
  id: string;
}

export const MyRestaurant = () => {
  const { id } = useParams<IParams>();
  const { data } = useQuery<myRestaurant, myRestaurantVariables>(MY_RESTAURANT_QUERY, {
    variables: {
      input: {
        id: +id,
      },
    },
  });

  return (
    <div>
      <Helmet>
        <title>{data?.myRestaurant.restaurant?.name || "Loading..."} | Eats</title>
      </Helmet>
      <div
        className="  bg-gray-700  py-28 bg-center bg-cover"
        style={{
          backgroundImage: `url(${data?.myRestaurant.restaurant?.coverImg})`,
        }}
      />
      <div className="container p-10">
        <h2 className="text-4xl font-medium mb-10">
          {data?.myRestaurant.restaurant?.name || "Loading..."}
        </h2>
        <Link
          to={`/restaurants/${id}/add-dish`}
          className=" mr-8 text-white bg-gray-800 py-3 px-10"
        >
          Add Dish &rarr;
        </Link>
        <Link to={``} className=" text-white bg-lime-700 py-3 px-10">
          Buy Promotion &rarr;
        </Link>
        <div className="mt-10">
          {data?.myRestaurant.restaurant?.menu.length === 0 ? (
            <h4 className="text-xl mb-5">Please upload a dish!</h4>
          ) : (
            <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
              {data?.myRestaurant.restaurant?.menu.map((dish) => (
                <Dish
                  name={dish.name}
                  description={dish.description}
                  price={dish.price}
                />
              ))}
            </div>
          )}
        </div>
        {data?.myRestaurant.restaurant?.orders.length ? (
          <div className="mt-20 mb-10">
            <h4 className="text-center text-2xl font-medium">Sales</h4>
            <div className="mt-10">
              <VictoryChart
                height={500}
                theme={VictoryTheme.material}
                width={window.innerWidth}
                domainPadding={50}
                containerComponent={<VictoryVoronoiContainer />}
              >
                <VictoryLine
                  labels={({ datum }) => `$${datum.y}`}
                  labelComponent={
                    <VictoryTooltip
                      style={{ fontSize: 18 } as any}
                      renderInPortal
                      dy={-20}
                    />
                  }
                  data={data?.myRestaurant.restaurant?.orders.map((order) => {
                    return {
                      x: order.createdAt,
                      y: order.total,
                    };
                  })}
                  interpolation="natural"
                  style={{
                    data: {
                      strokeWidth: 5,
                    },
                  }}
                />
                {/* <VictoryAxis
                style={{
                  tickLabels: {
                    fontSize: 18,
                    fill: "#4D7C0F",
                  } as any,
                }}
                dependentAxis
                tickFormat={(tick) => `$${tick}`}
              /> */}
                <VictoryAxis
                  tickLabelComponent={<VictoryLabel renderInPortal />}
                  style={{
                    tickLabels: {
                      fontSize: 20,
                    } as any,
                  }}
                  tickFormat={(tick) => new Date(tick).toLocaleDateString("en-US")}
                />
              </VictoryChart>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** @format */

import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";
import Loader from "../layout/Loader";

import { useAlert } from "react-alert";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createOrder, clearErrors } from "../../actions/orderActions";

import axios from "axios";

const options = {
  style: {
    base: {
      fontSize: "16px",
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const MomoPay = ({ history }) => {
  const alert = useAlert();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { error } = useSelector((state) => state.newOrder);

  useEffect(() => {
    if (error) {
      alert.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, alert, error]);

  const order = {
    orderItems: cartItems,
    shippingInfo,
  };

  const orderInfo = JSON.parse(sessionStorage.getItem("orderInfo"));
  if (orderInfo) {
    order.itemsPrice = orderInfo.itemsPrice;
    order.shippingPrice = orderInfo.shippingPrice;
    order.taxPrice = orderInfo.taxPrice;
    order.totalPrice = orderInfo.totalPrice;
  }
  const transactionId = uuid();

  const submitHandler = async (e) => {
    e.preventDefault();
    document.querySelector("#pay_btn").disabled = true;

    let res;
    try {
      //MAKE MTN PAYMENT
      setLoading(true);

      //requesting payment
      const paymentData = {
        amount: order.itemsPrice,
        //TODO : change currency when live
        currency: "EUR",
        externalId: transactionId,
        payer: {
          partyIdType: "MSISDN",
          partyId: user.phone,
        },
        payerMessage: `thanks for paying for the package. Transaction Id : ${transactionId} at ${new Date()}`,
        payeeNote: `payment recieved from ${
          user.name
        } with Transaction Id : ${transactionId} at ${new Date()}`,
      };

      let result = await axios({
        method: "POST",
        url: "/api/v1/payment/payWithMomo",
        data: paymentData,
        headers: {
          "Content-Type": "application/json",
        },
      });
      result = result.data;

      setLoading(false);

      // The payment is processed or not

      // result.status === "SUCCESS";
      // the below is line of code is tempral replace it with the above one when live
      if (result.status === "SUCCESSFUL") {
        // console.log("payment status is successful");
        order.paymentInfo = {
          id: result.id,
          status: "succeeded",
        };

        dispatch(createOrder(order));
        console.log("end of isPaid");
        history.push("/success");
      } else {
        alert.error(`payment status: ${result.status}`);
        document.querySelector("#pay_btn").disabled = false;
      }
    } catch (error) {
      setLoading(false);
      document.querySelector("#pay_btn").disabled = false;
      console.log(error);
      alert.error("momo payment failed");
    }
  };

  return (
    <Fragment>
      <MetaData title={"Payment"} />

      <CheckoutSteps shipping confirmOrder payment />

      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form className="shadow-lg" onSubmit={submitHandler}>
            <h3 className="mb-2 text-warning">Pay with momo</h3>
            <div className="form-group">
              <p class="card-body">
                <span>"Pay" and approve transaction , please</span> <br></br>
              </p>
            </div>

            {loading ? (
              <div className="form-group text-dark">
                <span className="text-lead h-3">
                  A prompt have been sent to you phone , enter your momo pin to
                  confirm the payment
                </span>
              </div>
            ) : null}

            <button id="pay_btn" type="submit" className="btn btn-block py-3">
              Pay {` - ${orderInfo && orderInfo.totalPrice}`}
            </button>
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default MomoPay;


const express = require('express')
const { model } = require('mongoose')
const app = express()
const port = 7000

app.get('/paid', (req, res) => {
  res.send('payment success')
})

const momo = require("mtn-momo");

const { Collections } = momo.create({
  callbackHost: "http://localhost:3000"
});

const collections = Collections({
  userSecret: "3fab317814f5413ab60e9a6ae5d2d52a",
  userId: "09cbffff-c4c9-44b7-be53-052cf0dbd632",
  primaryKey: "71c3dddaad4d43aeba8d8e32e7ee45fa"
});



const paymentData = {
    amount: "80",
    currency: "EUR",
    externalId: "123456",
    payer: {
      partyIdType: "MSISDN",
      partyId: "256774290781"
    },
    payerMessage: "testing",
    payeeNote: "hello"
  }

const requestToPay = async function (paymentData) {
    try {
        console.log("requestToPay running")
        const transactionId = await collections.requestToPay(paymentData)
        // console.log("transaction_id: " + transactionId)
        const transaction = (await collections.getTransaction(transactionId))
        // console.log(transaction);
        if (transaction.status === "SUCCESSFUL") {
            return transaction.status
        }
    } catch (error) {
        console.log("could not make payment: " + error)
        return "FAILED"
    }
}

//requestToPay(paymentData).then(res => console.log(res));

const isPaid = async (transactionId) => {
    console.log("isPaid is running")
  try {
     const transaction_status =  (await collections.getTransaction(transactionId)).status;
    //  console.log(transaction_status);
    if (transaction_status === "SUCCESSFUL"){
      return true;
    }
} catch (error) {
    console.log("could not make payment: " +error)
    return false;
}
}
//isPaid("461354da-377b-4922-adc1-fbcbcef21598").then( (respond)=>{ console.log(respond)});

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })


const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, address, stripeToken, paymentType } = req.body

            if(!phone || !address) {
                return res.status(422).json({ message : 'All fields are required' });
            }

            //to store new order
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                //ye hume customer id ke jagah poora customer details daalke dedga
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    // req.flash('success', 'Order placed successfully')

                    // Stripe payment
                    if(paymentType === 'card') {
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice  * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true
                            placedOrder.paymentType = paymentType
                            placedOrder.save().then((ord) => {
                                //ord me order hai jo save ua hai abhi

                                // Emit
                                //to get the orders on admin page without refreshing --
                                const eventEmitter = req.app.get('eventEmitter')
                                //wo saved order hum pass krdenge yha pe
                                //ab isko server pe listen krenge 
                                eventEmitter.emit('orderPlaced', ord)

                                //cart khali krne ke liye
                                delete req.session.cart
                                return res.json({ message : 'Payment successful, Order placed successfully' });
                            }).catch((err) => {
                                console.log(err)
                            })

                        }).catch((err) => {
                            delete req.session.cart
                            return res.json({ message : 'OrderPlaced but payment failed, You can pay at delivery time' });
                        })
                    } else {
                        delete req.session.cart
                        return res.json({ message : 'Order placed succesfully' });
                    }
                })
            }).catch(err => {
                return res.status(500).json({ message : 'Something went wrong' });
            })
        },





        async index(req, res) {


            //mtlb ki hume customer ke order chahoiye to orders me humne user ki id bhi store ki
            // thi konsa user order krra hai
            //to yha pe hum find krre hai ki konse oders ki id user logged in user ki id se match krri hai

            const orders = await Order.find({ customerId: req.user._id },
                null,
                //this is to show orders in descending order
                { sort: { 'createdAt': -1 } } )

                //this means ki hume koi cache ni chahiye ek baar orders aane ke baad..
                //hum order place krene ke baad jb back krre the, fir firse foreward button krre the tb hr baar
                //ordeer placed successfully aara tha...pr ab isme cacche ni chahiye hume to mtlb ab wo back button ke baad
                //foreward button dbaane pe ni dikega
            res.header('Cache-Control', 'no-store')

            //hume ye page show kre hai aur orders paas krre hai
            res.render('customers/orders', { orders: orders, moment: moment })
        },



        async show(req, res) {
            //web.js me bhi id ke naam se route dia hai to yha pe bhi\
            //same ese hi params.id lia hai
            const order = await Order.findById(req.params.id)

            // Authorize user
            //jo bhi customer/order/id likha url me aur kisi aur ki orderid k=likhi to 
            //wo uska bhi tracking page dikhaeyga...hume chahiye ki bs ek hi user jo logged
            //in hai usi ki traking dikhe

            //hr order me customerid bhi di hui hai to usko lHS ME loggd in
            //user se compare krdia
            if(req.user._id.toString() === order.customerId.toString()) {
                //single order me orders paas krdia maine
                return res.render('customers/singleOrder', { order })
            }
            //same user logged in ni hai
            return  res.redirect('/')
        }
    }
}

module.exports = orderController




// const Order = require('../../../models/order')
// const moment = require('moment')
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// function orderController () {
//     return {
//         store(req, res) {
//             // Validate request
//             const { phone, address, stripeToken, paymentType } = req.body
//             if(!phone || !address) {
//                 return res.status(422).json({ message : 'All fields are required' });
//             }

//             const order = new Order({
//                 customerId: req.user._id,
//                 items: req.session.cart.items,
//                 phone,
//                 address
//             })
//             order.save().then(result => {
//                 Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
//                     // req.flash('success', 'Order placed successfully')

//                     // Stripe payment
//                     if(paymentType === 'card') {
//                         stripe.charges.create({
//                             amount: req.session.cart.totalPrice  * 100,
//                             source: stripeToken,
//                             currency: 'inr',
//                             description: `Pizza order: ${placedOrder._id}`
//                         }).then(() => {
//                             placedOrder.paymentStatus = true
//                             placedOrder.paymentType = paymentType
//                             placedOrder.save().then((ord) => {
//                                 // Emit
//                                 const eventEmitter = req.app.get('eventEmitter')
//                                 eventEmitter.emit('orderPlaced', ord)
//                                 delete req.session.cart
//                                 return res.json({ message : 'Payment successful, Order placed successfully' });
//                             }).catch((err) => {
//                                 console.log(err)
//                             })

//                         }).catch((err) => {
//                             delete req.session.cart
//                             return res.json({ message : 'OrderPlaced but payment failed, You can pay at delivery time' });
//                         })
//                     } else {
//                         delete req.session.cart
//                         return res.json({ message : 'Order placed succesfully' });
//                     }
//                 })
//             }).catch(err => {
//                 return res.status(500).json({ message : 'Something went wrong' });
//             })
//         },
//         async index(req, res) {
//             const orders = await Order.find({ customerId: req.user._id },
//                 null,
//                 { sort: { 'createdAt': -1 } } )
//             res.header('Cache-Control', 'no-store')
//             res.render('customers/orders', { orders: orders, moment: moment })
//         },
//         async show(req, res) {
//             const order = await Order.findById(req.params.id)
//             // Authorize user
//             if(req.user._id.toString() === order.customerId.toString()) {
//                 return res.render('customers/singleOrder', { order })
//             }
//             return  res.redirect('/')
//         }
//     }
// }

// module.exports = orderController
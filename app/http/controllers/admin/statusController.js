// const Order = require('../../../models/order')

// function statusController() {
//     return {
//         update(req, res) {
//             //jis order ki id match hogi uska status hum badal rhe hai 
//             //ye humarra resource me app.js ki file me jo status select kia wo 
//             //change krdia humne

//             //hum admin js se order paa kra tha...usme name attribute me bhumne
//             //status aur oorderid paas ki hai 
//             //to ab database ke andr ki id  check krega ki match krri hai order se
//             //ya nahi

//             //app.js me jo name me orderId di hai to yha pe same naam hona chaiye

//             Order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data)=> {
//                 if(err) {
//                     return res.redirect('/admin/orders')
//                 }
//                 // Emit event 
//                 //jese hi order u[date hojata hai hume message bhejna hai socket pe
//                 // ki order  status update hohaya  hai
//                 //evenetemitter ko bind kia hai app me to req.app.get krke mil jayega
//                 const eventEmitter = req.app.get('eventEmitter')

//                 //ab orderupdated event ko emit krre hai aur data bhi paas kia hai kuch isme
// // after emitting we can listen it anywhere in our app

//                 eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
//                 return res.redirect('/admin/orders')
//             })
//         }
//     }
// }

// module.exports = statusController



const Order = require('../../../models/order')

function statusController() {
    return {
        update(req, res) {
            Order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data)=> {
                if(err) {
                    return res.redirect('/admin/orders')
                }
                // Emit event 
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status })
                return res.redirect('/admin/orders')
            })
        }
    }
}

module.exports = statusController

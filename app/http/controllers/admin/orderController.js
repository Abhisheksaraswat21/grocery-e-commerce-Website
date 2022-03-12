const order = require("../../../models/order")

const Order = require('../../../models/order')

function orderController() {
    return {
        index(req, res) {
            //$ne mtlb not equal to completed jin
            // orders ka staus hai bs wahi chahiye hume..completed hume ni c=dikhaane admin section me

           order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }})
           
           //hr order me id hai customer ki...uspe populate lgaane se users me jaake data milega us customer ka...pr
           //data me password bhi hai or wo hume ni chahiye to -password aur exec mtlb execute krdo..execute me err aur result miltah
           //hai...orders me order aajayenge
           .populate('customerId', '-password').exec((err, orders) => {

            //ye ajax call ke liye hia..usme hume json data pass krna hpta hai...resources ki js ke admin me likhi hai ajax call
               if(req.xhr) {
                   return res.json(orders)
               } else {

                //baaki agr admin direct url se jaaye to bhi ja skta hai...ajax call me bhi humne same url use kia hai
                return res.render('admin/orders')
               }
           })
        }
    }
}

module.exports = orderController;










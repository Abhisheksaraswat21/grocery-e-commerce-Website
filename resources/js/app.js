 import axios from 'axios'
 import Noty from 'noty'
 import { initAdmin } from './admin'
 import moment from 'moment'
 import { initStripe } from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'Item added to cart',
            progressBar: false,
        }).show();
    }).catch(err => {
        new Noty({
            type: 'error',
            timeout: 1000,
            text: 'Something went wrong',
            progressBar: false,
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}



// Change order status
let statuses = document.querySelectorAll('.status_line')
//hiddeninput me order are hai singleorder.ejs se

let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null

//humne order singleprderpage se lia and and ab usko wapas object me change krenge yha pe
order = JSON.parse(order)

//ye hum small tag create krre hai isme---
let time = document.createElement('small')


//we are receiving orders from the singleorder page here ---

function updateStatus(order) {

    //step completed class has grey coolor and current has the orange colour --

    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        //status ke ander humne data-status likha hai...ab data-status mtlb ki data ko humne varoable status dia hai
        //it can bee received by dataset.name of the variable

        //issme mongodb waali values store ki hai humne singleorder page pe
       let dataProp = status.dataset.status

       //step complete hone pr class add ki hai grey color krne waali, aur agr humaradataprop ki value database ke orderstatus se mili
       //us case me next element ko orange class add krenge
       if(stepCompleted) {
            status.classList.add('step-completed')
       }
       if(dataProp === order.status) {
            stepCompleted = false

            //mongodb me database me updatedat pe humpe time hai

            time.innerText = moment(order.updatedAt).format('hh:mm A')
            //append child mtlb ki time variable me small tag lag jayega ab
            status.appendChild(time)
            //nextsibling means ki next item lelega ye
           if(status.nextElementSibling) {
            status.nextElementSibling.classList.add('current')
           }
       }
    })

}

updateStatus(order);

initStripe()

// Socket

//layout.ejs se hum client side pe ye library share krreh hai
let socket = io()

// Join
if(order) {
    //layout.ejs run hote hi ye emit hoga join wala
    //yha order ,ilte hi join nam ka event krre hai hum paas server.je me aur orderid bhej rhe hai
    socket.emit('join', `order_${order._id}`)
}


//we want to check if qwe are logged in as admin or not
//this will give url
let adminAreaPath = window.location.pathname


//this checks if url is having admin in it or not
if(adminAreaPath.includes('admin')) {
    initAdmin(socket)
    //yha unique room ni bna rhe bs ek hi room bna rhe hai  admin room
    //server.js me join ka logic dia hua hai humne to ese hia admin ke liye ek room create hojayega
    socket.emit('join', 'adminRoom')
}


//ye client ko realtime lagega...uska single order ke page pe realtime notification aaygi ki order update hogya hai
//ye realtime hoga page refresh ni hoga
socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status

    //update status changes colour and all
    //uske andar humne updated order pass kia haii

        updateStatus(updatedOrder)
    new Noty({
        type: 'success',
        timeout: 1000,
        text: 'Order updated',
        progressBar: false,
    }).show();
})





// import axios from 'axios'
// import Noty from 'noty'
// import { initAdmin } from './admin'
// import moment from 'moment'
// import { initStripe } from './stripe'

// let addToCart = document.querySelectorAll('.add-to-cart')
// let cartCounter = document.querySelector('#cartCounter')

// function updateCart(pizza) {
//    axios.post('/update-cart', pizza).then(res => {
//        cartCounter.innerText = res.data.totalQty
//        new Noty({
//            type: 'success',
//            timeout: 1000,
//            text: 'Item added to cart',
//            progressBar: false,
//        }).show();
//    }).catch(err => {
//        new Noty({
//            type: 'error',
//            timeout: 1000,
//            text: 'Something went wrong',
//            progressBar: false,
//        }).show();
//    })
// }

// addToCart.forEach((btn) => {
//    btn.addEventListener('click', (e) => {
//        let pizza = JSON.parse(btn.dataset.pizza)
//        updateCart(pizza)
//    })
// })

// // Remove alert message after X seconds
// const alertMsg = document.querySelector('#success-alert')
// if(alertMsg) {
//    setTimeout(() => {
//        alertMsg.remove()
//    }, 2000)
// }



// // Change order status
// let statuses = document.querySelectorAll('.status_line')
// let hiddenInput = document.querySelector('#hiddenInput')
// let order = hiddenInput ? hiddenInput.value : null
// order = JSON.parse(order)
// let time = document.createElement('small')

// function updateStatus(order) {
//    statuses.forEach((status) => {
//        status.classList.remove('step-completed')
//        status.classList.remove('current')
//    })
//    let stepCompleted = true;
//    statuses.forEach((status) => {
//       let dataProp = status.dataset.status
//       if(stepCompleted) {
//            status.classList.add('step-completed')
//       }
//       if(dataProp === order.status) {
//            stepCompleted = false
//            time.innerText = moment(order.updatedAt).format('hh:mm A')
//            status.appendChild(time)
//           if(status.nextElementSibling) {
//            status.nextElementSibling.classList.add('current')
//           }
//       }
//    })

// }

// updateStatus(order);

// initStripe()

// // Socket
// let socket = io()

// // Join
// if(order) {
//    socket.emit('join', `order_${order._id}`)
// }
// let adminAreaPath = window.location.pathname
// if(adminAreaPath.includes('admin')) {
//    initAdmin(socket)
//    socket.emit('join', 'adminRoom')
// }


// socket.on('orderUpdated', (data) => {
//    const updatedOrder = { ...order }
//    updatedOrder.updatedAt = moment().format()
//    updatedOrder.status = data.status
//    updateStatus(updatedOrder)
//    new Noty({
//        type: 'success',
//        timeout: 1000,
//        text: 'Order updated',
//        progressBar: false,
//    }).show();
// })


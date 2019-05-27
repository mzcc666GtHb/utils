import {timeChunk, throttle, debounce} from "./util";


const count = () => {
    console.log(123)
}

window.onresize = throttle(() => {
    console.log(12312);
})


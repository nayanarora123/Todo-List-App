let today = new Date();
    
let option = { weekday: 'long', day: 'numeric', month: 'long' }

function currentDate(){
 return today.toLocaleDateString('en-US', option)
}

export default currentDate;
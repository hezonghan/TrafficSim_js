
// https://blog.csdn.net/dszgf5717/article/details/97394371
function sample(arr , final_length) {
    var shuffled_arr = arr.slice(0);
    for(var i=0 ; i < final_length ; i += 1) {
        var j = i + Math.floor((arr.length - i) * Math.random());  // i == j allowed
        
        var tmp = shuffled_arr[i];
        shuffled_arr[i] = shuffled_arr[j];
        shuffled_arr[j] = tmp;
        console.log('i='+i+' , j='+j+' , shuffled_arr='+shuffled_arr);
    }
    return shuffled_arr.slice(0, final_length);
}

export { sample };

// console.log(sample([10, 20, 30, 40, 50, 60], 4));

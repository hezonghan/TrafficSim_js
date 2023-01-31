
// https://blog.csdn.net/dszgf5717/article/details/97394371
function sample(arr , final_length) {
    var shuffled_arr = arr.slice(0);
    for(var i=0 ; i < final_length ; i += 1) {
        var j = i + Math.floor((arr.length - i) * Math.random());  // i == j allowed
        
        var tmp = shuffled_arr[i];
        shuffled_arr[i] = shuffled_arr[j];
        shuffled_arr[j] = tmp;
        // console.log('i='+i+' , j='+j+' , shuffled_arr='+shuffled_arr);
    }
    return shuffled_arr.slice(0, final_length);
}

function binary_search(arr , target_objective , expect_lowest_index = true , objective_fn = ((x) => x) , eps = 1e-5) {
    // Note: Assumed arr is ascending. If descending, user can simply modify the objective_fn to return an opposite value.
    // console.log('\nbinary_search() : arr='+JSON.stringify(arr));

    if(arr.length == 0) return { 'state': 'empty_arr' };

    var lo = 0;
    var hi = arr.length - 1;
    // closed interval [lo , hi], that is, target satisfying : lo <= target_index <= hi.
    while( lo <= hi ) {
        var mid = Math.floor(lo + (hi - lo)/2);
        // console.log('\tlo='+lo+' , hi='+hi+' , mid='+mid);
        var mid_obj = objective_fn(arr[mid]);
        // console.log('\tlo='+lo+' , hi='+hi+' , mid='+mid+' , mid_obj='+mid_obj);
        if(mid_obj < target_objective - eps) {
            lo = mid + 1;
        }else if(mid_obj > target_objective + eps) {
            hi = mid - 1;
        }else {
            if(expect_lowest_index) {
                // if(mid == 0 || objective_fn(arr[mid-1]) < target_objective - eps) {
                //     return { 'state': 'found' , 'idx': mid };
                // }else {
                    hi = mid - 1;
                // }
            }else {
                // if(mid == arr.length - 1 || objective_fn(arr[mid+1]) > target_objective + eps) {
                //     return { 'state': 'found' , 'idx': mid };
                // }else {
                    lo = mid + 1;
                // }
            }
        }
    }
    // now, lo == hi + 1.
    // At most one of the  arr[lo] (exists if lo >= 0)  and  arr[hi] (exists if hi < len-1)  is the result.
    // console.log('finally lo='+lo+' , hi='+hi);

    if(       lo >= 0 && lo < arr.length && Math.abs(objective_fn(arr[lo]) - target_objective) <= eps ) {
        return { 'state': 'found' , 'idx': lo };

    }else if( hi >= 0 && hi < arr.length && Math.abs(objective_fn(arr[hi]) - target_objective) <= eps ) {
        return { 'state': 'found' , 'idx': hi };

    }else {
        return { 'state': 'not_found', 'idx_between': [hi, lo] };

    }
}

function range_binary_search(
        arr , 
        target_objective_lo , target_objective_hi , 
        // closed_lo = true, closed_hi = true, 
        objective_fn = ((x) => x),
        eps = 1e-5,
) {

    if(arr.length == 0) {
        // throw 'range_binary_search() : empty arr.';
        return [-1, -2];
    }

    // var bs_lo = binary_search(arr , target_objective_lo ,    closed_lo  , objective_fn , eps);
    // var bs_hi = binary_search(arr , target_objective_hi , (! closed_hi) , objective_fn , eps);

    var bs_lo = binary_search(arr , target_objective_lo , true  , objective_fn , eps);
    var bs_hi = binary_search(arr , target_objective_hi , false , objective_fn , eps);
    return [
        (bs_lo.state === 'found' ? bs_lo.idx : bs_lo.idx_between[1]),
        (bs_hi.state === 'found' ? bs_hi.idx : bs_hi.idx_between[0]),
    ];
}

export { sample , binary_search , range_binary_search };

// console.log(sample([10, 20, 30, 40, 50, 60], 4));

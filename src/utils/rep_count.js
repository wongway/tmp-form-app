// def count_reps(down_signal, threshold=5): 

//     last_x = down_signal[0]
//     count = 0
//     rep_count = 0
//     reps = []

//     for x in down_signal[1:]:
//         if (x == last_x+1):
//             count += 1
//         else:
//             if (count > threshold):
//                 reps.append(last_x)
//                 rep_count += 1
//             count = 0
//         last_x = x
        
//     # if the last down_signal element was also part of an ongoing rep
//     if (count > threshold):
//         reps.append(last_x)
//         rep_count += 1

//     print(reps)
//     print("Total:", rep_count)
    
//     return reps

function is_rep(signal, params) {
    var p = params || {};
    const threshold = p.threshold || 5;

    var count = 0;

    if(signal[signal.length-1] == 1) {
        return false;
    }

    for(let i=signal.length-2; i>=0; i--) {
        if (signal[i] != 1) {
            // console.log(i, signal.length);
            break;
        } else if(signal[i] == 1) {
            count++;
        }
    }

    if (count > threshold) {
        // console.log("Count: ", count, signal.slice(signal.length-count-2, signal.count));
        return true;
    } else {
        return false;
    }

}

module.exports = is_rep;
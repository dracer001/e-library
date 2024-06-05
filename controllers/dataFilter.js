const checkNull = (list, obj) => {
    let msg = '';
    
    list.forEach(item => {
        if (obj[item] === undefined) {
            msg += `\n${item} not found, must include ${item}.`;
        } else if (obj[item] === null || obj[item] === '') {
            msg += `\n${item} cannot be null or empty.`;
        }
    });

    return msg;
}


const dissalowKey = (list, obj) => {
    let msg = '';
    list.forEach(item => {
        if (obj[item] !== undefined) {
            msg += `\nunexpected key ${item} .`;
        }
    });
    return msg;
}

module.exports = { checkNull, dissalowKey };


// const checkNull = (list, array) => {
//     msg = ''
//     for( n in list){
//         item = list[n]
//         if(array?.item !== undefined){
//             if(!array.item){
//                 msg += `\n${item} cannot be null.`
//             }
//         }
//         else{ 
//             msg+= `\n ${item} not found, must include ${item}`
//         }
//     }
//     return msg
// }

// module.exports = {checkNull}
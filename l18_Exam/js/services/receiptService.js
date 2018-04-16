let receipts = (()=>{
    function getActiveReceipts(userId) {
        const endpoint = `receipts?query={"_acl.creator":"${userId}","active":"true"}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function createReceipt(author, active, productCount, total) {
        let data = {author, active, productCount, total };

        return remote.post('appdata', 'receipts', 'kinvey', data);
    }

    function updateReceipt( receiptId, active, productCount, total,date) {
        const endpoint = `receipts/${receiptId}`;
        let data = {  active, productCount, total};

        return remote.update('appdata', endpoint, 'kinvey', data);
    }


    function getMyReceipts(userId) {
        const endpoint = `receipts?query={"_acl.creator":"${userId}","active":"false"}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }

    function getReceiptById(receiptId) {
        const endpoint = `posts/${receiptId}`;

        return remote.get('appdata', endpoint, 'kinvey');
    }
    
    function checkForActiveReceipts(userId) {
        receipts.getActiveReceipts(userId).then((receipt)=>{
            let createPromise
            let recPromise
            if(receipt.length===0){
                 createPromise= receipts.createReceipt(userId,true,0,0)

                }else {recPromise= receipts.getActiveReceipts(userId)}
            Promise.all([createPromise,recPromise]).then((rec)=>{

                return rec[0] ? rec[0] !== undefined : rec[1]
            }).catch(notify.handleError)
            })
    }
    return{
    getActiveReceipts,
        getMyReceipts,
        getReceiptById,
        createReceipt,
        updateReceipt,
        checkForActiveReceipts
    }
})()